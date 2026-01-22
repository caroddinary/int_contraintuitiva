
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
let jaguarVel = 15;

//colibrí
let colibriImg;
let colibriX, colibriY;
const colibriRatio = 769 / 569;
let colibriH, colibriW;

//hechizos
let hechizoImg;
let bolasFuego = [];
let fuegoIntervalo = 30;
const hechizoRatio = 2048 / 1036;
let fuegoH, fuegoW;
let fuegoVel = 22;

//handpose colibrí
let video;
let handpose;
let hands = [];

function preload() {
  fondoImg = loadImage("assets/fondo.png");
  brujaImg = loadImage("assets/bruja.png");
  jaguarImg = loadImage("assets/jaguar.png");
  colibriImg = loadImage("assets/colibri.png");
  hechizoImg = loadImage("assets/hechizo.png");
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

  //fuego posicion
  fuegoH = height * 0.1;
  fuegoW = fuegoH * hechizoRatio;

  //vidio handpose
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

//bolas de fuego desde bruja
function crearBolaFuego() {
  bolasFuego.push({
    x: brujaX + brujaW,
    y: random(40, height - fuegoH - 40),
    vel: fuegoVel
  });
}

//choque
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
      image(hechizoImg, b.x, b.y, fuegoW, fuegoH);

      //perder colibri
      if (colision(
        { x: colibriX, y: colibriY, w: colibriW, h: colibriH },
        b,
        fuegoW,
        fuegoH
      )) activarGameOver();

      //perder jaguar
      if (colision(
        { x: jaguarX, y: jaguarY, w: jaguarW, h: jaguarH },
        b,
        fuegoW,
        fuegoH
      )) activarGameOver();

      if (b.x > width + fuegoW) {
        bolasFuego.splice(i, 1);
      }
    }
  }

  image(colibriImg, colibriX, colibriY, colibriW, colibriH);

  //instrucciones
  if (estadoJuego === "inicio") {
    fill(25, 15, 10, 220);
    rect(width / 2 - 380, height / 2 - 200, 760, 280, 20);

    fill(240, 225, 190);
    textAlign(CENTER, CENTER);
    textSize(40);
    textStyle(BOLD);
    text("La malvada bruja \n ha encontrado tu escondite", width / 2, height / 2 - 115);

    textSize(22);
    textStyle(NORMAL);
    text(
  
      " Cuando el cielo obedece a la tierra,\ny la tierra traiciona al cielo,\nmueve tu mano con juicio y teclea sin error,\no la bruja sellará el destino de jaguar y colibrí.",
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
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}
