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



const songs = {
  "YesSong": [{
    "maggie": new Audio("/songs/maggie.mp3"),
    "bart": new Audio("/songs/bart.mp3"),
    "lisa": new Audio("/songs/lisa.mp3"),
    "marge": new Audio("/songs/marge.mp3"),
    "homer": new Audio("/songs/homer.mp3"),
  }],
  "NoSong": [{
    "maggie": new Audio("/songs/NoMaggie.mp3"),
    "bart": new Audio("/songs/NotBart.mp3"),
    "lisa": new Audio("/songs/NoLisa.mp3"),
    "marge": new Audio("/songs/NoMarge.mp3"),
    "homer": new Audio("/songs/NoHomer.mp3"),
  }]
}

// on by default
$('.switchVolume').prop('checked', true);

if ($('.switchVolume').prop('checked') !== true) {
  for (key in songs.NoSong[0]) {
    songs.NoSong[0][key].muted = true;
  }
  for (key in songs.YesSong[0]) {
    songs.YesSong[0][key].muted = true;
  }
}

$('.switchVolume').change(function (evt) {
  if ($(this).prop('checked') !== true) {
    for (key in songs.NoSong[0]) {
      songs.NoSong[0][key].muted = true;
    }
    for (key in songs.YesSong[0]) {
      songs.YesSong[0][key].muted = true;
    }
  } else {
    for (key in songs.NoSong[0]) {
      songs.NoSong[0][key].muted = false;
    }
    for (key in songs.YesSong[0]) {
      songs.YesSong[0][key].muted = false;
    }
  }
});



socket.on('init', (game) => {
  console.log('Init Game...');
  $('.nbDonuts').text(beautifyNumber(game.donuts));
  $('.donutsPerSec').text(beautifyNumber(game.donutsPerS));
  $('.donutParticleNb').text('+' + beautifyNumber(game.donutsPerC, true));
  for (i = 1; i < 6; i++) {
    const extra = '.extra' + i;
    $(extra + ' .extra-counter span').text(beautifyNumber(game.extra[i].count, true));
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
  $(".extra" + extra + " .extra-counter span").text(beautifyNumber(count, true));
  $(".nbDonuts").text(beautifyNumber(donuts));
  $(".donutsPerSec").text(beautifyNumber(donutsPerSec));
});

socket.on("playYesSong", extra => {
  switch (extra) {
    case 1:
      songs.YesSong[0].maggie.play();
      break;
    case 2:
      songs.YesSong[0].bart.play();
      break;
    case 3:
      songs.YesSong[0].lisa.play();
      break;
    case 4:
      songs.YesSong[0].marge.play();
      break;
    case 5:
      songs.YesSong[0].homer.play();
      break;
  }
});

socket.on("playNoSong", extra => {
  switch (extra) {
    case 1:
      songs.NoSong[0].maggie.play();
      break;
    case 2:
      songs.NoSong[0].bart.play();
      break;
    case 3:
      songs.NoSong[0].lisa.play();
      break;
    case 4:
      songs.NoSong[0].marge.play();
      break;
    case 5:
      songs.NoSong[0].homer.play();
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

function beautifyNumber(number, istrunc = false) {

  let unitKey = 0;
  let trunc = true;

  const unit = {
    0: '',
    1: ' K',
    2: ' M',
    3: ' MD',
    4: ' BM',
    5: ' BMD',
  };

  while (number >= 1000) {
    trunc = false;
    number = precisionRound(number / 1000, 2);
    unitKey++;
  }

  trunc = istrunc ? true : false;

  return (trunc ? number : number.toFixed(2)) + unit[unitKey];
}

function precisionRound(number, precision) {
  var factor = Math.pow(10, precision);
  return Math.round(number * factor) / factor;
}