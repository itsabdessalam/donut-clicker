const axios = require('axios');

module.exports = function (io) {
    io.on('connection', function (socket) {
        let game;

        const newGame = {
            donuts: 0,
            donutsPerS: 0,
            donutsTot: 0,
            extra: {
                1: {
                    enable: false,
                    name: 'Maggie',
                    count: 0,
                    cost: 10,
                    bonus: {
                        donutsPerSec: 5,
                    },
                },
                2: {
                    enable: false,
                    name: 'Lisa',
                    count: 0,
                    cost: 200,
                    bonus: {
                        donutsPerSec: 20,
                    },
                },
                3: {
                    enable: false,
                    name: 'Bart',
                    count: 0,
                    cost: 3000,
                    bonus: {
                        donutsPerSec: 40,
                    },
                },
                4: {
                    enable: false,
                    name: 'Marge',
                    count: 0,
                    cost: 40000,
                    bonus: {
                        donutsPerSec: 500,
                    },
                },
                5: {
                    enable: false,
                    name: 'Homer',
                    count: 0,
                    cost: 500000,
                    bonus: {
                        donutsPerSec: 2000,
                    },
                },
            },
            achievements: [{
                    name: 'Maggie débloqué',
                    enable: false,
                    isUnlock: () => {
                        if (game.donuts >= 10) {
                            return true;
                        }
                        return false;
                    },
                    unlock: '.extra1',
                },
                {
                    name: 'Lisa débloqué !',
                    enable: false,
                    isUnlock: () => {
                        if (game.donuts >= 200) {
                            return true;
                        }
                        return false;
                    },
                    unlock: '.extra2',
                },
                {
                    name: 'Bart débloqué !',
                    enable: false,
                    isUnlock: () => {
                        if (game.donuts >= 3000) {
                            return true;
                        }
                        return false;
                    },
                    unlock: '.extra3',
                },
                {
                    name: 'Marge débloqué !',
                    enable: false,
                    isUnlock: () => {
                        if (game.donuts >= 40000) {
                            return true;
                        }
                        return false;
                    },
                    unlock: '.extra4',
                },
                {
                    name: 'Homer débloqué !',
                    enable: false,
                    isUnlock: () => {
                        if (game.donuts >= 500000) {
                            return true;
                        }
                        return false;
                    },
                    unlock: '.extra5',
                },

            ],
        };


        axios({
                method: 'get',
                url: '/backup',
                baseURL: 'http://localhost:3000',
            })
            .then((response) => {
                console.log(response);
                console.log(response.data);
                if (response.data.backup !== null) {
                    game = response.data.backup;
                    console.log('Game Retrieve');
                } else {
                    game = newGame;
                    console.log('New Game');
                }
                //console.log(game);
                console.log('Initialize game...');
                socket.emit('init', game);
                //setInterval(save, 30000);
                setInterval(donutsPerSec, 1000);
            })
            .catch((error) => {
                console.log(error);
            });

        function save() {
            axios({
                    method: 'put',
                    url: '/save',
                    baseURL: 'http://localhost:3000',
                    data: {
                        backup: game
                    },
                })
                .then((response) => {
                    console.log(response.data);
                    if (response.data.saved) {
                        socket.emit('toast', 'Partie Sauvegardé !');
                        console.log('saved');
                    } else {
                        socket.emit('toast', 'Une erreur est survenue lors de la sauvegarde !');
                        console.log('not saved');
                    }
                })
                .catch((error) => {
                    console.log(error);
                });
        }


        function achievements() {
            game.achievements.forEach(achievement => {
                if (!achievement.enable) {
                    achievement.enable = achievement.isUnlock();
                    if (achievement.enable) {
                        socket.emit("toast", achievement.name);
                        socket.emit("enable", achievement.unlock);
                    }
                }
            });
        }

        function donutsPerSec() {
            game.donuts += game.donutsPerS;
            game.donutsTot += game.donutsPerS;
            achievements();
            socket.emit("getDonuts", game.donuts);
        }


        socket.on('addDonut', (data) => {
            game.donutsTot += 1;
            game.donuts += 1;
            achievements();
            socket.emit('getDonuts', game.donuts);
        });

        socket.on('addExtra', (extra) => {
            if (game.donuts >= game.extra[extra].cost) {
                game.extra[extra].count++;
                game.donuts -= game.extra[extra].cost;
                game.donutsPerS += game.extra[extra].bonus.donutsPerSec;
                socket.emit('getExtra', extra, game.extra[extra].count, game.donuts, game.donutsPerS);
                socket.emit("playYesSong", extra);

            } else {
                socket.emit("playNoSong", extra);
                socket.emit('toast', 'Donuts insuffisant');
            }
        });

        socket.on("disconnect", function () {
            // Voir ce qu'on fait
        });
    });
};