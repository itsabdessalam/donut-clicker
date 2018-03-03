const axios = require('axios');
const session = require('../app').session;
const sharedsession = require('express-socket.io-session');

module.exports = function (io) {
    io.use(sharedsession(session, {
        autoSave: true
    }));
    io.on('connection', function (socket) {
        const game = {
            info: null,
            unlockAchievement: [{
                    isUnlock: () => {
                        if (game.info.donuts >= 10) {
                            return true;
                        }
                        return false;
                    }
                },
                {
                    isUnlock: () => {
                        if (game.info.donuts >= 200) {
                            return true;
                        }
                        return false;
                    }
                },
                {
                    isUnlock: () => {
                        if (game.info.donuts >= 3000) {
                            return true;
                        }
                        return false;
                    }
                },
                {
                    isUnlock: () => {
                        if (game.info.donuts >= 40000) {
                            return true;
                        }
                        return false;
                    }
                },
                {
                    isUnlock: () => {
                        if (game.info.donuts >= 500000) {
                            return true;
                        }
                        return false;
                    }
                }
            ],
            save: () => {
                axios({
                        method: 'put',
                        url: '/save',
                        baseURL: 'http://localhost:3000',
                        data: {
                            id: socket.handshake.session.passport.user,
                            backup: game.info
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
            },
            achievements: () => {
                game.info.achievements.forEach((achievement, index) => {
                    if (!achievement.enable) {
                        const regex = /\d/;
                        achievement.enable = game.info.extra[regex.exec(achievement.unlock)].enable = game.unlockAchievement[index].isUnlock();
                        if (achievement.enable) {
                            socket.emit("toast", achievement.name);
                            socket.emit("enable", achievement.unlock);
                        }
                    }
                });
            },
            donutsPerSec: () => {
                game.info.donuts += game.info.donutsPerS;
                game.info.donutsTot += game.info.donutsPerS;
                game.achievements();
                socket.emit("getDonuts", game.info.donuts);
            },
        };
        //console.log('Socket Session');
        //console.log(socket.handshake.session);
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
                    unlock: '.extra1',
                },
                {
                    name: 'Lisa débloqué !',
                    enable: false,
                    unlock: '.extra2',
                },
                {
                    name: 'Bart débloqué !',
                    enable: false,
                    unlock: '.extra3',
                },
                {
                    name: 'Marge débloqué !',
                    enable: false,
                    unlock: '.extra4',
                },
                {
                    name: 'Homer débloqué !',
                    enable: false,
                    unlock: '.extra5',
                },

            ],
        };

        if ('passport' in socket.handshake.session) {

            axios({
                    method: 'get',
                    url: '/backup',
                    baseURL: 'http://localhost:3000',
                    params: {
                        id: socket.handshake.session.passport.user
                    }
                })
                .then((response) => {
                    //console.log(response);
                    console.log(response.data);
                    if (response.data.backup !== null) {
                        game.info = JSON.parse(response.data.backup);
                        console.log('Game Retrieve');
                    } else {
                        game.info = newGame;
                        console.log('New Game');
                    }
                    //console.log(game);
                    console.log('Initialize game...');
                    socket.emit('init', game.info);
                    setInterval(game.save, 30000);
                    setInterval(game.donutsPerSec, 1000);
                })
                .catch((error) => {
                    console.log(error);
                });




            socket.on('addDonut', (data) => {
                game.info.donutsTot += 1;
                game.info.donuts += 1;
                game.achievements();
                socket.emit('getDonuts', game.info.donuts);
            });

            socket.on('addExtra', (extra) => {
                if (game.info.donuts >= game.info.extra[extra].cost) {
                    game.info.extra[extra].count++;
                    game.info.donuts -= game.info.extra[extra].cost;
                    game.info.donutsPerS += game.info.extra[extra].bonus.donutsPerSec;
                    socket.emit('getExtra', extra, game.info.extra[extra].count, game.info.donuts, game.info.donutsPerS);
                    socket.emit("playYesSong", extra);

                } else {
                    socket.emit("playNoSong", extra);
                    socket.emit('toast', 'Donuts insuffisant');
                }
            });

        }

        socket.on("disconnect", function () {
            // Voir ce qu'on fait
        });
    });
};