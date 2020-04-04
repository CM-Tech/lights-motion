import "./styles.css";

var canvas = document.getElementById("canvas");
var ctx = canvas.getContext("2d");
var s = 4;
var P = 0.4; //0.33333;
var mouse = { x: 0, y: 0, down: false };
var noGo = false;
var stringLength = 32;
var stringMinSpeed = 0.5;
var stringMaxSpeed = 0.6;
var stringsCount = 16 * 2;
var strings = [];
var thicknesses = [];
for (var j = 0; j < stringsCount; j++) {
    var string = [];
    //make a string
    for (var i = 0; i < stringLength; i++) {
        string.push({
            x: Math.random() * 100,
            y: Math.random() * 100,
            vx: 0,
            vy: 0
        });
    }
    thicknesses.push(Math.random() * 0.5 + 0.2);
    //add it to the list of strings
    strings.push(string);
}
var gameSize = 800;
var lastMove = 0;
canvas.width = gameSize;
canvas.height = gameSize;

function bezIt(pts, l) {
    var l0 = 1.0 - l;
    var nk = [];
    var K = -1.0;
    for (var i = 0; i < pts.length - 1; i++) {
        var nv = {
            vx: pts[i].vx * l0 + pts[i + 1].vx * l,
            vy: pts[i].vy * l0 + pts[i + 1].vy * l
        };
        nk.push({
            x: pts[i].x * l0 + pts[i + 1].x * l + nv.vx * K,
            y: pts[i].y * l0 + pts[i + 1].y * l + nv.vy * K,
            vx: pts[i].vx * l0 + pts[i + 1].vx * l,
            vy: pts[i].vy * l0 + pts[i + 1].vy * l
        });
    }
    return nk;
}

function bezRed(pts, l) {
    var pk = pts;
    var l1 = l;
    while (pk.length > 1) {
        pk = bezIt(pk, l1);
        l1 = l1;
    }
    var K2 = 0 * l1;
    return { x: pk[0].x + pk[0].vx * K2, y: pk[0].y + pk[0].vy * K2 };
}
var timer = 0;

function bezierReverseBScalar(a, b, c, l) {
    return (b - l * l * c - (1 - 2 * l + l * l) * a) / (2 * (l - l * l));
}

function bezierReverseB(a, b, c, l) {
    return {
        x: bezierReverseBScalar(a.x, b.x, c.x, l),
        y: bezierReverseBScalar(a.y, b.y, c.y, l)
    };
}

