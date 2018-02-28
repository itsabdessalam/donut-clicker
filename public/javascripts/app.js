const socket = io();

function updateAchievement() {
  const nbDonuts = parseInt($(".nbDonuts").text());
  const donutsPerSec = parseInt($(".donutsPerSec").text());
  socket.emit("achievements", nbDonuts, donutsPerSec);
}

function addDonutsPerSecond() {
  const nbDonuts = parseInt($(".nbDonuts").text());
  const donutsPerSec = parseInt($(".donutsPerSec").text());
  socket.emit("dPs", nbDonuts, donutsPerSec);
}
setInterval(addDonutsPerSecond, 1000);

$("#donutLink").click(e => {
  e.preventDefault;
  const nbDonuts = parseInt($(".nbDonuts").text());
  socket.emit("AddDonut", nbDonuts);
  $("img").toggleClass("transition");
});

socket.on("GetDonuts", function(data) {
  $(".nbDonuts").text(data);
  updateAchievement();
});

socket.on("toast", data => {
  Materialize.toast(data, 50000);
});

socket.on("enable", extra => {
  $(extra).removeClass("disabled");
});
