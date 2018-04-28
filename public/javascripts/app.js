/* jshint esversion: 6*/
const socket = io();
// // YesSong const maggie = new Audio("/songs/maggie.mp3"); const bart = new
// Audio("/songs/bart.mp3"); const lisa = new Audio("/songs/lisa.mp3"); const
// marge = new Audio("/songs/marge.mp3"); const homer = new
// Audio("/songs/homer.mp3"); // NoSong const NoMaggie = new
// Audio("/songs/NoMaggie.mp3"); const NoBart = new Audio("/songs/NoBart.mp3");
// const NoLisa = new Audio("/songs/NoLisa.mp3"); const NoMarge = new
// Audio("/songs/NoMarge.mp3"); const NoHomer = new Audio("/songs/NoHomer.mp3");

const songs = {
  "Intro": {
    "instru": new Audio("/songs/intro.mp3")
  },
  "YesSong": [
    {
      "maggie": new Audio("/songs/maggie.mp3"),
      "bart": new Audio("/songs/bart.mp3"),
      "lisa": new Audio("/songs/lisa.mp3"),
      "marge": new Audio("/songs/marge.mp3"),
      "homer": new Audio("/songs/homer.mp3")
    }
  ],
  "NoSong": [
    {
      "maggie": new Audio("/songs/NoMaggie.mp3"),
      "bart": new Audio("/songs/NoBart.mp3"),
      "lisa": new Audio("/songs/NoLisa.mp3"),
      "marge": new Audio("/songs/NoMarge.mp3"),
      "homer": new Audio("/songs/NoHomer.mp3")
    }
  ]
};

//music colors theme default

$(".gradient1").click(() => {
  $('body').css("background-image", "linear-gradient(to bottom right, #4086f6, #2f5ca0)");
  socket.emit('setOption', 'theme', 1);
});
$(".gradient2").click(() => {
  $('body').css("background-image", "linear-gradient(to top, #f77062 0%, #fe5196 100%)");
  socket.emit('setOption', 'theme', 2);
});
$(".gradient3").click(() => {
  $('body').css("background-image", "linear-gradient(-20deg, rgb(0, 205, 172) 0%, rgb(141, 170, 218) 100%)");
  socket.emit('setOption', 'theme', 3);
});
$(".gradient4").click(() => {
  $('body').css("background-image", "linear-gradient(-20deg, #fc6076 0%, #ff9a44 100%)");
  socket.emit('setOption', 'theme', 4);
});

// changer langue ? à enlever si non utilisé $('.opt-langages
// input[type="checkbox"]').on('change', function () {   $('.opt-langages
// input[type="checkbox"]')     .not(this)     .prop('checked', false); }); on
// by default

$('.switchVolume').change(function (evt) {
  if ($(this).prop('checked') !== true) {
    songs.Intro.instru.muted = true;
    for (key in songs.NoSong[0]) {
      songs.NoSong[0][key].muted = true;
    }
    for (key in songs.YesSong[0]) {
      songs.YesSong[0][key].muted = true;
    }
  } else {
    songs.Intro.instru.muted = false;
    for (key in songs.NoSong[0]) {
      songs.NoSong[0][key].muted = false;
    }
    for (key in songs.YesSong[0]) {
      songs.YesSong[0][key].muted = false;
    }
  }
});

if ($('.switchMusic').prop('checked') !== true) {
  songs.Intro.instru.muted = true
}

$('.switchMusic')
  .change(function (evt) {
    if ($(this).prop('checked') !== true) {
      songs.Intro.instru.muted = true
    } else {
      songs.Intro.instru.muted = false
    }
  });
// changement option des notification
$('.notifications .switchNotifs').click(() => {
  // console.log($('.notifications .switchVolume').prop('checked'));
  socket.emit('setOption', 'notification', $('.notifications .switchNotifs').prop('checked'));
});
$('.switchVolume').click(() => {
  socket.emit('setOption', 'volume', $('.switchVolume').prop('checked'));
  if ($('.switchVolume').prop('checked')) {
    for (let key in songs.NoSong[0]) {
      songs.NoSong[0][key].muted = false;
    }
    for (let key in songs.YesSong[0]) {
      songs.YesSong[0][key].muted = false;
    }
  } else {
    for (let key in songs.NoSong[0]) {
      songs.NoSong[0][key].muted = true;
    }
    for (let key in songs.YesSong[0]) {
      songs.YesSong[0][key].muted = true;
    }
  }
});

$('.switchMusic').click(() => {
  socket.emit('setOption', 'music', $('.switchMusic').prop('checked'));
});

