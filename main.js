// ============================================================
// 사칙연산 비행기 슈팅게임
// ============================================================

const canvas = document.getElementById('game-canvas');
const ctx = canvas.getContext('2d');
const W = canvas.width;
const H = canvas.height;

// UI Elements
const startScreen = document.getElementById('start-screen');
const selectScreen = document.getElementById('select-screen');
const quizContainer = document.getElementById('quiz-container');
const stageClear = document.getElementById('stage-clear');
const stageClearText = document.getElementById('stage-clear-text');
const gameOverScreen = document.getElementById('game-over-screen');
const winScreen = document.getElementById('win-screen');
const hudEl = document.getElementById('hud');
const scoreEl = document.getElementById('score');
const livesBar = document.getElementById('lives-bar');
const stageLabel = document.getElementById('stage-label');
const bossHpLabel = document.getElementById('boss-hp-label');
const bossHpBar = document.getElementById('boss-hp-bar');
const questionEl = document.getElementById('question');
const answerEl = document.getElementById('answer');
const submitBtn = document.getElementById('submit-answer');
const quizFeedback = document.getElementById('quiz-feedback');
const finalScoreEl = document.getElementById('final-score');
const finalStageEl = document.getElementById('final-stage');
const winScoreEl = document.getElementById('win-score');

// ============================================================
// 비행기 타입 정의
// ============================================================
const PLANE_TYPES = [
  { name: '팔콘',     color: '#00ccff', speed: 6, fireRate: 12, maxHp: 5, bulletColor: '#00ccff', shape: 'falcon' },
  { name: '스트라이커', color: '#ff6600', speed: 5, fireRate: 7,  maxHp: 4, bulletColor: '#ffaa00', shape: 'striker' },
  { name: '포트리스',  color: '#44dd44', speed: 4, fireRate: 15, maxHp: 8, bulletColor: '#44ff44', shape: 'fortress' },
];

// ============================================================
// 비행기 그리기 함수
// ============================================================
function drawPlane(c, type, x, y, w, h) {
  const t = PLANE_TYPES[type];
  c.save();
  c.translate(x + w / 2, y + h / 2);

  // 엔진 불꽃
  const flicker = 0.8 + Math.random() * 0.4;
  c.fillStyle = '#ff6600';
  c.globalAlpha = 0.7 * flicker;
  if (type === 0) {
    c.beginPath();
    c.moveTo(-w * 0.1, h * 0.4);
    c.lineTo(0, h * 0.5 + h * 0.15 * flicker);
    c.lineTo(w * 0.1, h * 0.4);
    c.fill();
  } else if (type === 1) {
    c.beginPath();
    c.moveTo(-w * 0.2, h * 0.35);
    c.lineTo(-w * 0.12, h * 0.5 + h * 0.12 * flicker);
    c.lineTo(-w * 0.04, h * 0.35);
    c.fill();
    c.beginPath();
    c.moveTo(w * 0.04, h * 0.35);
    c.lineTo(w * 0.12, h * 0.5 + h * 0.12 * flicker);
    c.lineTo(w * 0.2, h * 0.35);
    c.fill();
  } else {
    c.beginPath();
    c.moveTo(-w * 0.15, h * 0.4);
    c.lineTo(-w * 0.05, h * 0.55 + h * 0.1 * flicker);
    c.lineTo(w * 0.05, h * 0.55 + h * 0.1 * flicker);
    c.lineTo(w * 0.15, h * 0.4);
    c.fill();
  }
  c.globalAlpha = 1;

  // 기체
  c.fillStyle = t.color;
  c.strokeStyle = '#fff';
  c.lineWidth = 1;

  if (type === 0) {
    // 팔콘: 날렵한 삼각형
    c.beginPath();
    c.moveTo(0, -h * 0.5);
    c.lineTo(-w * 0.45, h * 0.4);
    c.lineTo(-w * 0.15, h * 0.35);
    c.lineTo(0, h * 0.45);
    c.lineTo(w * 0.15, h * 0.35);
    c.lineTo(w * 0.45, h * 0.4);
    c.closePath();
    c.fill();
    c.stroke();
    // 캐노피
    c.fillStyle = '#aaeeff';
    c.beginPath();
    c.ellipse(0, -h * 0.1, w * 0.08, h * 0.12, 0, 0, Math.PI * 2);
    c.fill();
  } else if (type === 1) {
    // 스트라이커: 쌍발 전투기
    c.beginPath();
    c.moveTo(0, -h * 0.45);
    c.lineTo(-w * 0.12, h * 0.1);
    c.lineTo(-w * 0.5, h * 0.25);
    c.lineTo(-w * 0.45, h * 0.4);
    c.lineTo(-w * 0.2, h * 0.3);
    c.lineTo(0, h * 0.4);
    c.lineTo(w * 0.2, h * 0.3);
    c.lineTo(w * 0.45, h * 0.4);
    c.lineTo(w * 0.5, h * 0.25);
    c.lineTo(w * 0.12, h * 0.1);
    c.closePath();
    c.fill();
    c.stroke();
    // 캐노피
    c.fillStyle = '#ffddaa';
    c.beginPath();
    c.ellipse(0, -h * 0.12, w * 0.07, h * 0.1, 0, 0, Math.PI * 2);
    c.fill();
  } else {
    // 포트리스: 넓고 튼튼한 기체
    c.beginPath();
    c.moveTo(0, -h * 0.4);
    c.lineTo(-w * 0.2, -h * 0.1);
    c.lineTo(-w * 0.5, h * 0.1);
    c.lineTo(-w * 0.45, h * 0.4);
    c.lineTo(-w * 0.1, h * 0.35);
    c.lineTo(0, h * 0.45);
    c.lineTo(w * 0.1, h * 0.35);
    c.lineTo(w * 0.45, h * 0.4);
    c.lineTo(w * 0.5, h * 0.1);
    c.lineTo(w * 0.2, -h * 0.1);
    c.closePath();
    c.fill();
    c.stroke();
    // 실드 효과
    c.strokeStyle = 'rgba(100, 255, 100, 0.3)';
    c.lineWidth = 2;
    c.beginPath();
    c.arc(0, 0, w * 0.55, 0, Math.PI * 2);
    c.stroke();
    // 캐노피
    c.fillStyle = '#bbffbb';
    c.beginPath();
    c.ellipse(0, -h * 0.05, w * 0.1, h * 0.1, 0, 0, Math.PI * 2);
    c.fill();
  }

  c.restore();
}

