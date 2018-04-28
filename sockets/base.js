const util = require('util');
const axios = require('axios');
const session = require('../app').session;
const url = require('url');
const moment = require('moment');
const sharedsession = require('express-socket.io-session');

/*  INFOS SUR LE SOCKET
 *
 *  Utiliser la session => 'socket.handshake.session'
 *  Emettre un évenement => 'socket.emit('name', dataToSend)'
 *  Recevoir un évenement => 'socket.on('name', (dataSent) => Ce que tu dois faire avec )
 *
 *  Pour les ajouter des info dans le jeux, il y a 2 JSON
 *  - un qui contient toutes les info static (qui n'est pas sauvegardé en base)
 *  - un qui contient toutes les infos d'une partie (qui est sauvegardé en base)
 *
 *  A vous de voir si vous avez besoin de nouvelle info, et au besoin de le rajouter dans le JSON approprié
 */

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
        /*  INFOS SUR LE JSON
         *
         *  game.info => donné de l'utilisateur, par défault null, qui seront chargé lors de la connexion ou créer avec le JSON newGame
         *  game.unlockAchievement => objet contenant les fonctions permettant de savoir si un succés est débloqué
         *  game.save() => fonction permettant de sauvegarder la partie de l'utilisateur courant
         *  game.achievements() => fonction permettant d'actualiser l'affichage des succés lors de la connexion
         *  game.donutsPerSec() => fonction permettant d'ajouter les donuts/S, qui en réalité ajoute toutes les 100ms
         *  game.calcCost() => fonction permettant de calculer les coûts d'un extra, util lorsqu'on ajoute par 10 ou 100
         *  game.renewCost() => fonction permettant de mettre à jour les coûts d'un extra
         */
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
                        socket.emit('toast', 'Partie Sauvegardé !', game.info.options.notification);
                        console.log(socket.handshake.session.passport.user + ' : Game successfully saved !');
                    } else {
                        socket.emit('toast', 'Une erreur est survenue lors de la sauvegarde !', game.info.options.notification);
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
                            socket.emit("toast", game.info.achievements[achievement].name, game.info.options.notification);
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
            calcCost: (extra, round, cost) => {
                for (let i = 0; i < round; i++) {
                    cost = Math.trunc(cost * 1.1);
                }

                return cost;
            },
            renewCost: (baseCost, extra) => {
                for (let mult in game.info.extra[extra].cost) {
                    game.info.extra[extra].cost[mult] = game.calcCost(extra, mult, baseCost);
                }
            }
        };
        //console.log('Socket Session'); console.log(socket.handshake.session);

        /*  INFOS SUR LE JSON DE L'UTILISATEUR
         *
         *  newGame.donuts => nombre total de donuts depuis le début
         *  newGame.donutsPerS => nombre de donuts par seconde
         *  newGame.donutsPerC => nombre de donuts par click
         *  newGame.clicks => nombre de click depuis le début
         *  newGame.donutsOnClick => nombre de donuts gagné grâce à un click
         *  newGame.countAll => nombre total d'extra possédé
         *  newGame.buyMultiplier => nombre d'extra acheté par click
         *  newGame.start => date de début de la partie
         *  newGame.options => options du joueur (son, notif, theme ...)
         *  newGame.extra => stats détaillé sur chaque extra
         *  newGame.extra[x].enable => booléen indiquant si l'extra est débloqué
         *  newGame.extra[x].name => nom de l'extra
         *  newGame.extra[x].count => nombre d'extra possédé
         *  newGame.extra[x].cost => coût de l'extra
         *  newGame.extra[x].bonus => bonus de l'extra
         *  newGame.achievements => info sur les succès débloqué (va peut-être être deplacer dans le JSON game)
         *  newGame.achievements[x].name => intitulé du succès
         *  newGame.achievements[x].enable => booléen indiquant si le succès est débloqué
         *  newGame.achievements[x].unlock => classe CSS qui doit être débloqué
         */
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
            options: {
                'theme': 1,
                'volume': true,
                'music': true,
                'notification': true
            },
            extra: {
                1: {
                    enable: false,
                    name: 'Maggie',
                    count: 0,
                    cost: {
                        1: 10,
                        10: game.calcCost(1, 10, 10),
                        100: game.calcCost(1, 100, 10)
                    },
                    bonus: {
                        donutsPerSec: 5
                    }
                },
                2: {
                    enable: false,
                    name: 'Bart',
                    count: 0,
                    cost: {
                        1: 200,
                        10: game.calcCost(2, 10, 200),
                        100: game.calcCost(2, 100, 200)
                    },
                    bonus: {
                        donutsPerSec: 20
                    }
                },
                3: {
                    enable: false,
                    name: 'Lisa',
                    count: 0,
                    cost: {
                        1: 3000,
                        10: game.calcCost(3, 10, 3000),
                        100: game.calcCost(3, 100, 3000)
                    },
                    bonus: {
                        donutsPerSec: 40
                    }
                },
                4: {
                    enable: false,
                    name: 'Marge',
                    count: 0,
                    cost: {
                        1: 40000,
                        10: game.calcCost(4, 10, 40000),
                        100: game.calcCost(4, 100, 40000)
                    },
                    bonus: {
                        donutsPerSec: 500
                    }
                },
                5: {
                    enable: false,
                    name: 'Homer',
                    count: 0,
                    cost: {
                        1: 500000,
                        10: game.calcCost(5, 10, 500000),
                        100: game.calcCost(5, 100, 500000)
                    },
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

        // je vérifie si le joueur est connecté
        if ('passport' in socket.handshake.session) {
            // si c'est le cas j'essaye de récupérer une sauvegarde en base
            axios({
                method: 'get',
                url: '/backup',
                baseURL: o,
                params: {
                    id: socket.handshake.session.passport.user
                }
            }).then((response) => {
                // console.log(response); console.log(response.data);  si l'objet reçu contient
                // une sauvegarde
                if (response.data.backup !== null) {
                    //  je l'initialise dans le JSON du jeu
                    if (util.isObject(response.data.backup)) {
                        game.info = response.data.backup;
                    } else {
                        game.info = JSON.parse(response.data.backup);
                    }
                    console.log(socket.handshake.session.passport.user + ' : Game Retrieve');
                } else {
                    // sinon je créé une nouvelle partie
                    game.info = newGame;
                    console.log(socket.handshake.session.passport.user + ' : New Game');
                }
                if (!game.info.hasOwnProperty('donutsPerC')) {
                    game.info.donutsPerC = 1;
                }
                //console.log(game); Initialisation du jeu coté client
                console.log(socket.handshake.session.passport.user + ' : Initialize game...');
                socket.emit('init', game.info);
                // Lancement de la sauvegarde automatique et du racfraîchissement
                save = setInterval(game.save, 30000);
                refresh = setInterval(() => {
                    game.donutsPerSec();
                    socket.emit('getRefresh', game.info);
                }, 10);
            }).catch((error) => {
                console.log(error);
            });
            /*
             *  Tous les événements du sockets, ils onts des nom assez explicite
             *
             */

            socket.on('addDonut', (data) => {
                game.info.donutsTot += game.info.donutsPerC;
                game.info.donutsOnClick += game.info.donutsPerC;
                game.info.donuts += game.info.donutsPerC;
                game.info.clicks++;
                game.achievements();
                socket.emit('getDonuts', game.info.donuts);
            });

            socket.on('addExtra', (extra) => {
                let cost = game.info.extra[extra].cost[game.info.buyMultiplier];
                if (game.info.donuts >= cost) {
                    game.renewCost(cost, extra);
                    game.info.countAll += game.info.buyMultiplier;
                    game.info.extra[extra].count += game.info.buyMultiplier;
                    game.info.donuts -= cost;
                    game.info.donutsPerS += game.info.extra[extra].bonus.donutsPerSec * game.info.buyMultiplier;
                    socket.emit('getExtra', extra, game.info.extra[extra].count, game.info.donuts, game.info.donutsPerS, game.info.extra[extra].cost[game.info.buyMultiplier]);
                    socket.emit("playYesSong", extra);

                } else {
                    socket.emit("playNoSong", extra);
                    socket.emit('toast', 'Donuts insuffisant', game.info.options.notification);
                }
            });

            socket.on('updateBuy', (value) => {
                const buyMultiplier = parseInt(value);
                if (buyMultiplier !== game.info.buyMultiplier) {
                    game.info.buyMultiplier = buyMultiplier;
                    socket.emit('toast', 'Multipieur modifié !', game.info.options.notification);
                }
            });

            socket.on('setOption', (key, value) => {
                game.info.options[key] = value;
                // console.log(game.info.options.notification);
                console.log(game.info.options[key]);
                socket.emit('toast', 'Option modifiée !', game.info.options[key]);
            });

            // ajouter vos événements ici au besoin

            socket.on("disconnect", function () {
                game.save();
                clearInterval(save);
                clearInterval(refresh);
                console.log(socket.handshake.session.passport.user + ' : Exit Game');
            });
        }

    });
};