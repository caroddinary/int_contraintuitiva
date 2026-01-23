// Empezar juego
let estadoJuego = "inicio";
let btnEmpezar;

//recurso img
let fondoImg;
let brujaImg;
let brujaX, brujaY;
const brujaRatio = 1570 / 2020;
let brujaH, brujaW;

//jaguar
let jaguarImg;
let jaguarX, jaguarY;
const jaguarRatio = 1865 / 770;
let jaguarH, jaguarW;
let jaguarVel = 20;

//colibrí
let colibriImg;
let colibriX, colibriY;
const colibriRatio = 769 / 569;
let colibriH, colibriW;

//bolas de fuego
let bolasFuego = [];
let fuegoIntervalo = 30;
let fuegoVel = 8;
let fuegoRadio;

//handpose colibrí
let video;
let handpose;
let hands = [];

function preload() {
  fondoImg = loadImage("assets/fondo.png");
  brujaImg = loadImage("assets/bruja.png");
  jaguarImg = loadImage("assets/jaguar.png");
  colibriImg = loadImage("assets/colibri.png");
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  textFont("Almendra");

  //btn empezar
  btnEmpezar = createButton("EMPEZAR");
  btnEmpezar.size(260, 60);
  btnEmpezar.style("font-size", "28px");
  btnEmpezar.mousePressed(iniciarJuego);

  configurarEscena();

  //tamaño bola de fuego
  fuegoRadio = height * 0.03;

  //video handpose
  video = createCapture(VIDEO);
  video.size(640, 480);
  video.hide();

  //ml5 mano
  handpose = ml5.handpose(video);
  handpose.on("predict", r => hands = r);
}

function configurarEscena() {

  //posiciones
  brujaH = height * 0.63;
  brujaW = brujaH * brujaRatio;
  brujaX = 40;
  brujaY = height - brujaH - 80;

  jaguarH = height * 0.25;
  jaguarW = jaguarH * jaguarRatio;
  jaguarX = width * 0.55;
  jaguarY = height / 2;

  colibriH = height * 0.11;
  colibriW = colibriH * colibriRatio;
  colibriX = width * 0.75;
  colibriY = height / 2;

  bolasFuego = [];
}

// iniciar
function iniciarJuego() {
  estadoJuego = "jugando";
  configurarEscena();
  btnEmpezar.hide();
}

//crear bola de fuego
function crearBolaFuego() {
  bolasFuego.push({
    x: brujaX + brujaW,
    y: random(40, height - fuegoRadio * 2 - 40),
    vel: fuegoVel
  });
}

//colision
function colision(a, b, bw, bh) {
  return (
    a.x < b.x + bw &&
    a.x + a.w > b.x &&
    a.y < b.y + bh &&
    a.y + a.h > b.y
  );
}

//perder juego
function activarGameOver() {
  estadoJuego = "gameover";
  btnEmpezar.html("REINTENTAR");
  btnEmpezar.show();
}

function draw() {
  background(0);

  image(fondoImg, 0, 0, width, height);
  image(brujaImg, brujaX, brujaY, brujaW, brujaH);
  image(jaguarImg, jaguarX, jaguarY, jaguarW, jaguarH);

  if (estadoJuego === "jugando") {

    //control contraintuitivo flechas
    if (keyIsDown(UP_ARROW)) jaguarY += jaguarVel;
    if (keyIsDown(DOWN_ARROW)) jaguarY -= jaguarVel;
    jaguarY = constrain(jaguarY, 0, height - jaguarH);

    //control contraintuitivo manos
    if (hands.length > 0) {
      let handY = hands[0].landmarks[0][1];
      colibriY = map(handY, 0, video.height, height - colibriH, 0);
    }
    colibriY = constrain(colibriY, 0, height - colibriH);

    if (frameCount % fuegoIntervalo === 0) {
      crearBolaFuego();
    }

    for (let i = bolasFuego.length - 1; i >= 0; i--) {
      let b = bolasFuego[i];
      b.x += b.vel;

      //bola celeste
      noStroke();
      fill(120, 200, 255, 180);
      ellipse(
        b.x + fuegoRadio,
        b.y + fuegoRadio,
        fuegoRadio * 2
      );

      //perder colibri
      if (colision(
        { x: colibriX, y: colibriY, w: colibriW, h: colibriH },
        b,
        fuegoRadio * 2,
        fuegoRadio * 2
      )) activarGameOver();

      //perder jaguar
      if (colision(
        { x: jaguarX, y: jaguarY, w: jaguarW, h: jaguarH },
        b,
        fuegoRadio * 2,
        fuegoRadio * 2
      )) activarGameOver();

      if (b.x > width + fuegoRadio * 2) {
        bolasFuego.splice(i, 1);
      }
    }
  }

  image(colibriImg, colibriX, colibriY, colibriW, colibriH);

  //inicio
  if (estadoJuego === "inicio") {
    fill(25, 15, 10, 220);
    rect(width / 2 - 380, height / 2 - 200, 760, 280, 20);

    fill(240, 225, 190);
    textAlign(CENTER, CENTER);
    textSize(40);
    textStyle(BOLD);
    text("¡La malvada bruja \n ha encontrado su escondite!", width / 2, height / 2 - 115);

    textSize(22);
    textStyle(NORMAL);
    text(
      "En este juego, el cielo obedece a la tierra,\ny la tierra obedece al cielo, te estamos observando\nmueve tu mano con juicio y teclea sin error,\no la bruja sellará el destino de jaguar y colibrí.",
      width / 2,
      height / 2 - 5
    );

    btnEmpezar.position(width / 2 - 130, height / 2 + 70);
  }

  //game over
  if (estadoJuego === "gameover") {
    btnEmpezar.position(width / 2 - 130, height - 80);

    fill(200, 0, 0);
    textAlign(CENTER, CENTER);
    textSize(120);
    textStyle(BOLD);
    text("GAME OVER", width / 2, height / 2);
  }

  if (estadoJuego === "jugando") textAlign(LEFT, TOP), fill(0, 48, 73), textSize(28), text("SCORE: " + floor(frameCount / 60), 20, 20);

}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}
