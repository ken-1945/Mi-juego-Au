const passwordInput = document.getElementById("password");
const buttons = document.querySelectorAll(".numpad button");
const login = document.getElementById("login");
const game = document.getElementById("game");
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const endScreen = document.getElementById("endScreen");
const endMessage = document.getElementById("endMessage");
const restartBtn = document.getElementById("restartBtn");
const scoreBoard = document.getElementById("score");

canvas.width = 400;
canvas.height = 600;

let password = "";
const correctPassword = "031025";

buttons.forEach(btn => {
  btn.addEventListener("click", () => {
    if (btn.id === "clear") {
      password = "";
      passwordInput.value = "";
    } else if (btn.id === "enter") {
      if (password === correctPassword) {
        login.style.display = "none";
        game.style.display = "block";
        startGame();
      } else {
        password = "";
        passwordInput.value = "";
      }
    } else {
      password += btn.textContent;
      passwordInput.value = "*".repeat(password.length);
    }
  });
});

// VARIABLES DE JUEGO
let player, bullets, enemies, score, lives, gameOver;
let bgImg = new Image();
bgImg.src = "img/Fondo de juego.png";

function startGame() {
  player = { x: canvas.width / 2 - 35, y: canvas.height - 100, w: 70, h: 70, img: new Image() };
  player.img.src = "img/player.png";
  bullets = [];
  enemies = [];
  score = 0;
  lives = 3;
  gameOver = false;
  updateScore();

  canvas.addEventListener("click", shoot);
  document.addEventListener("keydown", movePlayer);

  requestAnimationFrame(gameLoop);
}

function movePlayer(e) {
  if (e.key === "ArrowLeft" && player.x > 0) player.x -= 20;
  if (e.key === "ArrowRight" && player.x + player.w < canvas.width) player.x += 20;
}

function shoot() {
  bullets.push({ x: player.x + player.w / 2, y: player.y, emoji: "❤️" });
}

function spawnEnemy() {
  let enemy = { x: Math.random() * (canvas.width - 60), y: -60, w: 60, h: 60, img: new Image(), hit: false };
  enemy.img.src = "img/enemy.png";
  enemies.push(enemy);
}

function gameLoop() {
  if (gameOver) return;

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Fondo con imagen
  ctx.drawImage(bgImg, 0, 0, canvas.width, canvas.height);

  // Jugador
  ctx.drawImage(player.img, player.x, player.y, player.w, player.h);

  // Balas
  bullets.forEach((b, i) => {
    ctx.font = "28px Arial";
    ctx.fillText(b.emoji, b.x, b.y);
    b.y -= 6;
    if (b.y < 0) bullets.splice(i, 1);
  });

  // Enemigos
  enemies.forEach((en, i) => {
    ctx.drawImage(en.img, en.x, en.y, en.w, en.h);
    en.y += 2.5;

    // Colisión con jugador
    if (!en.hit && collide(en, player)) {
      loseLife();
      enemies.splice(i, 1);
    }

    // Si pasa sin ser destruido
    if (en.y > canvas.height) {
      enemies.splice(i, 1);
      loseLife();
    }

    // Colisión con balas
    bullets.forEach((b, bi) => {
      if (!en.hit && collidePoint(b, en)) {
        en.hit = true;
        en.img.src = "img/enemy-hit.png"; // 
        setTimeout(() => enemies.splice(i, 1), 300); 
        bullets.splice(bi, 1);
        score++;
        updateScore();
        if (score >= 10) winGame();
      }
    });
  });

  requestAnimationFrame(gameLoop);
}

function collide(a, b) {
  return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
}

function collidePoint(p, r) {
  return p.x > r.x && p.x < r.x + r.w && p.y > r.y && p.y < r.y + r.h;
}

function loseLife() {
  lives--;
  vibrate();
  updateScore();
  if (lives <= 0) endGame("😢 ¡Perdiste!");
}

function vibrate() {
  if (navigator.vibrate) {
    navigator.vibrate(300); // en móviles
  } else {
    // Simular vibración en PC
    canvas.style.transform = "translate(5px, 5px)";
    setTimeout(() => canvas.style.transform = "translate(0, 0)", 100);
  }
}

function updateScore() {
  scoreBoard.textContent = "Score: " + score + " | Vidas: " + "❤️".repeat(lives);
}

function endGame(msg) {
  gameOver = true;
  game.style.display = "none";
  endScreen.style.display = "block";
  endMessage.textContent = msg;
}

function winGame() {
  window.location.href = "win.html";
}

restartBtn.addEventListener("click", () => {
  endScreen.style.display = "none";
  game.style.display = "block";
  startGame();
});

setInterval(spawnEnemy, 1500);


