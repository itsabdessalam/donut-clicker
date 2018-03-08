/* jshint esversion: 6*/
const socket = io();
// YesSong
const maggie = new Audio("/songs/maggie.mp3");
const bart = new Audio("/songs/bart.mp3");
const lisa = new Audio("/songs/lisa.mp3");
const marge = new Audio("/songs/marge.mp3");
const homer = new Audio("/songs/homer.mp3");
// NoSong
const NoMaggie = new Audio("/songs/NoMaggie.mp3");
const NoBart = new Audio("/songs/NoBart.mp3");
const NoLisa = new Audio("/songs/NoLisa.mp3");
const NoMarge = new Audio("/songs/NoMarge.mp3");
const NoHomer = new Audio("/songs/NoHomer.mp3");

socket.on('init', (game) => {
  $('.nbDonuts').text(game.donuts);
  $('.donutsPerSec').text(game.donutsPerS);
  for (i = 1; i < 6; i++) {
    const extra = '.extra' + i;
    $(extra + ' .extra-counter span').text(game.extra[i].count);
    $(extra + ' .extra-infos .extra-cost').text(game.extra[i].cost);
    $(extra + ' .extra-infos .extra-title').text(game.extra[i].name);
    if (game.extra[i].enable) {
      $('.extra' + i).removeClass("disabled");
    }
  }
});

$("#donutLink").click(() => {
  socket.emit("addDonut", true);
  $("#donutLink img").toggleClass("transition");
});

$(".extra1").click(() => {
  socket.emit("addExtra", 1);
});
$(".extra2").click(() => {
  socket.emit("addExtra", 2);
});
$(".extra3").click(() => {
  socket.emit("addExtra", 3);
});
$(".extra4").click(() => {
  socket.emit("addExtra", 4);
});
$(".extra5").click(() => {
  socket.emit("addExtra", 5);
});

socket.on('getDonuts', function (data) {
  $('.nbDonuts').text(Math.trunc(data));
});

socket.on("toast", data => {
  Materialize.toast(data, 1000);
});

socket.on("enable", extra => {
  if (extra !== null) {
    $(extra).removeClass("disabled");
  }
});

socket.on("getExtra", (extra, count, donuts, donutsPerSec, costExtra) => {
  $(".extra" + extra + " .extra-infos .extra-cost").text(costExtra);
  $(".extra" + extra + " .extra-counter span").text(count);
  $(".nbDonuts").text(donuts);
  $(".donutsPerSec").text(donutsPerSec);
});

socket.on("playYesSong", extra => {
  switch (extra) {
    case 1:
      maggie.play();
      break;
    case 2:
      bart.play();
      break;
    case 3:
      lisa.play();
      break;
    case 4:
      marge.play();
      break;
    case 5:
      homer.play();
      break;
  }
});

socket.on("playNoSong", extra => {
  switch (extra) {
    case 1:
      NoMaggie.play();
      break;
    case 2:
      NoBart.play();
      break;
    case 3:
      NoLisa.play();
      break;
    case 4:
      NoMarge.play();
      break;
    case 5:
      NoHomer.play();
      break;
  }
});