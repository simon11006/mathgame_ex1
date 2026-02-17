
// Game Elements
const canvas = document.getElementById('game-canvas');
const ctx = canvas.getContext('2d');
const startScreen = document.getElementById('start-screen');
const gameOverScreen = document.getElementById('game-over-screen');
const winScreen = document.getElementById('win-screen');
const quizContainer = document.getElementById('quiz-container');
const hud = document.getElementById('hud');
const startButton = document.getElementById('start-button');
const restartButtons = document.querySelectorAll('#restart-button, #win-restart-button');
const questionEl = document.getElementById('question');
const answerEl = document.getElementById('answer');
const submitAnswerBtn = document.getElementById('submit-answer');
const scoreEl = document.getElementById('score');
const finalScoreEl = document.getElementById('final-score');
const winScoreEl = document.getElementById('win-score');
const livesEl = document.getElementById('lives');
const bossHpEl = document.getElementById('boss-hp');

// Game settings
canvas.width = 800;
canvas.height = 600;

let score = 0;
let lives = 3;
let gamePaused = false;
let bossActive = false;
let currentBoss = null;
let bossDefeatedCount = 0;

// Player
class Player {
  constructor() {
    this.width = 50;
    this.height = 50;
    this.x = canvas.width / 2 - this.width / 2;
    this.y = canvas.height - this.height - 20;
    this.speed = 10;
    this.image = new Image();
    this.image.src = 'https://via.placeholder.com/50x50/0000FF/FFFFFF?text=P'; // Placeholder for player
  }

  draw() {
    ctx.drawImage(this.image, this.x, this.y, this.width, this.height);
  }

  update(keys) {
    if (('a' in keys || 'ArrowLeft' in keys) && this.x > 0) {
      this.x -= this.speed;
    }
    if (('d' in keys || 'ArrowRight' in keys) && this.x < canvas.width - this.width) {
      this.x += this.speed;
    }
  }
}

// Bullet
class Bullet {
    constructor(x, y) {
        this.width = 5;
        this.height = 15;
        this.x = x;
        this.y = y;
        this.speed = 7;
        this.color = 'yellow';
    }

    draw() {
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x, this.y, this.width, this.height);
    }

    update() {
        this.y -= this.speed;
    }
}

// Enemy
class Enemy {
    constructor() {
        this.width = 40;
        this.height = 40;
        this.x = Math.random() * (canvas.width - this.width);
        this.y = -this.height;
        this.speed = 3;
        this.image = new Image();
        this.image.src = 'https://via.placeholder.com/40x40/FF0000/FFFFFF?text=E'; // Placeholder
    }

    draw() {
        ctx.drawImage(this.image, this.x, this.y, this.width, this.height);
    }

    update() {
        this.y += this.speed;
    }
}

// Boss
class Boss {
    constructor(level) {
        this.width = 100;
        this.height = 100;
        this.x = canvas.width / 2 - this.width / 2;
        this.y = 50;
        this.level = level;
        this.hp = 10 + (level * 5);
        this.image = new Image();
        this.image.src = `https://via.placeholder.com/100x100/800080/FFFFFF?text=B${level}`; // Placeholder
    }

    draw() {
        ctx.drawImage(this.image, this.x, this.y, this.width, this.height);
        bossHpEl.textContent = this.hp;
    }

    takeDamage(amount) {
        this.hp -= amount;
        if (this.hp <= 0) {
            this.hp = 0;
            bossDefeated();
        }
    }
}

// Game objects
let player = new Player();
let bullets = [];
let enemies = [];
const keys = {};

// Event Listeners
window.addEventListener('keydown', (e) => { keys[e.key] = true; });
window.addEventListener('keyup', (e) => { delete keys[e.key]; });
window.addEventListener('keydown', (e) => {
    if (e.code === 'Space' && !gamePaused) {
        bullets.push(new Bullet(player.x + player.width / 2 - 2.5, player.y));
    }
});

startButton.addEventListener('click', startGame);
restartButtons.forEach(button => button.addEventListener('click', restartGame));
submitAnswerBtn.addEventListener('click', submitAnswer);

function startGame() {
    resetGame();
    startScreen.classList.add('hidden');
    hud.classList.remove('hidden');
    gameLoop();
}

function restartGame() {
    resetGame();
    gameOverScreen.classList.add('hidden');
    winScreen.classList.add('hidden');
    hud.classList.remove('hidden');
    gameLoop();
}

function resetGame() {
    score = 0;
    lives = 3;
    bossDefeatedCount = 0;
    player = new Player();
    enemies = [];
    bullets = [];
    currentBoss = null;
    bossActive = false;
    gamePaused = false;
    updateHUD();
}

