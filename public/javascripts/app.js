const socket = io();

socket.on('init', (game) => {
    $('.nbDonuts').text(game.donuts);
    $('.donutsPerSec').text(game.donutsPerS);
    for (i = 1; i < 6; i++) {
        $('.extra' + i + ' .extra-counter span').text(game.extra[i].count);
    }
});

$('#donutLink').click(() => {
    socket.emit('addDonut', true);
    $('#donutLink img').toggleClass('transition');
});

$('.extra1').click(() => {
    socket.emit('addExtra', 1);
});
$('.extra2').click(() => {
    socket.emit('addExtra', 2);
});
$('.extra3').click(() => {
    socket.emit('addExtra', 3);
});
$('.extra4').click(() => {
    socket.emit('addExtra', 4);
});
$('.extra5').click(() => {
    socket.emit('addExtra', 5);
});

socket.on('getDonuts', function (data) {
    $('.nbDonuts').text(data);
    updateAchievement();
});

socket.on('toast', (data) => {
    Materialize.toast(data, 1000);
});

socket.on('enable', (extra) => {
    if (extra !== null) {
        $(extra).removeClass('disabled');
    }
});

socket.on('getExtra', (extra, count, donuts, donutsPerSec) => {
    $('.extra' + extra + ' .extra-counter span').text(count);
    $('.nbDonuts').text(donuts);
    $('.donutsPerSec').text(donutsPerSec);
});