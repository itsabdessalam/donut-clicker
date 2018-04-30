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
    io.use(sharedsession(session, {
        autoSave: true
    }));
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
         *  game.achievements => objet contenant tout ce qui concerne les succès
         *  game.achievements.setAchievements() => fonction permettant d'actualiser l'affichage des succés
         *  game.save() => fonction permettant de sauvegarder la partie de l'utilisateur courant
         *  game.donutsPerSec() => fonction permettant d'ajouter les donuts/S, qui en réalité ajoute toutes les 100ms
         *  game.calcCost() => fonction permettant de calculer les coûts d'un extra, util lorsqu'on ajoute par 10 ou 100
         *  game.renewCost() => fonction permettant de mettre à jour les coûts d'un extra
         */
        const game = {
            info: null,
            achievements: {
                setAchievements: () => {
                    for (let achievement in game.info.achievements) {
                        for (let item in game.info.achievements[achievement]) {
                            if (!game.info.achievements[achievement][item]) {
                                game.info.achievements[achievement][item] = game
                                    .achievements
                                    .items[achievement][item]
                                    .isUnlock();
                                if (game.info.achievements[achievement][item]) {
                                    socket.emit("toast", game.achievements.items[achievement][item].name, game.info.options.notification);
                                    if (item == 'enable') {
                                        socket.emit("enable", game.achievements.items[achievement][item].unlock);
                                    } else {
                                        socket.emit('unlock', game.achievements.items[achievement][item]);
                                    }
                                }
                            }
                        }
                    }
                },
                items: {
                    1: {
                        enable: {
                            name: 'Vous avez débloqué Maggie',
                            desc: 'Avoir 10 donuts depuis le début',
                            unlock: '.extra1',
                            isUnlock: () => {
                                if (game.info.donutsTot >= 10) {
                                    return true;
                                }
                                return false;
                            }
                        },
                        1: {
                            name: 'Succès : Ma première Maggie',
                            desc: 'Posséder 1 Maggie',
                            unlock: '#maggie-1',
                            isUnlock: () => {
                                if (game.info.extra[1].count >= 1) {
                                    return true;
                                }
                                return false;
                            }
                        },
                        10: {
                            name: 'Succès : Amateur de Maggie',
                            desc: 'Posséder 10 Maggie',
                            unlock: '#maggie-2',
                            isUnlock: () => {
                                if (game.info.extra[1].count >= 10) {
                                    return true;
                                }
                                return false;
                            }
                        },
                        100: {
                            name: 'Succès : Fan de Maggie',
                            desc: 'Posséder 100 Maggie',
                            unlock: '#maggie-3',
                            isUnlock: () => {
                                if (game.info.extra[1].count >= 100) {
                                    return true;
                                }
                                return false;
                            }
                        },
                        1000: {
                            name: 'Succès : Collectionneur de Maggie',
                            desc: 'Posséder 1 K Maggie',
                            unlock: '#maggie-4',
                            isUnlock: () => {
                                if (game.info.extra[1].count >= 1000) {
                                    return true;
                                }
                                return false;
                            }
                        }
                    },
                    2: {
                        enable: {
                            name: 'Vous avez débloqué Bart',
                            desc: 'Avoir 200 donuts depuis le début',
                            unlock: '.extra2',
                            isUnlock: () => {
                                if (game.info.donutsTot >= 200) {
                                    return true;
                                }
                                return false;
                            }
                        },
                        1: {
                            name: 'Succès : Mon premier Bart',
                            desc: 'Posséder 1 Bart',
                            unlock: '#bart-1',
                            isUnlock: () => {
                                if (game.info.extra[2].count >= 1) {
                                    return true;
                                }
                                return false;
                            }
                        },
                        10: {
                            name: 'Succès : Amateur de Bart',
                            desc: 'Posséder 10 Bart',
                            unlock: '#bart-2',
                            isUnlock: () => {
                                if (game.info.extra[2].count >= 10) {
                                    return true;
                                }
                                return false;
                            }
                        },
                        100: {
                            name: 'Succès : Fan de Bart',
                            desc: 'Posséder 100 Bart',
                            unlock: '#bart-3',
                            isUnlock: () => {
                                if (game.info.extra[2].count >= 100) {
                                    return true;
                                }
                                return false;
                            }
                        },
                        1000: {
                            name: 'Succès : Collectionneur de Bart',
                            desc: 'Posséder 1 K Bart',
                            unlock: '#bart-4',
                            isUnlock: () => {
                                if (game.info.extra[2].count >= 1000) {
                                    return true;
                                }
                                return false;
                            }
                        }
                    },
                    3: {
                        enable: {
                            name: 'Vous avez débloqué Lisa',
                            desc: 'Avoir 3 K donuts depuis le début',
                            unlock: '.extra3',
                            isUnlock: () => {
                                if (game.info.donutsTot >= 3000) {
                                    return true;
                                }
                                return false;
                            }
                        },
                        1: {
                            name: 'Succès : Ma première Lisa',
                            desc: 'Posséder 1 Lisa',
                            unlock: '#lisa-1',
                            isUnlock: () => {
                                if (game.info.extra[3].count >= 1) {
                                    return true;
                                }
                                return false;
                            }
                        },
                        10: {
                            name: 'Succès : Amateur de Lisa',
                            desc: 'Posséder 10 Lisa',
                            unlock: '#lisa-2',
                            isUnlock: () => {
                                if (game.info.extra[3].count >= 10) {
                                    return true;
                                }
                                return false;
                            }
                        },
                        100: {
                            name: 'Succès : Fan de Lisa',
                            desc: 'Posséder 100 Lisa',
                            unlock: '#lisa-3',
                            isUnlock: () => {
                                if (game.info.extra[3].count >= 100) {
                                    return true;
                                }
                                return false;
                            }
                        },
                        1000: {
                            name: 'Succès : Collectionneur de Lisa',
                            desc: 'Posséder 1 K Lisa',
                            unlock: '#lisa-4',
                            isUnlock: () => {
                                if (game.info.extra[3].count >= 1000) {
                                    return true;
                                }
                                return false;
                            }
                        }
                    },
                    4: {
                        enable: {
                            name: 'Vous avez débloqué Marge',
                            desc: 'Avoir 40 K donuts depuis le début',
                            unlock: '.extra4',
                            isUnlock: () => {
                                if (game.info.donutsTot >= 40000) {
                                    return true;
                                }
                                return false;
                            }
                        },
                        1: {
                            name: 'Succès : Ma première Marge',
                            desc: 'Posséder 1 Marge',
                            unlock: '#marge-1',
                            isUnlock: () => {
                                if (game.info.extra[4].count >= 1) {
                                    return true;
                                }
                                return false;
                            }
                        },
                        10: {
                            name: 'Succès : Amateur de Marge',
                            desc: 'Posséder 10 Marge',
                            unlock: '#marge-2',
                            isUnlock: () => {
                                if (game.info.extra[4].count >= 10) {
                                    return true;
                                }
                                return false;
                            }
                        },
                        100: {
                            name: 'Succès : Fan de Marge',
                            desc: 'Posséder 100 Marge',
                            unlock: '#marge-3',
                            isUnlock: () => {
                                if (game.info.extra[4].count >= 100) {
                                    return true;
                                }
                                return false;
                            }
                        },
                        1000: {
                            name: 'Succès : Collectionneur de Marge',
                            desc: 'Posséder 1 K Marge',
                            unlock: '.marge-4',
                            isUnlock: () => {
                                if (game.info.extra[4].count >= 1000) {
                                    return true;
                                }
                                return false;
                            }
                        }
                    },
                    5: {
                        enable: {
                            name: 'Vous avez débloqué Homer',
                            desc: 'Avoir 500 K donuts depuis le début',
                            unlock: '.extra5',
                            isUnlock: () => {
                                if (game.info.donutsTot >= 500000) {
                                    return true;
                                }
                                return false;
                            }
                        },
                        1: {
                            name: 'Succès : Mon premier Homer',
                            desc: 'Posséder 1 Homer',
                            unlock: '#homer-1',
                            isUnlock: () => {
                                if (game.info.extra[5].count >= 1) {
                                    return true;
                                }
                                return false;
                            }
                        },
                        10: {
                            name: 'Succès : Amateur de Homer',
                            desc: 'Posséder 10 Homer',
                            unlock: '.homer-2',
                            isUnlock: () => {
                                if (game.info.extra[5].count >= 10) {
                                    return true;
                                }
                                return false;
                            }
                        },
                        100: {
                            name: 'Succès : Fan de Homer',
                            desc: 'Posséder 100 Homer',
                            unlock: '#homer-3',
                            isUnlock: () => {
                                if (game.info.extra[5].count >= 100) {
                                    return true;
                                }
                                return false;
                            }
                        },
                        1000: {
                            name: 'Succès : Collectionneur de Homer',
                            desc: 'Posséder 1 K Homer',
                            unlock: '#homer-4',
                            isUnlock: () => {
                                if (game.info.extra[5].count >= 1000) {
                                    return true;
                                }
                                return false;
                            }
                        }
                    },
                    donuts: {
                        1: {
                            name: 'Succès : Goinfre',
                            desc: 'Avoir 1 MD de donuts depuis le début',
                            unlock: '#surprise-1',
                            isUnlock: () => {
                                if (game.info.donutsTot >= 1000000000) {
                                    return true;
                                }
                                return false;
                            }
                        },
                        2: {
                            name: 'Succès : Collectionneur de donuts',
                            desc: 'Avoir 100 M de donuts',
                            unlock: '#surprise-2',
                            isUnlock: () => {
                                if (game.info.donuts >= 100000000) {
                                    return true;
                                }
                                return false;
                            }
                        },
                        3: {
                            name: 'Succès : Prodige du click',
                            desc: 'Faire 100 K click',
                            unlock: '#surprise-3',
                            isUnlock: () => {
                                if (game.info.clicks >= 100000) {
                                    return true;
                                }
                                return false;
                            }
                        },
                        4: {
                            name: 'Succès : Collectionneur de Simpson',
                            desc: 'Avoir 10 K Simpson',
                            unlock: '#surprise-4',
                            isUnlock: () => {
                                if (game.info.countAll >= 10000) {
                                    return true;
                                }
                                return false;
                            }
                        },
                        5: {
                            name: 'Succès : Roi du Donuts',
                            desc: 'Gagner 1 M de donuts par seconde',
                            unlock: '#surprise-5',
                            isUnlock: () => {
                                if (game.info.donutsPerS >= 1000000) {
                                    return true;
                                }
                                return false;
                            }
                        }
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
            donutsPerSec: () => {
                game.info.donuts += game.info.donutsPerS / 100;
                game.info.donutsTot += game.info.donutsPerS / 100;
                game
                    .achievements
                    .setAchievements();
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
         *  newGame.donuts => nombre de donuts possédé
         *  newGame.donutsPerS => nombre de donuts par seconde
         *  newGame.donutsPerC => nombre de donuts par click
         *  newGame.donutsTot => nombre total de donuts depuis le début
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
                1: {
                    enable: false,
                    1: false,
                    10: false,
                    100: false,
                    1000: false
                },
                2: {
                    enable: false,
                    1: false,
                    10: false,
                    100: false,
                    1000: false
                },
                3: {
                    enable: false,
                    1: false,
                    10: false,
                    100: false,
                    1000: false
                },
                4: {
                    enable: false,
                    1: false,
                    10: false,
                    100: false,
                    1000: false
                },
                5: {
                    enable: false,
                    1: false,
                    10: false,
                    100: false,
                    1000: false
                },
                donuts: {
                    1: false,
                    2: false,
                    3: false,
                    4: false,
                    5: false
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
                socket.emit('init', game.info, game.achievements.items);
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
                game
                    .achievements
                    .setAchievements();
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
                // console.log(game.info.options[key]);
                socket.emit('toast', 'Option modifiée !', game.info.options.notification);
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