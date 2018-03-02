/* jshint esversion: 6*/
const socket = io();
// YesSong
const maggie = new Audio("https://www.memoclic.com/medias/sons-wav/0/8.mp3");
const bart = new Audio("");
const lisa = new Audio("");
const marge = new Audio("");
const homer = new Audio("https://www.memoclic.com/medias/sons-wav/0/8.mp3");
// NoSong
const NoMaggie = new Audio("");
const NoBart = new Audio("");
const NoLisa = new Audio("");
const NoMarge = new Audio("https://www.memoclic.com/medias/sons-wav/1/404.mp3");
const NoHomer = new Audio("http://www.soundboard.com/sb/sound/97830");

socket.on("init", game => {
  $(".nbDonuts").text(game.donuts);
  $(".donutsPerSec").text(game.donutsPerS);
  for (i = 1; i < 6; i++) {
    $(".extra" + i + " .extra-counter span").text(game.extra[i].count);
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

socket.on("getDonuts", function(data) {
  $(".nbDonuts").text(data);
  updateAchievement();
});

socket.on("toast", data => {
  Materialize.toast(data, 1000);
});

socket.on("enable", extra => {
  if (extra !== null) {
    $(extra).removeClass("disabled");
  }
});

socket.on("getExtra", (extra, count, donuts, donutsPerSec) => {
  $(".extra" + extra + " .extra-counter span").text(count);
  $(".nbDonuts").text(donuts);
  $(".donutsPerSec").text(donutsPerSec);
});

socket.on("playYesSong", extra => {
  switch (extra) {
    case 1:
      lisa.play();
      break;
    case 2:
      break;
    case 3:
      break;
    case 4:
      break;
    case 5:
      homer.play();
      break;
  }
});

socket.on("playNoSong", extra => {
  switch (extra) {
    case 1:
      break;
    case 2:
      break;
    case 3:
      break;
    case 4:
      NoMarge.play();
      break;
    case 5:
      NoHomer.play();
      break;
  }
});