function drawString(stringArray, stringSpeed, w) {
    var startHue = timer;
    var hueChange = 1;
    ctx.beginPath();
    ctx.strokeStyle = "hsla(" + startHue + ",100%,50%," + w * 0.01 + ")";
    // ctx.lineWidth = w;
    var k0 = bezRed(stringArray, 0);
    ctx.moveTo(k0.x, k0.y);
    var subs = stringArray.length;
    var step = stringArray.length / subs;
    // for (var j = 0; j < stringArray.length; j += step) {
    //   var t = j / stringArray.length;
    //   var t2 = (j + step / 2) / stringArray.length;
    //   var t3 = (j + step) / stringArray.length;

    //   var pt = bezRed(stringArray, t);
    //   var pt2 = bezRed(stringArray, t2);
    //   var pt3 = bezRed(stringArray, t3);
    //   var pt2p = {
    //     x: pt2.x * 2 - (pt.x + pt3.x) / 2,
    //     y: pt2.y * 2 - (pt.y + pt3.y) / 2
    //   };
    //   // ctx.lineTo(pt.x, pt.y);
    //   ctx.quadraticCurveTo(pt2p.x, pt2p.y, pt3.x, pt3.y);
    //   // var i = j;

    //   // // ctx.moveTo(stringArray[i].x, stringArray[i].y);
    //   // var k = 0.5; //(1-stringSpeed);
    //   // var k1 = 1 - k;
    //   // var p = 0 + 1 / stringSpeed; //(1 - stringSpeed) * 1;
    //   // var mid = {
    //   //   x: (stringArray[i].x + stringArray[i - 1].x) / 2,
    //   //   y: (stringArray[i].y + stringArray[i - 1].y) / 2
    //   // };
    //   // ctx.quadraticCurveTo(
    //   //   mid.x - stringArray[i].vx,
    //   //   mid.y - stringArray[i].vy,
    //   //   stringArray[i].x,
    //   //   stringArray[i].y
    //   // );
    //   // //   (stringArray[i].x +
    //   // //     stringArray[i].vx * k1 +
    //   // //     stringArray[i - 1].x -
    //   // //     stringArray[i - 1].vx * k) *
    //   // //     p *
    //   // //     0.5 -
    //   // //     mid.x * (p - 1),
    //   // //   (stringArray[i].y +
    //   // //     stringArray[i].vy * k1 +
    //   // //     stringArray[i - 1].y -
    //   // //     stringArray[i - 1].vy * k) *
    //   // //     p *
    //   // //     0.5 -
    //   // //     mid.y * (p - 1)
    //   // // );

    //   // ctx.lineTo(stringArray[i].x, stringArray[i].y);
    // }
    // ctx.stroke();
    ctx.beginPath();
    ctx.strokeStyle = "hsla(" + startHue + ",70%,50%," + w * 0.1 + ")";
    // ctx.lineWidth = w;
    ctx.moveTo(stringArray[0].x, stringArray[0].y);
    var dis = 0;
    for (var i = 1; i < stringArray.length; i += 1) {
        var pt = stringArray[i - 1];
        var pt2 = {
            x: stringArray[i].x + 0,
            y: stringArray[i].y + 0,
            vx: stringArray[i].vx + 0,
            vy: stringArray[i].vy + 0
        };

        var pt3 = { x: stringArray[i].x + 0, y: stringArray[i].y + 0 };
        var O = 0.5;
        // pt2.x +=
        //   stringArray[i].vx * O +
        //   (stringArray[i - 1].vx / 2) * 0.0 +
        //   ((pt.x + pt3.x) / 2) * 0;
        // pt2.y +=
        //   stringArray[i].vy * O +
        //   (stringArray[i - 1].vy / 2) * 0.0 +
        //   ((pt.y + pt3.y) / 2) * 0;
        var stringS = stringSpeed;
        pt2.vx = stringArray[i].vx * (1 - stringS);
        pt2.vy = stringArray[i].vy * (1 - stringS);
        var m = P;
        var len =
            ((stringArray[i - 1].x - stringArray[i].x) ** 2 +
                (stringArray[i - 1].y - stringArray[i].y) ** 2) **
            0.5;
        pt2.vx +=
            (((stringArray[i - 1].x - stringArray[i].x) * stringS) / (len + 0.1)) *
            (-dis + len) *
            m;
        pt2.vy +=
            (((stringArray[i - 1].y - stringArray[i].y) * stringS) / (len + 0.1)) *
            (-dis + len) *
            m;
        pt2.x += pt2.vx;
        pt2.y += pt2.vy;
        var pt2p = {
            x: pt2.x * 2 - (pt.x + pt3.x) / 2,
            y: pt2.y * 2 - (pt.y + pt3.y) / 2
        };
        pt2p = bezierReverseB(pt, pt2, pt3, 1.0 - P);
        // ctx.lineTo(pt3.x, pt3.y);
        ctx.beginPath();
        // ctx.strokeStyle =
        //   "hsla(" +
        //   (startHue + ((hueChange * i) / stringArray.length) * 60) +
        //   ",50%,50%," +
        //   w +
        //   ")";
        // ctx.lineWidth = w;
        ctx.moveTo(pt.x, pt.y);
        ctx.quadraticCurveTo(pt2p.x, pt2p.y, pt3.x, pt3.y);
        ctx.stroke();
        // ctx.lineTo(pt.x, pt.y);
        //var i = j;

        //ctx.lineTo(stringArray[i].x, stringArray[i].y);
    }
    ctx.stroke();
}

