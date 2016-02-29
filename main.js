var canvas;
var time;
var i;

canvas = document.createElement("canvas");
document.body.appendChild(canvas);
canvas.width = 1000;
canvas.height = 500;
canvas.style.border= "1px solid black";

function run() {
    time = new Date().getTime();

    var s = new c.SimplexSolver();
    s.autoSolve = false;
    var boxes = [];

    var makeBox = function(colour) {
        boxes.push(new Box());
        boxes[boxes.length-1].colour = colour;
        return boxes[boxes.length-1];
    };

    eval(document.getElementById("code").value);

    s.solve();
    document.getElementById("time").innerHTML = (new Date().getTime() - time);

    var ctx = canvas.getContext("2d");
    ctx.fillStyle = "white";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    var rect = null;
    for(i = 0; i < boxes.length; i++) {
        // find bounds
        if (i === 0) {
            rect = boxes[i].toRectangle();
        } else {
            rect.union(boxes[i].toRectangle());
        }
    }

    ctx.translate(-rect.x-10, -rect.y-10);

    for(i = 0; i< boxes.length; i++) {
        var box = boxes[i];
        ctx.fillStyle = box.colour;
        ctx.fillRect(box.x(), box.y(), box.width(), box.height());
    }

    ctx.translate(rect.x+10, rect.y+10);
}

function getCode(id) {
    var newText = document.getElementById(id).value;
    document.getElementById("code").value = newText;
}

