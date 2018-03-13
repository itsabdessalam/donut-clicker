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
  console.log('Init Game...');
  $('.nbDonuts').text(beautifyNumber(game.donuts));
  $('.donutsPerSec').text(beautifyNumber(game.donutsPerS));
  $('.donutParticleNb').text('+' + beautifyNumber(game.donutsPerC));
  for (i = 1; i < 6; i++) {
    const extra = '.extra' + i;
    $(extra + ' .extra-counter span').text(beautifyNumber(game.extra[i].count));
    console.log(beautifyNumber(game.extra[i].count));
    console.log(typeof (game.extra[i].count));
    $(extra + ' .extra-infos .extra-cost').text(beautifyNumber(game.extra[i].cost));
    $(extra + ' .extra-infos .extra-title').text(game.extra[i].name);
    if (game.extra[i].enable) {
      $('.extra' + i).removeClass("disabled");
    } else {
      $(extra + ' .extra-head-img').addClass('hidden');
      $(extra + ' .extra-head-shadow').removeClass('hidden');
    }
  }
  console.log('Done');
});

$("#donutLink").click(() => {
  socket.emit("addDonut", true);
  // $("#donutLink img").toggleClass("transition");
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
  $('.nbDonuts').text(beautifyNumber(data));
});

socket.on("toast", data => {
  Materialize.toast(data, 1000);
});

socket.on("enable", extra => {
  if (extra !== null) {
    $(extra).removeClass('disabled');
    $(extra + ' .extra-head-img').removeClass('hidden');
    $(extra + ' .extra-head-shadow').addClass('hidden');
  }
});

socket.on("getExtra", (extra, count, donuts, donutsPerSec, costExtra) => {
  $(".extra" + extra + " .extra-infos .extra-cost").text(beautifyNumber(costExtra));
  $(".extra" + extra + " .extra-counter span").text(beautifyNumber(count));
  $(".nbDonuts").text(beautifyNumber(donuts));
  $(".donutsPerSec").text(beautifyNumber(donutsPerSec));
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

socket.on('getRefresh', (infos) => {

  for (let property in infos.extra) {
    if (infos.extra[property].cost > infos.donuts) {
      $('.extra' + property).addClass('disabled');
    } else {
      $('.extra' + property).removeClass('disabled');
    }
  }
});

function beautifyNumber(number) {

  let unitKey = 0;

  const unit = {
    0: '',
    1: ' K',
    2: ' M',
    3: ' MD',
    4: ' BM',
    5: ' BMD',
  };

  while (number >= 1000) {
    number = precisionRound(number / 1000, 2);
    unitKey++;
  }

  return number.toFixed(2) + unit[unitKey];
}

function precisionRound(number, precision) {
  var factor = Math.pow(10, precision);
  return Math.round(number * factor) / factor;
}