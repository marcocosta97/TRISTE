function GenericCanvas(name, _width, _height, _area) {
  this.canvas = document.createElement("canvas");
  this.canvas.id = name;
  this.canvas.width = _width;
  this.canvas.height = _height;

  _area.appendChild(this.canvas);

  this.context = document.getElementById(this.canvas.id).getContext("2d");

  this.clear = function () {
    this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.drawn = false;
  };

  this.drawn = false;
}

function Block(x, y) {
  if (typeof Block.counter == "undefined") Block.counter = 0;

  this.name = "block" + Block.counter;
  Block.counter++;
  var canvas = new GenericCanvas(this.name, mouseWidth, mouseHeight, mouseArea);

  this.context = canvas.context;
  this.context.lineWidth = 1.5;
  var vertex = [];
  var closed = false;
  var color = null;

  this.addVertex = function (x, y) {
    vertex.push({
      x: x,
      y: y,
    });
  };

  this.addVertex(x, y);

  this.setInitialPosition = function () {
    this.context.moveTo(vertex[0].x, vertex[0].y);
  };

  this.getVertexBase = function () {
    return vertex[0];
  };

  this.getVertexNumber = function () {
    return vertex.length;
  };

  this.getVertex = function () {
    return vertex;
  };

  this.clear = function () {
    this.context.clearRect(0, 0, mouseWidth, mouseHeight);
  };

  // no stroke
  this.redraw = function () {
    this.clear();
    this.context.beginPath();
    this.setInitialPosition();

    var i = 1,
      length = vertex.length;
    for (; i < length; i++) this.context.lineTo(vertex[i].x, vertex[i].y);

    if (closed) this.context.closePath();
  };

  this.closeBlock = function () {
    closed = true;
    //this.context.fillStyle = getRandomColor();
  };

  this.stroke = function () {
    if (closed) this.context.fill();

    this.context.stroke();
  };

  this.removeLastVertex = function () {
    vertex.pop();
  };
}

var gamespace = document.getElementById("gamespace"),
  gamespaceWidth = gamespace.offsetWidth,
  gamespaceHeight = gamespace.offsetHeight;

var mouseArea = document.getElementById("mouse-area"),
  mouseWidth = mouseArea.offsetWidth,
  mouseHeight = mouseArea.offsetHeight;

var gamespaceArea = gamespaceWidth * (gamespaceHeight - mouseHeight);
var circleRadius = 4;
var enableHandler = false;

function newGame() {
  tool = new BlockCreator();
  mouseArea.addEventListener("mousedown", block_event);
  mouseArea.addEventListener("mousemove", function (e) {
    if (enableHandler) {
      block_event(e);
      enableHandler = false;
    }
  });

  window.setInterval(function () {
    enableHandler = true;
  }, 40);

  startPhysic();
}

function insideCircle(x0, y0, x1, y1) {
  return (
    Math.sqrt((x1 - x0) * (x1 - x0) + (y1 - y0) * (y1 - y0)) < 2 * circleRadius
  );
}

function drawCircle(circle, x, y, radius) {
  if (!circle.drawn) {
    circle.context.beginPath();
    circle.context.arc(x, y, radius, 0, 2 * Math.PI);
    circle.context.fill();
    circle.context.stroke();

    circle.drawn = true;
  }
}

function BlockCreator() {
  var currentBlock = null;
  var vertex = null;
  var smallEndCircle = new GenericCanvas(
    "smallEndCircle",
    mouseWidth,
    mouseHeight,
    mouseArea
  );
  var bigEndCircle = new GenericCanvas(
    "bigEndCircle",
    mouseWidth,
    mouseHeight,
    mouseArea
  );
  smallEndCircle.context.fillStyle = bigEndCircle.context.fillStyle = "red";

  this.started = false;

  this.mousedown = function (ev) {
    if (!this.started) {
      currentBlock = new Block(ev._x, ev._y);
      vertex = currentBlock.getVertexBase();
      this.started = true;
    } else {
      currentBlock.addVertex(ev._x, ev._y);
      if (currentBlock.getVertexNumber() == 3) {
        smallEndCircle.clear();
        drawCircle(smallEndCircle, vertex.x, vertex.y, circleRadius);
      } else if (
      /* poligono chiuso */
        currentBlock.getVertexNumber() >= 3 &&
        insideCircle(vertex.x, vertex.y, ev._x, ev._y)
      ) {
        bigEndCircle.clear();
        currentBlock.removeLastVertex();
        currentBlock.closeBlock();
        currentBlock.redraw();
        currentBlock.stroke();
        this.started = false;

        addBody(currentBlock);
      }
    }

    /*         console.log(ev._x + ", " + ev._y); */
  };
  this.mousemove = function (ev) {
    if (this.started) {
      currentBlock.redraw();
      currentBlock.context.lineTo(ev._x, ev._y);

      if (
        insideCircle(vertex.x, vertex.y, ev._x, ev._y) &&
        currentBlock.getVertexNumber() >= 3
      ) {
        smallEndCircle.clear();
        drawCircle(bigEndCircle, vertex.x, vertex.y, 2 * circleRadius);
      } else if (currentBlock.getVertexNumber() >= 3) {
        bigEndCircle.clear();
        drawCircle(smallEndCircle, vertex.x, vertex.y, circleRadius);
      }

      currentBlock.stroke();
    }
  };
}

function block_event(ev) {
  ev._x = ev.offsetX / scale;
  ev._y = ev.offsetY / scale;

  if (ev._y > mouseHeight || ev.layerY > mouseHeight) return;

  var func = tool[ev.type];
  if (func) {
    func(ev);
  }
}
