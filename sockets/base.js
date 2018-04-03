const util = require('util');
const axios = require('axios');
const session = require('../app').session;
const url = require('url');
const moment = require('moment');
const sharedsession = require('express-socket.io-session');

module.exports = function (io) {
    io.use(sharedsession(session, {autoSave: true}));
    let o;
    io.origins((origin, callback) => {
        const q = url.parse(origin);
        o = q.protocol + '//' + q.host;
        callback(null, true);
    });
    io.on('connection', function (socket) {
        let save;
        let refresh;
        const game = {
            info: null,
            unlockAchievement: {
                'maggie': {
                    isUnlock: () => {
                        if (game.info.donuts >= 10) {
                            return true;
                        }
                        return false;
                    }
                },
                'bart': {
                    isUnlock: () => {
                        if (game.info.donuts >= 200) {
                            return true;
                        }
                        return false;
                    }
                },
                'lisa': {
                    isUnlock: () => {
                        if (game.info.donuts >= 3000) {
                            return true;
                        }
                        return false;
                    }
                },
                'marge': {
                    isUnlock: () => {
                        if (game.info.donuts >= 40000) {
                            return true;
                        }
                        return false;
                    }
                },
                'homer': {
                    isUnlock: () => {
                        if (game.info.donuts >= 500000) {
                            return true;
                        }
                        return false;
                    }
                }
            },
            save: () => {
                axios({
                    method: 'put',
                    url: '/save',
                    baseURL: o,
                    data: {
                        id: socket.handshake.session.passport.user,
                        backup: game.info
                    }
                }).then((response) => {
                    //console.log(response.data);
                    if (response.data.saved) {
                        socket.emit('toast', 'Partie Sauvegardé !');
                        console.log(socket.handshake.session.passport.user + ' : Game successfully saved !');
                    } else {
                        socket.emit('toast', 'Une erreur est survenue lors de la sauvegarde !');
                        console.log(socket.handshake.session.passport.user + ' : Game not saved !');
                    }
                }).catch((error) => {
                    console.log(error);
                });
            },
            achievements: () => {
                for (const achievement in game.info.achievements) {
                    if (!game.info.achievements[achievement].enable) {
                        const regex = /\d/;
                        game.info.achievements[achievement].enable = game.info.extra[regex.exec(game.info.achievements[achievement].unlock)].enable = game
                            .unlockAchievement[achievement]
                            .isUnlock();
                        if (game.info.achievements[achievement].enable) {
                            socket.emit("toast", game.info.achievements[achievement].name);
                            socket.emit("enable", game.info.achievements[achievement].unlock);
                        }
                    }
                }
            },
            donutsPerSec: () => {
                game.info.donuts += game.info.donutsPerS / 100;
                game.info.donutsTot += game.info.donutsPerS / 100;
                game.achievements();
                socket.emit("getDonuts", game.info.donuts);
            },
            costTotal: (extra) => {
                let costTot = 0;
                for (let i = 0; i < game.info.buyMultiplier; i++) {
                    costTot += game.info.extra[extra].cost;
                    game.info.extra[extra].cost = Math.trunc(game.info.extra[extra].cost * 1.1);
                }

                return costTot;
            }
        };
        //console.log('Socket Session'); console.log(socket.handshake.session);
        const newGame = {
            donuts: 0,
            donutsPerS: 0,
            donutsPerC: 1,
            donutsTot: 0,
            clicks: 0,
            donutsOnClick: 0,
            countAll: 0,
            buyMultiplier: 1,
            start: moment().format(),
            options: {},
            extra: {
                1: {
                    enable: false,
                    name: 'Maggie',
                    count: 0,
                    cost: 10,
                    bonus: {
                        donutsPerSec: 5
                    }
                },
                2: {
                    enable: false,
                    name: 'Bart',
                    count: 0,
                    cost: 200,
                    bonus: {
                        donutsPerSec: 20
                    }
                },
                3: {
                    enable: false,
                    name: 'Lisa',
                    count: 0,
                    cost: 3000,
                    bonus: {
                        donutsPerSec: 40
                    }
                },
                4: {
                    enable: false,
                    name: 'Marge',
                    count: 0,
                    cost: 40000,
                    bonus: {
                        donutsPerSec: 500
                    }
                },
                5: {
                    enable: false,
                    name: 'Homer',
                    count: 0,
                    cost: 500000,
                    bonus: {
                        donutsPerSec: 2000
                    }
                }
            },
            achievements: {
                'maggie': {
                    name: 'Maggie débloqué',
                    enable: false,
                    unlock: '.extra1'
                },
                'bart': {
                    name: 'Bart débloqué !',
                    enable: false,
                    unlock: '.extra2'
                },
                'lisa': {
                    name: 'Lisa débloqué !',
                    enable: false,
                    unlock: '.extra3'
                },
                'marge': {
                    name: 'Marge débloqué !',
                    enable: false,
                    unlock: '.extra4'
                },
                'homer': {
                    name: 'Homer débloqué !',
                    enable: false,
                    unlock: '.extra5'
                }
            }
        };

        if ('passport' in socket.handshake.session) {
            axios({
                method: 'get',
                url: '/backup',
                baseURL: o,
                params: {
                    id: socket.handshake.session.passport.user
                }
            }).then((response) => {
                //console.log(response); console.log(response.data);
                if (response.data.backup !== null) {
                    if (util.isObject(response.data.backup)) {
                        game.info = response.data.backup;
                    } else {
                        game.info = JSON.parse(response.data.backup);
                    }
                    console.log(socket.handshake.session.passport.user + ' : Game Retrieve');
                } else {
                    game.info = newGame;
                    console.log(socket.handshake.session.passport.user + ' : New Game');
                }
                if (!game.info.hasOwnProperty('donutsPerC')) {
                    game.info.donutsPerC = 1;
                }
                //console.log(game);
                console.log(socket.handshake.session.passport.user + ' : Initialize game...');
                socket.emit('init', game.info);
                save = setInterval(game.save, 30000);
                refresh = setInterval(() => {
                    game.donutsPerSec();
                    socket.emit('getRefresh', game.info);
                }, 10);
            }).catch((error) => {
                console.log(error);
            });

            socket.on('addDonut', (data) => {
                game.info.donutsTot += game.info.donutsPerC;
                game.info.donutsOnClick += game.info.donutsPerC;
                game.info.donuts += game.info.donutsPerC;
                game.info.clicks++;
                game.achievements();
                socket.emit('getDonuts', game.info.donuts);
            });

            socket.on('addExtra', (extra) => {
                let cost = game.costTotal(extra);
                if (game.info.donuts >= cost) {
                    game.info.countAll += game.info.buyMultiplier;
                    game.info.extra[extra].count += game.info.buyMultiplier;
                    game.info.donuts -= cost;
                    game.info.donutsPerS += game.info.extra[extra].bonus.donutsPerSec * game.info.buyMultiplier;
                    socket.emit('getExtra', extra, game.info.extra[extra].count, game.info.donuts, game.info.donutsPerS,
                        game.info.extra[extra].cost);
                    socket.emit("playYesSong", extra);

                } else {
                    socket.emit("playNoSong", extra);
                    socket.emit('toast', 'Donuts insuffisant');
                }
            });

            socket.on('updateBuy', (value) => {
                game.info.buyMultiplier = value;
            });

            socket.on("disconnect", function () {
                game.save();
                clearInterval(save);
                clearInterval(refresh);
                console.log(socket.handshake.session.passport.user + ' : Exit Game');
            });
        }

    });
};