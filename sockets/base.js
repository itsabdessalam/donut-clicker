module.exports = function(io) {
  io.on("connection", function(socket) {
    const game = {
      donuts: 0,
      donutsPerS: 0,
      donutsTot: 0,
      extra: {
        1: {
          enable: false,
          name: "Maggie",
          count: 0,
          cost: 10,
          bonus: {
            donutsPerSec: 5
          }
        },
        2: {
          enable: false,
          name: "Lisa",
          count: 0,
          cost: 200,
          bonus: {
            donutsPerSec: 20
          }
        },
        3: {
          enable: false,
          name: "Bart",
          count: 0,
          cost: 3000,
          bonus: {
            donutsPerSec: 40
          }
        },
        4: {
          enable: false,
          name: "Marge",
          count: 0,
          cost: 40000,
          bonus: {
            donutsPerSec: 500
          }
        },
        5: {
          enable: false,
          name: "Homer",
          count: 0,
          cost: 500000,
          bonus: {
            donutsPerSec: 2000
          }
        }
      },
      achievements: [
        {
          name: "Maggie débloqué",
          enable: false,
          isUnlock: () => {
            if (game.donutsTot >= 10) {
              return true;
            }
            return false;
          },
          unlock: ".extra1"
        },
        {
          name: "Lisa débloqué !",
          enable: false,
          isUnlock: () => {
            if (game.donutsTot >= 200) {
              return true;
            }
            return false;
          },
          unlock: ".extra2"
        },
        {
          name: "Bart débloqué !",
          enable: false,
          isUnlock: () => {
            if (game.donutsTot >= 3000) {
              return true;
            }
            return false;
          },
          unlock: ".extra3"
        },
        {
          name: "Marge débloqué !",
          enable: false,
          isUnlock: () => {
            if (game.donutsTot >= 40000) {
              return true;
            }
            return false;
          },
          unlock: ".extra4"
        },
        {
          name: "Homer débloqué !",
          enable: false,
          isUnlock: () => {
            if (game.donutsTot >= 500000) {
              return true;
            }
            return false;
          },
          unlock: ".extra5"
        }
      ]
    };

    socket.emit("init", game);

    socket.on("addDonut", data => {
      game.donutsTot += 1;
      game.donuts += 1;
      achievements();
      socket.emit("getDonuts", game.donuts);
    });

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

    setInterval(donutsPerSec, 1000);

    socket.on("addExtra", extra => {
      if (game.donuts > game.extra[extra].cost) {
        game.extra[extra].count++;
        game.donuts -= game.extra[extra].cost;
        game.donutsPerS += game.extra[extra].bonus.donutsPerSec;
        socket.emit(
          "getExtra",
          extra,
          game.extra[extra].count,
          game.donuts,
          game.donutsPerS
        );
        socket.emit("playYesSong", extra);
      } else {
        socket.emit("playNoSong", extra);
        socket.emit("toast", "Donuts insuffisant");
      }
    });

    socket.on("disconnect", function() {
      // Voir ce qu'on fait
    });
  });
};