function moveString(stringArray, stringSpeed) {
    stringArray[0].x = mouse.x;
    stringArray[0].y = mouse.y;
    stringArray[0].vx = 0;
    stringArray[0].vy = 0;
    var dis = 0;
    var SU = 1.0;
    for (var i = 1; i < stringArray.length; i++) {
        var stringS = stringSpeed;
        stringArray[i].vx = stringArray[i].vx * (1 - stringS) * SU;
        stringArray[i].vy = stringArray[i].vy * (1 - stringS) * SU;
        var m = P;
        var len =
            ((stringArray[i - 1].x - stringArray[i].x) ** 2 +
                (stringArray[i - 1].y - stringArray[i].y) ** 2) **
            0.5;
        var qe = 0.0; //stringSpeed / 1.5;
        stringArray[i].vx +=
            (((stringArray[i - 1].x - stringArray[i].x) * stringS) / (len + 0.1)) *
            (-dis + len) *
            m +
            (stringArray[i - 1].vx - stringArray[i].vx) * qe;
        stringArray[i].vy +=
            (((stringArray[i - 1].y - stringArray[i].y) * stringS) / (len + 0.1)) *
            (-dis + len) *
            m +
            (stringArray[i - 1].vy - stringArray[i].vy) * qe;
        // stringArray[i].x += stringArray[i].vx;
        // stringArray[i].y += stringArray[i].vy;
    }
    // for (var i = stringArray.length-1; i >0; i--) {

    //   stringArray[i].x += stringArray[i].vx;
    //   stringArray[i].y += stringArray[i].vy;
    //   stringArray[i].vx = (stringArray[i - 1].x - stringArray[i].x) * stringSpeed;
    //   stringArray[i].vy = (stringArray[i - 1].y - stringArray[i].y) * stringSpeed;

    // }
    var ss = 600;
    for (var i = 1; i < stringArray.length; i++) {
        var angle = Math.atan(stringArray[i].vy, stringArray[i].vx);
        angle = Math.round(angle / ((Math.PI * 2) / ss)) * ((Math.PI * 2) / ss);
        var len = Math.hypot(stringArray[i].vy, stringArray[i].vx);
        stringArray[i].x += stringArray[i].vx; //Math.cos(angle) * len;//stringArray[i].vx; // + Math.random() * 20 - 10;
        stringArray[i].y += stringArray[i].vy; //Math.sin(angle) * len; //stringArray[i].vy; // + Math.random() * 20 - 10;
    }
}
var targetPos = { x: 0, y: 0 };
var driftPos = { x: 0, y: 0 };
var drift2Pos = { x: 0, y: 0 };
window.setInterval(function() {
    driftPos = {
        x: (Math.random() / 2 + 0.25) * window.innerWidth,
        y: (Math.random() / 2 + 0.25) * window.innerHeight
    };
}, 1000);

function render() {
    timer++;
    //clear the old drawing
    var lk = 0.06;

    // targetPos.x =
    //   targetPos.x * (1 - lk) +
    //   lk *
    //     (Math.sin((timer / 60) * 1) * 800 +
    //       canvas.width / 2 / s +
    //       Math.sin((timer / 60) * 12) * 100);

    // //  Math.sin((timer / 60) * 1) * 300 + 400 + Math.sin((timer / 60) * 12) * 100;
    // targetPos.y =
    //   targetPos.y * (1 - lk) +
    //   lk *
    //     (Math.cos((timer / 10) * 1) * 200 +
    //       canvas.height / 2 / s +
    //       Math.cos((timer / 40) * 7) * 100);
    var len =
        ((Math.hypot(driftPos.x - targetPos.x, driftPos.y - targetPos.y) + 1) /
            canvas.width) *
        10;
    drift2Pos.x =
        drift2Pos.x * (1 - lk) + (lk * (driftPos.x - targetPos.x)) / len;
    drift2Pos.y =
        drift2Pos.y * (1 - lk) + (lk * (driftPos.y - targetPos.y)) / len;
    lk = 0.1;
    targetPos.x = targetPos.x * (1 - lk) + lk * (targetPos.x + drift2Pos.x);
    targetPos.y = targetPos.y * (1 - lk) + lk * (targetPos.y + drift2Pos.y);
    if (new Date().getTime() - lastMove > 2000) {
        mouse.x = targetPos.x * s;
        mouse.y = targetPos.y * s;
    }
    // ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.globalCompositeOperation = "source-over";
    ctx.fillStyle = "rgba(0,0,0,0.1)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.globalCompositeOperation = "lighter";
    ctx.lineWidth = s;
    for (var i = 0; i < strings.length; i++) {
        var spd =
            stringMinSpeed + (i / stringsCount) * (stringMaxSpeed - stringMinSpeed);
        drawString(strings[i], spd, thicknesses[i]);
        // moveString(strings[i], spd);
    }
    if (!noGo) {
        window.setTimeout(render, 1000 / 60);
    }
}
window.setInterval(function() {
    for (var i = 0; i < strings.length; i++) {
        var spd =
            stringMinSpeed + (i / stringsCount) * (stringMaxSpeed - stringMinSpeed);
        // drawString(strings[i].slice(0, 2), spd);
        moveString(strings[i], spd);
    }
}, 5);
render();
window.addEventListener("mousemove", function(event) {
    mouse.x = event.clientX * s;
    mouse.y = event.clientY * s;
    lastMove = new Date().getTime();
});
window.addEventListener("keyup", function(event) {
    if (event.keyCode == 32) {
        noGo = !noGo;
    }
});

function resizeH() {
    canvas.width = window.innerWidth * s;
    canvas.height = window.innerHeight * s;
}
window.addEventListener("resize", resizeH);
resizeH();