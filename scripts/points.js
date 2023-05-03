function resetPoints() {
  points = 0;
  chrono.stop();

  totalPoints = 0;
  $("#pointsArea").html("");
  coveredArea = 0;
}

var points = 0;

function updatePoints(point) {
  points += point;
}
var totalPoints = 0;

function endGame() {
  var time = chrono.getTimeValues();

  chrono.pause();
  var areaPercentage = coveredArea / gamespaceArea;
  totalPoints = Math.round(
    (points - chrono.getTotalTimeValues().secondTenths / 120) * areaPercentage
  );
  if (totalPoints < 0) totalPoints = 0;
  $("#playerName").css("display", "none");
  $("#playerName").val("");
  $("#insertButtonPoint").prop("disabled", true);
  insertPointArea.style.display = "block";
  container.style.border = "6px solid var(--lines-color)";

  var timeString = time.toString(["minutes", "seconds", "secondTenths"]);

  var $pointsLabel = $("#pointsLabel");
  $pointsLabel.html("");

  var str = "blocks: " + points + "<br>";
  setTimeout(() => {
    $pointsLabel.html(str);
    str += "AREA: " + parseFloat(areaPercentage * 100).toFixed(2) + "% <br>";
    setTimeout(() => {
      $pointsLabel.html(str);
      str += "TIME: " + timeString + "<br>";
      setTimeout(() => {
        $pointsLabel.html(str);
        str += "TOTAL: " + totalPoints;
        setTimeout(() => {
          $pointsLabel.html(str);
          setTimeout(() => {
            $("#playerName").css("display", "inline-block");
          }, 800);
        }, 800);
      }, 800);
    }, 800);
  }, 800);
}

$(document).ready(function () {
  var $submit = $("#insertButtonPoint"),
    $inputs = $("#playerName");

  function checkEmpty() {
    // filter over the empty inputs

    return (
      $inputs.filter(function () {
        return !$.trim(this.value);
      }).length === 0
    );
  }

  $("#backButtonPoint").on("click", function () {
    stop();
  });

  $inputs
    .on("keyup", function () {
      $submit.prop("disabled", !checkEmpty());
    })
    .keyup();

  $submit.on("click", function () {
    var name = $inputs.val();
    $.getJSON(storage, function (json) {
      json.push({
        nome: name,
        punti: totalPoints,
      });

      $.ajax({
        url: storage,
        type: "PUT",
        data: JSON.stringify(json),
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        success: function (data, textStatus, jqXHR) {
          initRecord();
        },
      });

      stop();
    });
  });
});

function stop() {
  insertPointArea.style.display = "none";
  menuArea.style.display = "block";
  Matter.Render.stop(renderer); // this only stop renderer but not destroy canvas
  Matter.World.clear(engine.world);
  Matter.Engine.clear(engine);

  renderer.canvas.remove();
  renderer.canvas = null;
  renderer.context = null;
  renderer.textures = {};

  resetPoints();
}
