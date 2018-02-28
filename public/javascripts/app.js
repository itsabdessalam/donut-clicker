var socket = io(); // On se connecte au socket du serveur pour avoir les informations en temps réel

function updateData() {
    const nbDonuts = parseInt($('.nbDonuts').text());
    const donutsPerSec = parseInt($('.donutsPerSec').text());
    socket.emit('data', nbDonuts, donutsPerSec);
}
let data = setInterval(updateData, 1000);
// Si le socket nous informe qu'il y a une notification qui se nomme UserState, il executera le callback.
socket.on('UserState', function (data) {
    // nous insérons dans la span la valeur envoyée par le socket
    $('.connected-number').text(data);
});
socket.on('GetDonuts', function (data) {
    // nous insérons dans la span la valeur envoyée par le socket
    $('.nbDonuts').text(data);
});

$('#donutLink').click(() => {
    const nbDonuts = parseInt($('.nbDonuts').text());
    socket.emit('AddDonut', nbDonuts)
});