// 비행기 선택 프리뷰 그리기
function drawPlanePreviews() {
  document.querySelectorAll('.plane-preview').forEach((cvs, i) => {
    const pc = cvs.getContext('2d');
    pc.clearRect(0, 0, 80, 80);
    drawPlane(pc, i, 10, 5, 60, 70);
  });
}

// ============================================================
// 게임 상태
// ============================================================
let state = 'menu'; // menu, select, playing, quiz, stageclear, gameover, win
let selectedPlane = 0;
let score = 0;
let currentStage = 1;
let stageKills = 0;
let killsForBoss = 10;
let animFrame = null;
let frameCount = 0;

// 별 배경
const stars = Array.from({ length: 120 }, () => ({
  x: Math.random() * W,
  y: Math.random() * H,
  speed: 0.3 + Math.random() * 1.5,
  size: 0.5 + Math.random() * 1.5,
  bright: 0.3 + Math.random() * 0.7,
}));

// 파티클
let particles = [];

// 플레이어
let player = null;
let bullets = [];
let enemies = [];
let enemyBullets = [];
let boss = null;
let bossActive = false;
let fireTimer = 0;

// 퀴즈
let correctAnswer = 0;
let quizDamage = 0;

// 키 입력
const keys = {};
window.addEventListener('keydown', e => {
  keys[e.key] = true;
  if (e.key === ' ' || e.key === 'ArrowUp' || e.key === 'ArrowDown' ||
      e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
    e.preventDefault();
  }
});
window.addEventListener('keyup', e => { delete keys[e.key]; });

// ============================================================
// 플레이어 클래스
// ============================================================
function createPlayer(type) {
  const t = PLANE_TYPES[type];
  return {
    type,
    x: W / 2,
    y: H - 80,
    w: 48,
    h: 52,
    speed: t.speed,
    fireRate: t.fireRate,
    hp: t.maxHp,
    maxHp: t.maxHp,
    invincible: 0,
  };
}