function updateHUD() {
    scoreEl.textContent = score;
    livesEl.textContent = lives;
    bossHpEl.textContent = currentBoss ? currentBoss.hp : 'N/A';
}

function spawnEnemy() {
    if (Math.random() < 0.03 && !bossActive) {
        enemies.push(new Enemy());
    }
}

function checkCollisions() {
    // Bullets and Enemies
    for (let i = bullets.length - 1; i >= 0; i--) {
        for (let j = enemies.length - 1; j >= 0; j--) {
            if (bullets[i] && enemies[j] &&
                bullets[i].x < enemies[j].x + enemies[j].width &&
                bullets[i].x + bullets[i].width > enemies[j].x &&
                bullets[i].y < enemies[j].y + enemies[j].height &&
                bullets[i].y + bullets[i].height > enemies[j].y) {
                
                enemies.splice(j, 1);
                bullets.splice(i, 1);
                score += 10;
            }
        }
    }

    // Player and Enemies
    for (let i = enemies.length - 1; i >= 0; i--) {
         if (
            player.x < enemies[i].x + enemies[i].width &&
            player.x + player.width > enemies[i].x &&
            player.y < enemies[i].y + enemies[i].height &&
            player.y + player.height > enemies[i].y
        ) {
            enemies.splice(i, 1);
            lives--;
            if (lives <= 0) {
                gameOver();
            }
        }
    }
}

function spawnBoss() {
    if (!bossActive && score >= 50 && bossDefeatedCount === 0) {
        bossActive = true;
        currentBoss = new Boss(1);
        triggerQuiz();
    } else if (!bossActive && score >= 150 && bossDefeatedCount === 1) {
        bossActive = true;
        currentBoss = new Boss(2);
        triggerQuiz();
    } else if (!bossActive && score >= 300 && bossDefeatedCount === 2) {
        bossActive = true;
        currentBoss = new Boss(3);
        triggerQuiz();
    }
}

let correctAnswer;

function triggerQuiz() {
    gamePaused = true;
    const num1 = Math.floor(Math.random() * 10) + 1;
    const num2 = Math.floor(Math.random() * 10) + 1;
    const operator = Math.random() < 0.5 ? '+' : '-';

    if (operator === '-' && num1 < num2) {
        // Avoid negative results
        [num1, num2] = [num2, num1];
    }

    correctAnswer = operator === '+' ? num1 + num2 : num1 - num2;
    questionEl.textContent = `${num1} ${operator} ${num2} = ?`;

    quizContainer.classList.remove('hidden');
    answerEl.value = '';
    answerEl.focus();
}

function submitAnswer() {
    const userAnswer = parseInt(answerEl.value, 10);
    if (userAnswer === correctAnswer) {
        if (currentBoss) {
            currentBoss.takeDamage(5);
        }
    } else {
        lives--;
        if (lives <= 0) {
            gameOver();
        }
    }
    
    quizContainer.classList.add('hidden');
    gamePaused = false;
    if (currentBoss && currentBoss.hp > 0) {
      setTimeout(triggerQuiz, 2000); // Ask another question after a delay
    }
    if (!gameOver) {
        gameLoop(); 
    }
}

function bossDefeated() {
    bossDefeatedCount++;
    bossActive = false;
    currentBoss = null;
    score += 100;
    if (bossDefeatedCount === 3) {
        winGame();
    }
}

function gameOver() {
    gamePaused = true;
    finalScoreEl.textContent = score;
    gameOverScreen.classList.remove('hidden');
    hud.classList.add('hidden');
}

function winGame() {
    gamePaused = true;
    winScoreEl.textContent = score;
    winScreen.classList.remove('hidden');
    hud.classList.add('hidden');
}

function gameLoop() {
    if (gamePaused) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Update and draw game objects
    player.update(keys);
    player.draw();

    bullets.forEach((bullet, index) => {
        bullet.update();
        bullet.draw();
        if (bullet.y < 0) {
            bullets.splice(index, 1);
        }
    });

    enemies.forEach((enemy, index) => {
        enemy.update();
        enemy.draw();
        if (enemy.y > canvas.height) {
            enemies.splice(index, 1);
        }
    });
    
    spawnEnemy();
    checkCollisions();

    if (currentBoss) {
        currentBoss.draw();
    }

    spawnBoss();
    updateHUD();

    requestAnimationFrame(gameLoop);
}

// Initially, hide all screens except the start screen

hud.classList.add('hidden');
gameOverScreen.classList.add('hidden');
winScreen.classList.add('hidden');
quizContainer.classList.add('hidden');
