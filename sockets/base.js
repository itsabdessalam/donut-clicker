module.exports = function (io) {
    io.on('connection', function (socket) {

        socket.on('AddDonut', (data) => {
            const nbDonuts = data + 1;
            socket.emit('GetDonuts', nbDonuts);
        });

        socket.on('achievements', (nbDonuts, donutsPerSec) => {
            switch (nbDonuts) {
                case 10:
                    socket.emit('toast', "je suis un toast");
                    socket.emit('enable', '.extra1');
                    break;
                case 20:
                    socket.emit('toast', "je suis un toast");
                    socket.emit('enable', '.extra2');
                    break;
                case 50:
                    socket.emit('toast', "je suis un toast");
                    socket.emit('enable', '.extra3');
                    break;
                case 100:
                    socket.emit('toast', "je suis un toast");
                    socket.emit('enable', '.extra4');
                    break;
            }
        });

        socket.on('dPs', (nbDonuts, donutsPerSec) => {
            const nbDonutsTot = nbDonuts + donutsPerSec;
            socket.emit('GetDonuts', nbDonutsTot);
        });

        socket.on('disconnect', function () {
            // Voir ce qu'on fait 
        });
    });
};