// ============================================================
// 적 클래스
// ============================================================
function createEnemy(stage) {
  const types = [
    { w: 32, h: 32, hp: 1, speed: 2, color: '#ff4444', score: 10 },
    { w: 36, h: 36, hp: 2, speed: 1.5, color: '#ff8800', score: 20 },
    { w: 28, h: 28, hp: 1, speed: 3.5, color: '#ffff00', score: 15 },
  ];
  const eType = types[Math.floor(Math.random() * Math.min(stage + 1, types.length))];
  return {
    x: 30 + Math.random() * (W - 60),
    y: -40,
    w: eType.w,
    h: eType.h,
    hp: eType.hp + Math.floor(stage / 2),
    speed: eType.speed + stage * 0.3,
    color: eType.color,
    score: eType.score,
    shootTimer: Math.random() * 120,
    canShoot: stage >= 2 && Math.random() < 0.4,
  };
}

// ============================================================
// 보스
// ============================================================
function createBoss(stage) {
  const bosses = [
    { name: '캡틴 플러스', hp: 15, color: '#ff2266', w: 100, h: 80 },
    { name: '마이너스 장군', hp: 25, color: '#aa00ff', w: 120, h: 90 },
    { name: '곱셈의 왕', hp: 35, color: '#ff0000', w: 140, h: 100 },
  ];
  const b = bosses[stage - 1];
  return {
    name: b.name,
    x: W / 2,
    y: -100,
    targetY: 80,
    w: b.w,
    h: b.h,
    hp: b.hp,
    maxHp: b.hp,
    color: b.color,
    stage,
    entering: true,
    shootTimer: 0,
    moveTimer: 0,
    moveDir: 1,
  };
}

// ============================================================
// 그리기 함수들
// ============================================================
function drawStars() {
  stars.forEach(s => {
    s.y += s.speed;
    if (s.y > H) { s.y = 0; s.x = Math.random() * W; }
    ctx.fillStyle = `rgba(255,255,255,${s.bright})`;
    ctx.fillRect(s.x, s.y, s.size, s.size);
  });
}

function drawBullet(b) {
  ctx.fillStyle = b.color;
  ctx.shadowBlur = 8;
  ctx.shadowColor = b.color;
  ctx.fillRect(b.x - b.w / 2, b.y - b.h / 2, b.w, b.h);
  ctx.shadowBlur = 0;
}

function drawEnemy(e) {
  ctx.save();
  ctx.translate(e.x, e.y);
  ctx.fillStyle = e.color;
  // 기체 모양
  ctx.beginPath();
  ctx.moveTo(0, e.h / 2);
  ctx.lineTo(-e.w / 2, -e.h / 3);
  ctx.lineTo(-e.w / 4, -e.h / 2);
  ctx.lineTo(e.w / 4, -e.h / 2);
  ctx.lineTo(e.w / 2, -e.h / 3);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = '#fff';
  ctx.lineWidth = 0.5;
  ctx.stroke();
  // HP > 1이면 표시
  if (e.hp > 1) {
    ctx.fillStyle = '#fff';
    ctx.font = '10px Press Start 2P';
    ctx.textAlign = 'center';
    ctx.fillText(e.hp, 0, 4);
  }
  ctx.restore();
}