socket.on('init', (game) => {
  console.log('Init Game...');
  songs.Intro.instru.loop = true;
  songs.Intro.instru.volume = 0.3;
  songs
    .Intro
    .instru
    .play();
  switch (game.options.theme) {
    case 1:
      $('body').css("background-image", "linear-gradient(to bottom right, #4086f6, #2f5ca0)");
      break;
    case 2:
      $('body').css("background-image", "linear-gradient(to top, #f77062 0%, #fe5196 100%)");
      break;
    case 3:
      $('body').css("background-image", "linear-gradient(-20deg, rgb(0, 205, 172) 0%, rgb(141, 170, 218) 100%)");
      break;
    case 4:
      $('body').css("background-image", "linear-gradient(-20deg, #fc6076 0%, #ff9a44 100%)");
      break;
    default:
      $('body').css("background-image", "linear-gradient(to bottom right, #4086f6, #2f5ca0)");
      break;
  }

  $('.switchVolume').prop('checked', game.options.volume);
  $('.switchMusic').prop('checked', game.options.music);
  if ($('.switchVolume').prop('checked')) {
    for (let key in songs.NoSong[0]) {
      songs.NoSong[0][key].muted = false;
    }
    for (let key in songs.YesSong[0]) {
      songs.YesSong[0][key].muted = false;
    }
  } else {
    for (let key in songs.NoSong[0]) {
      songs.NoSong[0][key].muted = true;
    }
    for (let key in songs.YesSong[0]) {
      songs.YesSong[0][key].muted = true;
    }
  }
  // console.log($('.notifications .switchVolume').prop('checked'));
  $('.notifications .switchNotifs').prop('checked', game.options.notification);
  // console.log($('.notifications .switchVolume').prop('checked'));
  $('.nbDonuts').text(beautifyNumber(game.donuts));
  document.title = '' + beautifyNumber(game.donuts) + ' donuts - Donut Clicker';
  // $('title').text(beautifyNumber(game.donuts) + ' donuts - Donut Clicker');
  $('.donutsPerSec').text(beautifyNumber(game.donutsPerS));
  $('.donutParticleNb').text('+' + beautifyNumber(game.donutsPerC, true));
  for (i = 1; i < 6; i++) {
    const extra = '.extra' + i;
    $(extra + ' .extra-counter span').text(beautifyNumber(game.extra[i].count, true));
    $(extra + ' .extra-infos .extra-cost').text(beautifyNumber(game.extra[i].cost[game.buyMultiplier]));
    $(extra + ' .extra-infos .extra-title').text(game.extra[i].name);
    if (game.extra[i].enable) {
      $('.extra' + i).removeClass("disabled");
    } else {
      $(extra + ' .extra-head-img').addClass('hidden');
      $(extra + ' .extra-head-shadow').removeClass('hidden');
    }
  }
  $('#value' + game.buyMultiplier).prop('checked', true);
  console.log('Done');
});

$("#donutLink").click(() => {
  socket.emit("addDonut", true);
  // $("#donutLink img").toggleClass("transition");
});

// change le multiplier au click
$('input[name=group1]').click(() => {
  socket.emit('updateBuy', $('input[name=group1]:checked').val());
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
  document.title = '' + beautifyNumber(data) + ' donuts - Donut Clicker';
  // $('title').text(beautifyNumber(data) + ' donuts - Donut Clicker');
});

socket.on("toast", (data, display) => {
  if (display) 
    Materialize.toast(data, 1000);
  }
);

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
      songs
        .YesSong[0]
        .maggie
        .play();
      break;
    case 2:
      songs
        .YesSong[0]
        .bart
        .play();
      break;
    case 3:
      songs
        .YesSong[0]
        .lisa
        .play();
      break;
    case 4:
      songs
        .YesSong[0]
        .marge
        .play();
      break;
    case 5:
      songs
        .YesSong[0]
        .homer
        .play();
      break;
  }
});

socket.on("playNoSong", extra => {
  switch (extra) {
    case 1:
      songs
        .NoSong[0]
        .maggie
        .play();
      break;
    case 2:
      songs
        .NoSong[0]
        .bart
        .play();
      break;
    case 3:
      songs
        .NoSong[0]
        .lisa
        .play();
      break;
    case 4:
      songs
        .NoSong[0]
        .marge
        .play();
      break;
    case 5:
      songs
        .NoSong[0]
        .homer
        .play();
      break;
  }
});

socket.on('getRefresh', (infos) => {
  for (let property in infos.extra) {
    $('.extra' + property + ' .extra-cost').text(beautifyNumber(infos.extra[property].cost[infos.buyMultiplier]));
    if (infos.extra[property].cost[infos.buyMultiplier] > infos.donuts) {
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
    5: ' BMD'
  };

  while (number >= 1000) {
    trunc = false;
    number = precisionRound(number / 1000, 2);
    unitKey++;
  }

  trunc = istrunc
    ? true
    : false;

  return (trunc
    ? number
    : number.toFixed(2)) + unit[unitKey];
}

function precisionRound(number, precision) {
  var factor = Math.pow(10, precision);
  return Math.round(number * factor) / factor;
}