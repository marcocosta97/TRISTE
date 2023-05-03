function checkVertex(a, b) {
  if (a.length !== b.length) return false;

  for (var i = 0; i < a.length; i++) {
    if (a[i].x != b[i].x || a[i].y != b[i].y) return false;
  }

  return true;
}

function addBody(body) {
  // blocks.push(body);
  var vertex = body.getVertex();

  var centre = Matter.Vertices.centre(vertex);

  var bodyComp = Matter.Bodies.fromVertices(centre.x, centre.y, vertex, {
    slop: 0.2,
    restitution: 0.1,
    friction: 0.8,
    density: 16,
    render: {
      fillStyle: getRandomColor(),
      // lineWidth: 2
      strokeStyle: "black",
    },
  });

  if (bodyComp === undefined) {
    alertContainer.style.display = "block";
    body.clear();
    return;
  }

  World.add(engine.world, bodyComp);

  body.clear();

  if (mouseArea.style.display === "none") {
    mouseArea.style.display = "block";
  } else {
    mouseArea.style.display = "none";
  }

  setTimeout(function (params) {
    mouseArea.style.display = "block";

    Matter.Events.on(engine, "collisionActive", function (ev) {
      var pairs = ev.pairs;

      for (var i = 0, j = pairs.length; i != j; ++i) {
        var pair = pairs[i];

        if (pair.bodyA === collider || pair.bodyB === collider) {
          Matter.Events.off(engine, "collisionActive");
          endGame();
        }
      }
    });

    setTimeout(() => {
      Matter.Events.off(engine, "collisionActive");
    }, 100);
  }, 2000);

  /* aggiornamento punteggio */
  Matter.Events.on(engine, "collisionEnd", function (ev) {
    var bodyPoints = Math.floor((bodyComp.area * areaCorrection) / pointsRange);
    if (bodyPoints >= 10) bodyPoints = 1;
    else bodyPoints = 10 - bodyPoints;

    coveredArea += bodyComp.area;

    chrono.removeEventListener("secondTenthsUpdated");
    chrono.addEventListener("secondTenthsUpdated", function (e) {
      $("#pointsArea").html(
        points +
          " (+" +
          bodyPoints +
          ")" +
          "<br>" +
          chrono
            .getTimeValues()
            .toString(["minutes", "seconds", "secondTenths"])
      );
    });

    setTimeout(() => {
      chrono.removeEventListener("secondTenthsUpdated");
      setChronoListener();
      updatePoints(bodyPoints);
    }, 1000);

    Matter.Events.off(engine, "collisionEnd");
  });
}

var Engine = Matter.Engine,
  Render = Matter.Render,
  World = Matter.World,
  Bodies = Matter.Bodies,
  Composite = Matter.Composites,
  Vertices = Matter.Vertices;

var engine;

var drawArea = document.getElementById("draw-area");

var drawAreaSize = mouseWidth * mouseHeight;
var pointsRange = drawAreaSize / 10;
var areaCorrection = 1.7;
var coveredArea = 0;
var boxA = Bodies.rectangle(300, 200, 80, 80);
var boxB = Bodies.rectangle(450, 50, 80, 80);
var ground = Bodies.rectangle(
  gamespaceWidth,
  gamespaceHeight,
  2 * gamespaceWidth,
  30,
  {
    isStatic: true,
    restitution: 0.1,
  }
);
var leftWall = Bodies.rectangle(
  0,
  gamespaceHeight,
  10,
  2 * gamespaceHeight - 2 * mouseHeight,
  {
    isStatic: true,
    restitution: 0.1,
  }
);
var rightWall = Bodies.rectangle(
  gamespaceWidth,
  gamespaceHeight,
  10,
  2 * gamespaceHeight - 2 * mouseHeight,
  {
    isStatic: true,
    restitution: 0.1,
  }
);

var collider = Bodies.rectangle(
  gamespaceWidth,
  mouseHeight,
  2 * gamespaceWidth,
  2,
  {
    isStatic: true,
    isSensor: true,
    name: "collider",
    render: {
      fillStyle: "#ba5f5f",
    },
  }
);

var renderer;

function startPhysic() {
  engine = Engine.create({
    velocityIterations: 6, // 4
    positionIterations: 8, // 6
    constraintIterations: 4, // 2
  });

  // add all of the bodies to the world
  World.add(engine.world, [ground, leftWall, rightWall, collider]);
  Matter.Runner.run(engine);

  renderer = Matter.Render.create({
    element: gamespace,
    engine: engine,
    options: {
      width: gamespaceWidth,
      height: gamespaceHeight,
      background: "transparent",
      wireframes: false,
      pixelRatio: window.devicePixelRatio,
    },
  });

  Render.run(renderer);
}