function drawBoss(b) {
  ctx.save();
  ctx.translate(b.x, b.y);

  // 글로우 효과
  const glow = 0.3 + 0.1 * Math.sin(frameCount * 0.05);
  ctx.shadowBlur = 30;
  ctx.shadowColor = b.color;

  // 기체
  ctx.fillStyle = b.color;
  ctx.beginPath();
  if (b.stage === 1) {
    ctx.moveTo(0, -b.h / 2);
    ctx.lineTo(-b.w / 2, b.h / 4);
    ctx.lineTo(-b.w / 3, b.h / 2);
    ctx.lineTo(b.w / 3, b.h / 2);
    ctx.lineTo(b.w / 2, b.h / 4);
  } else if (b.stage === 2) {
    ctx.moveTo(0, -b.h / 2);
    ctx.lineTo(-b.w / 3, -b.h / 4);
    ctx.lineTo(-b.w / 2, b.h / 6);
    ctx.lineTo(-b.w * 0.6, b.h / 3);
    ctx.lineTo(-b.w / 4, b.h / 2);
    ctx.lineTo(b.w / 4, b.h / 2);
    ctx.lineTo(b.w * 0.6, b.h / 3);
    ctx.lineTo(b.w / 2, b.h / 6);
    ctx.lineTo(b.w / 3, -b.h / 4);
  } else {
    // 최종 보스: 크라운 형태
    ctx.moveTo(0, -b.h / 2);
    ctx.lineTo(-b.w * 0.3, -b.h / 4);
    ctx.lineTo(-b.w * 0.5, -b.h / 2 + 10);
    ctx.lineTo(-b.w * 0.55, b.h / 4);
    ctx.lineTo(-b.w / 3, b.h / 2);
    ctx.lineTo(b.w / 3, b.h / 2);
    ctx.lineTo(b.w * 0.55, b.h / 4);
    ctx.lineTo(b.w * 0.5, -b.h / 2 + 10);
    ctx.lineTo(b.w * 0.3, -b.h / 4);
  }
  ctx.closePath();
  ctx.fill();

  ctx.shadowBlur = 0;
  ctx.strokeStyle = `rgba(255,255,255,${0.5 + glow})`;
  ctx.lineWidth = 2;
  ctx.stroke();

  // 눈
  ctx.fillStyle = '#fff';
  ctx.beginPath();
  ctx.arc(-b.w * 0.15, -b.h * 0.05, 6, 0, Math.PI * 2);
  ctx.arc(b.w * 0.15, -b.h * 0.05, 6, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#000';
  ctx.beginPath();
  ctx.arc(-b.w * 0.15, -b.h * 0.05, 3, 0, Math.PI * 2);
  ctx.arc(b.w * 0.15, -b.h * 0.05, 3, 0, Math.PI * 2);
  ctx.fill();

  // HP 바
  const barW = b.w * 0.8;
  const hpRatio = b.hp / b.maxHp;
  ctx.fillStyle = 'rgba(0,0,0,0.6)';
  ctx.fillRect(-barW / 2, -b.h / 2 - 16, barW, 8);
  ctx.fillStyle = hpRatio > 0.5 ? '#00ff66' : hpRatio > 0.25 ? '#ffaa00' : '#ff2222';
  ctx.fillRect(-barW / 2, -b.h / 2 - 16, barW * hpRatio, 8);
  ctx.strokeStyle = '#fff';
  ctx.lineWidth = 1;
  ctx.strokeRect(-barW / 2, -b.h / 2 - 16, barW, 8);

  ctx.restore();
}

function drawPlayer() {
  if (!player) return;
  if (player.invincible > 0 && Math.floor(frameCount / 4) % 2 === 0) return;
  drawPlane(ctx, player.type, player.x - player.w / 2, player.y - player.h / 2, player.w, player.h);
}

// 파티클
function spawnParticles(x, y, color, count) {
  for (let i = 0; i < count; i++) {
    particles.push({
      x, y,
      vx: (Math.random() - 0.5) * 6,
      vy: (Math.random() - 0.5) * 6,
      life: 20 + Math.random() * 20,
      maxLife: 40,
      color,
      size: 2 + Math.random() * 3,
    });
  }
}

function updateParticles() {
  for (let i = particles.length - 1; i >= 0; i--) {
    const p = particles[i];
    p.x += p.vx;
    p.y += p.vy;
    p.life--;
    if (p.life <= 0) { particles.splice(i, 1); continue; }
    const alpha = p.life / p.maxLife;
    ctx.globalAlpha = alpha;
    ctx.fillStyle = p.color;
    ctx.fillRect(p.x - p.size / 2, p.y - p.size / 2, p.size, p.size);
  }
  ctx.globalAlpha = 1;
}

// ============================================================
// HUD 업데이트
// ============================================================
function updateHUD() {
  scoreEl.textContent = score;
  stageLabel.textContent = `STAGE ${currentStage}`;
  // HP 바 (하트 대신 블록)
  let hpStr = '';
  for (let i = 0; i < player.maxHp; i++) {
    hpStr += i < player.hp ? '█' : '░';
  }
  livesBar.textContent = hpStr;

  if (bossActive && boss) {
    bossHpLabel.classList.remove('hidden');
    let bhp = '';
    const segments = 10;
    const filled = Math.ceil((boss.hp / boss.maxHp) * segments);
    for (let i = 0; i < segments; i++) {
      bhp += i < filled ? '█' : '░';
    }
    bossHpBar.textContent = bhp;
  } else {
    bossHpLabel.classList.add('hidden');
  }
}

// ============================================================
// 퀴즈 생성
// ============================================================
function generateQuiz(stage) {
  let a, b, op, answer, qText;
  const difficulty = stage;

  const ops = ['+', '-'];
  if (difficulty >= 2) ops.push('×');
  if (difficulty >= 3) ops.push('÷');

  op = ops[Math.floor(Math.random() * ops.length)];

  switch (op) {
    case '+':
      a = Math.floor(Math.random() * (10 * difficulty)) + 1;
      b = Math.floor(Math.random() * (10 * difficulty)) + 1;
      answer = a + b;
      qText = `${a} + ${b} = ?`;
      break;
    case '-':
      a = Math.floor(Math.random() * (10 * difficulty)) + 2;
      b = Math.floor(Math.random() * a) + 1;
      answer = a - b;
      qText = `${a} - ${b} = ?`;
      break;
    case '×':
      a = Math.floor(Math.random() * (5 * difficulty)) + 1;
      b = Math.floor(Math.random() * 9) + 2;
      answer = a * b;
      qText = `${a} × ${b} = ?`;
      break;
    case '÷':
      b = Math.floor(Math.random() * 9) + 2;
      answer = Math.floor(Math.random() * (5 * difficulty)) + 1;
      a = answer * b;
      qText = `${a} ÷ ${b} = ?`;
      break;
  }

  return { question: qText, answer };
}

// ============================================================
// 게임 로직
// ============================================================
function update() {
  if (!player) return;
  frameCount++;

  // 플레이어 이동
  if ((keys['ArrowLeft'] || keys['a']) && player.x - player.w / 2 > 0)
    player.x -= player.speed;
  if ((keys['ArrowRight'] || keys['d']) && player.x + player.w / 2 < W)
    player.x += player.speed;
  if ((keys['ArrowUp'] || keys['w']) && player.y - player.h / 2 > 0)
    player.y -= player.speed;
  if ((keys['ArrowDown'] || keys['s']) && player.y + player.h / 2 < H)
    player.y += player.speed;

  // 무적 타이머
  if (player.invincible > 0) player.invincible--;

  // 자동 발사
  fireTimer++;
  if (fireTimer >= player.fireRate) {
    fireTimer = 0;
    const bColor = PLANE_TYPES[player.type].bulletColor;
    if (player.type === 1) {
      // 스트라이커: 2발
      bullets.push({ x: player.x - 8, y: player.y - player.h / 2, w: 4, h: 12, speed: 9, color: bColor });
      bullets.push({ x: player.x + 8, y: player.y - player.h / 2, w: 4, h: 12, speed: 9, color: bColor });
    } else {
      bullets.push({ x: player.x, y: player.y - player.h / 2, w: 5, h: 14, speed: 8, color: bColor });
    }
  }

  // 총알 업데이트
  for (let i = bullets.length - 1; i >= 0; i--) {
    bullets[i].y -= bullets[i].speed;
    if (bullets[i].y < -20) bullets.splice(i, 1);
  }

  // 적 총알 업데이트
  for (let i = enemyBullets.length - 1; i >= 0; i--) {
    const eb = enemyBullets[i];
    eb.x += eb.vx;
    eb.y += eb.vy;
    if (eb.y > H + 20 || eb.x < -20 || eb.x > W + 20) {
      enemyBullets.splice(i, 1);
      continue;
    }
    // 플레이어 충돌
    if (player.invincible <= 0 && hitTest(eb.x, eb.y, 4, 4, player.x, player.y, player.w * 0.5, player.h * 0.5)) {
      enemyBullets.splice(i, 1);
      playerHit();
    }
  }

  // 적 스폰
  if (!bossActive) {
    const spawnRate = 0.02 + currentStage * 0.008;
    if (Math.random() < spawnRate) {
      enemies.push(createEnemy(currentStage));
    }
  }

  // 적 업데이트
  for (let i = enemies.length - 1; i >= 0; i--) {
    const e = enemies[i];
    e.y += e.speed;
    if (e.y > H + 50) { enemies.splice(i, 1); continue; }

    // 적 사격
    if (e.canShoot) {
      e.shootTimer--;
      if (e.shootTimer <= 0) {
        e.shootTimer = 80 + Math.random() * 60;
        const dx = player.x - e.x;
        const dy = player.y - e.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        enemyBullets.push({
          x: e.x, y: e.y + e.h / 2,
          vx: (dx / dist) * 3,
          vy: (dy / dist) * 3,
          color: '#ff4488',
        });
      }
    }

    // 총알 충돌
    for (let j = bullets.length - 1; j >= 0; j--) {
      if (hitTest(bullets[j].x, bullets[j].y, bullets[j].w, bullets[j].h, e.x, e.y, e.w, e.h)) {
        bullets.splice(j, 1);
        e.hp--;
        if (e.hp <= 0) {
          spawnParticles(e.x, e.y, e.color, 8);
          score += e.score;
          stageKills++;
          enemies.splice(i, 1);
        }
        break;
      }
    }

    // 플레이어 충돌
    if (player.invincible <= 0 && hitTest(player.x, player.y, player.w * 0.4, player.h * 0.4, e.x, e.y, e.w * 0.6, e.h * 0.6)) {
      spawnParticles(e.x, e.y, e.color, 6);
      enemies.splice(i, 1);
      playerHit();
    }
  }

  // 보스 진입
  if (!bossActive && stageKills >= killsForBoss) {
    bossActive = true;
    boss = createBoss(currentStage);
    enemies = [];
  }

  // 보스 업데이트
  if (boss) {
    if (boss.entering) {
      boss.y += 1.5;
      if (boss.y >= boss.targetY) {
        boss.y = boss.targetY;
        boss.entering = false;
        triggerQuiz();
      }
    } else {
      // 보스 좌우 이동
      boss.moveTimer++;
      if (boss.moveTimer > 60) {
        boss.moveTimer = 0;
        boss.moveDir *= -1;
      }
      boss.x += boss.moveDir * 1.5;
      boss.x = Math.max(boss.w / 2 + 10, Math.min(W - boss.w / 2 - 10, boss.x));

      // 보스 사격
      boss.shootTimer++;
      if (boss.shootTimer > 40 - currentStage * 5) {
        boss.shootTimer = 0;
        const dx = player.x - boss.x;
        const dy = player.y - boss.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        enemyBullets.push({
          x: boss.x, y: boss.y + boss.h / 2,
          vx: (dx / dist) * (2.5 + currentStage * 0.5),
          vy: (dy / dist) * (2.5 + currentStage * 0.5),
          color: boss.color,
        });
      }

      // 총알 -> 보스 충돌 (퀴즈 중이 아닐 때만)
      for (let j = bullets.length - 1; j >= 0; j--) {
        if (hitTest(bullets[j].x, bullets[j].y, bullets[j].w, bullets[j].h, boss.x, boss.y, boss.w, boss.h)) {
          bullets.splice(j, 1);
          spawnParticles(boss.x + (Math.random() - 0.5) * boss.w, boss.y + (Math.random() - 0.5) * boss.h, '#ffaa00', 3);
          // 총알로는 소량 데미지
          boss.hp -= 0.5;
          if (boss.hp <= 0) {
            bossDied();
          }
        }
      }
    }
  }
}

function hitTest(ax, ay, aw, ah, bx, by, bw, bh) {
  return Math.abs(ax - bx) < (aw + bw) / 2 && Math.abs(ay - by) < (ah + bh) / 2;
}

function playerHit() {
  player.hp--;
  player.invincible = 60;
  spawnParticles(player.x, player.y, '#ffffff', 5);
  if (player.hp <= 0) {
    gameOver();
  }
}

function triggerQuiz() {
  state = 'quiz';
  const quiz = generateQuiz(currentStage);
  correctAnswer = quiz.answer;
  quizDamage = 3 + currentStage * 2;
  questionEl.textContent = quiz.question;
  quizFeedback.textContent = '';
  answerEl.value = '';
  quizContainer.classList.remove('hidden');
  answerEl.focus();
}

function submitQuizAnswer() {
  const val = parseInt(answerEl.value, 10);
  if (isNaN(val)) return;

  if (val === correctAnswer) {
    quizFeedback.style.color = '#00ff88';
    quizFeedback.textContent = '정답! 보스에게 큰 데미지!';
    if (boss) {
      boss.hp -= quizDamage;
      spawnParticles(boss.x, boss.y, '#ffff00', 15);
      if (boss.hp <= 0) {
        quizContainer.classList.add('hidden');
        bossDied();
        return;
      }
    }
  } else {
    quizFeedback.style.color = '#ff4466';
    quizFeedback.textContent = `오답! 정답: ${correctAnswer}`;
    player.hp--;
    if (player.hp <= 0) {
      quizContainer.classList.add('hidden');
      gameOver();
      return;
    }
  }

  setTimeout(() => {
    quizContainer.classList.add('hidden');
    state = 'playing';
    // 다음 퀴즈 예약
    if (boss && boss.hp > 0) {
      setTimeout(() => {
        if (state === 'playing' && boss && boss.hp > 0) {
          triggerQuiz();
        }
      }, 3000);
    }
  }, 1000);
}

function bossDied() {
  spawnParticles(boss.x, boss.y, boss.color, 30);
  spawnParticles(boss.x, boss.y, '#ffff00', 20);
  score += 100 * currentStage;
  boss = null;
  bossActive = false;

  if (currentStage >= 3) {
    winGame();
  } else {
    showStageClear();
  }
}

function showStageClear() {
  state = 'stageclear';
  stageClearText.textContent = `STAGE ${currentStage} CLEAR!`;
  stageClear.classList.remove('hidden');
  enemies = [];
  enemyBullets = [];

  setTimeout(() => {
    stageClear.classList.add('hidden');
    currentStage++;
    stageKills = 0;
    killsForBoss = 10 + currentStage * 5;
    state = 'playing';
  }, 2500);
}

function gameOver() {
  state = 'gameover';
  cancelAnimationFrame(animFrame);
  finalScoreEl.textContent = score;
  finalStageEl.textContent = currentStage;
  gameOverScreen.classList.remove('hidden');
  hudEl.classList.add('hidden');
}

function winGame() {
  state = 'win';
  cancelAnimationFrame(animFrame);
  winScoreEl.textContent = score;
  winScreen.classList.remove('hidden');
  hudEl.classList.add('hidden');
}

// ============================================================
// 메인 렌더 루프
// ============================================================
function render() {
  ctx.clearRect(0, 0, W, H);

  // 배경
  ctx.fillStyle = '#000011';
  ctx.fillRect(0, 0, W, H);
  drawStars();

  if (state === 'playing' || state === 'quiz' || state === 'stageclear') {
    // 적 총알
    enemyBullets.forEach(eb => {
      ctx.fillStyle = eb.color;
      ctx.shadowBlur = 6;
      ctx.shadowColor = eb.color;
      ctx.beginPath();
      ctx.arc(eb.x, eb.y, 4, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;
    });

    // 적
    enemies.forEach(drawEnemy);

    // 보스
    if (boss) drawBoss(boss);

    // 플레이어 총알
    bullets.forEach(drawBullet);

    // 플레이어
    drawPlayer();

    // 파티클
    updateParticles();

    if (state === 'playing') {
      update();
    } else if (state === 'quiz') {
      // 퀴즈 중에도 보스 이동 & 사격
      if (boss && !boss.entering) {
        boss.moveTimer++;
        if (boss.moveTimer > 60) { boss.moveTimer = 0; boss.moveDir *= -1; }
        boss.x += boss.moveDir * 1;
        boss.x = Math.max(boss.w / 2 + 10, Math.min(W - boss.w / 2 - 10, boss.x));
      }
      frameCount++;
    }

    updateHUD();
  }

  animFrame = requestAnimationFrame(render);
}

// ============================================================
// 이벤트
// ============================================================
document.getElementById('start-button').addEventListener('click', () => {
  startScreen.classList.add('hidden');
  selectScreen.classList.remove('hidden');
  drawPlanePreviews();
  state = 'select';
});

document.querySelectorAll('.plane-card').forEach(card => {
  card.addEventListener('click', () => {
    selectedPlane = parseInt(card.dataset.plane, 10);
    selectScreen.classList.add('hidden');
    startPlaying();
  });
});

function startPlaying() {
  score = 0;
  currentStage = 1;
  stageKills = 0;
  killsForBoss = 10;
  bullets = [];
  enemies = [];
  enemyBullets = [];
  particles = [];
  boss = null;
  bossActive = false;
  fireTimer = 0;
  frameCount = 0;
  player = createPlayer(selectedPlane);
  state = 'playing';
  hudEl.classList.remove('hidden');
  render();
}

submitBtn.addEventListener('click', submitQuizAnswer);
answerEl.addEventListener('keydown', e => {
  if (e.key === 'Enter') submitQuizAnswer();
});

document.getElementById('restart-button').addEventListener('click', () => {
  gameOverScreen.classList.add('hidden');
  selectScreen.classList.remove('hidden');
  drawPlanePreviews();
  state = 'select';
});

document.getElementById('win-restart-button').addEventListener('click', () => {
  winScreen.classList.add('hidden');
  selectScreen.classList.remove('hidden');
  drawPlanePreviews();
  state = 'select';
});

// 초기 상태
hudEl.classList.add('hidden');
