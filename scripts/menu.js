// gamespace.style.display = "none";
var storage = "https://api.myjson.com/bins/fums3";

var startButton = document.getElementById("startButton");
var recordButton = document.getElementById("recordButton");
var menuArea = document.getElementById("menu");
var recordArea = document.getElementById("recordContainer");
var container = document.getElementById("wrapper");

startButton.onclick = function () {
  menuArea.style.display = "none";
  container.style.border = "none";

  setChronoListener();

  newGame();
  chrono.start({
    precision: "secondTenths",
  });
};

recordButton.onclick = function () {
  menuArea.style.display = "none";
  recordArea.style.display = "block";
};

function setChronoListener() {
  chrono.addEventListener("secondTenthsUpdated", function (e) {
    $("#pointsArea").html(
      points +
        "<br>" +
        chrono.getTimeValues().toString(["minutes", "seconds", "secondTenths"])
    );
  });
}

function initRecord() {
  var s = '<ol type="1">';

  $.getJSON(storage, function (json) {
    json.sort(function (a, b) {
      return b.punti - a.punti;
    });

    for (var i = 0; i < 10; i++) {
      s += "<li>";
      if (i < json.length)
        s +=
          /* (i + 1) + ". " + */ json[i].nome + " - " + json[i].punti + "<br>";
      else s += /* (i + 1) + ". " + */ "<br>";
      s += "</li>";
    }

    s += "</ol>";
    $("#record").html(s);
  });
}

function resetRecord() {
  $.ajax({
    url: storage,
    type: "PUT",
    data: "[]",
    contentType: "application/json; charset=utf-8",
    dataType: "json",
    success: function (data, textStatus, jqXHR) {},
  });
}

initRecord();
