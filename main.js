// ============================================================
// 수학 히어로 슈팅게임
// ============================================================
const canvas = document.getElementById('game-canvas');
const ctx = canvas.getContext('2d');
const W = canvas.width;
const H = canvas.height;

// UI
const startScreen = document.getElementById('start-screen');
const selectScreen = document.getElementById('select-screen');
const quizContainer = document.getElementById('quiz-container');
const stageClear = document.getElementById('stage-clear');
const stageClearText = document.getElementById('stage-clear-text');
const gameOverScreen = document.getElementById('game-over-screen');
const winScreen = document.getElementById('win-screen');
const hudEl = document.getElementById('hud');
const scoreDisplay = document.getElementById('score-display');
const hpDisplay = document.getElementById('hp-display');
const stageLabel = document.getElementById('stage-label');
const killProgress = document.getElementById('kill-progress');
const bossHpLabel = document.getElementById('boss-hp-label');
const bossHpOuter = document.getElementById('boss-hp-outer');
const bossHpInner = document.getElementById('boss-hp-inner');
const questionEl = document.getElementById('question');
const choicesEl = document.getElementById('choices');
const quizFeedback = document.getElementById('quiz-feedback');
const finalScoreEl = document.getElementById('final-score');
const finalStageEl = document.getElementById('final-stage');
const winScoreEl = document.getElementById('win-score');

// ============================================================
// 비행기 타입
// ============================================================
const PLANE_TYPES = [
  { name: '블루제트', bodyColor: '#4facfe', wingColor: '#00c6fb', speed: 6, fireRate: 14, maxHp: 5, bulletColor: '#4facfe', bulletCount: 1 },
  { name: '레드윙',   bodyColor: '#ff6b6b', wingColor: '#ee5a24', speed: 5, fireRate: 9,  maxHp: 4, bulletColor: '#ff6b6b', bulletCount: 2 },
  { name: '그린탱크', bodyColor: '#2ecc71', wingColor: '#27ae60', speed: 4, fireRate: 16, maxHp: 8, bulletColor: '#2ecc71', bulletCount: 1 },
];

// ============================================================
// 비행기 그리기
// ============================================================
function drawPlane(c, type, cx, cy, w, h) {
  const t = PLANE_TYPES[type];
  c.save();
  c.translate(cx, cy);

  // 엔진 불꽃
  const fl = 0.7 + Math.random() * 0.5;
  c.fillStyle = '#ffa502';
  c.globalAlpha = 0.8;
  if (type === 1) {
    [- w * 0.2, w * 0.2].forEach(ox => {
      c.beginPath();
      c.moveTo(ox - w * 0.06, h * 0.35);
      c.lineTo(ox, h * 0.35 + h * 0.2 * fl);
      c.lineTo(ox + w * 0.06, h * 0.35);
      c.fill();
    });
  } else {
    c.beginPath();
    c.moveTo(-w * 0.08, h * 0.35);
    c.lineTo(0, h * 0.35 + h * 0.25 * fl);
    c.lineTo(w * 0.08, h * 0.35);
    c.fill();
  }
  c.globalAlpha = 1;

  // 날개
  c.fillStyle = t.wingColor;
  if (type === 0) {
    c.beginPath();
    c.moveTo(-w * 0.1, h * 0.05);
    c.lineTo(-w * 0.5, h * 0.3);
    c.lineTo(-w * 0.4, h * 0.35);
    c.lineTo(-w * 0.05, h * 0.15);
    c.fill();
    c.beginPath();
    c.moveTo(w * 0.1, h * 0.05);
    c.lineTo(w * 0.5, h * 0.3);
    c.lineTo(w * 0.4, h * 0.35);
    c.lineTo(w * 0.05, h * 0.15);
    c.fill();
  } else if (type === 1) {
    c.beginPath();
    c.moveTo(-w * 0.12, 0);
    c.lineTo(-w * 0.48, h * 0.2);
    c.lineTo(-w * 0.5, h * 0.35);
    c.lineTo(-w * 0.15, h * 0.2);
    c.fill();
    c.beginPath();
    c.moveTo(w * 0.12, 0);
    c.lineTo(w * 0.48, h * 0.2);
    c.lineTo(w * 0.5, h * 0.35);
    c.lineTo(w * 0.15, h * 0.2);
    c.fill();
  } else {
    c.beginPath();
    c.moveTo(-w * 0.15, -h * 0.05);
    c.lineTo(-w * 0.5, h * 0.15);
    c.lineTo(-w * 0.48, h * 0.35);
    c.lineTo(-w * 0.1, h * 0.2);
    c.fill();
    c.beginPath();
    c.moveTo(w * 0.15, -h * 0.05);
    c.lineTo(w * 0.5, h * 0.15);
    c.lineTo(w * 0.48, h * 0.35);
    c.lineTo(w * 0.1, h * 0.2);
    c.fill();
  }

  // 몸체
  c.fillStyle = t.bodyColor;
  c.beginPath();
  c.moveTo(0, -h * 0.45);
  c.quadraticCurveTo(-w * 0.18, -h * 0.1, -w * 0.12, h * 0.35);
  c.lineTo(w * 0.12, h * 0.35);
  c.quadraticCurveTo(w * 0.18, -h * 0.1, 0, -h * 0.45);
  c.fill();

  // 캐노피 (창문)
  c.fillStyle = 'rgba(255,255,255,0.7)';
  c.beginPath();
  c.ellipse(0, -h * 0.12, w * 0.07, h * 0.09, 0, 0, Math.PI * 2);
  c.fill();

  // 포트리스 실드
  if (type === 2) {
    c.strokeStyle = 'rgba(46, 204, 113, 0.3)';
    c.lineWidth = 3;
    c.beginPath();
    c.arc(0, 0, w * 0.55, 0, Math.PI * 2);
    c.stroke();
  }

  c.restore();
}

function drawPlanePreviews() {
  document.querySelectorAll('.plane-preview').forEach((cvs, i) => {
    const pc = cvs.getContext('2d');
    pc.clearRect(0, 0, 90, 90);
    drawPlane(pc, i, 45, 45, 60, 70);
  });
}

// ============================================================
// 게임 상태
// ============================================================
let state = 'menu';
let selectedPlane = 0;
let score = 0;
let currentStage = 1;
let stageKills = 0;
const KILLS_PER_STAGE = [8, 12, 15];
let animFrame = null;
let frameCount = 0;

// 별 배경
const stars = [];
for (let i = 0; i < 80; i++) {
  stars.push({
    x: Math.random() * W,
    y: Math.random() * H,
    speed: 0.5 + Math.random() * 2,
    size: 1 + Math.random() * 2,
    twinkle: Math.random() * Math.PI * 2,
  });
}

// 구름 배경
const clouds = [];
for (let i = 0; i < 6; i++) {
  clouds.push({
    x: Math.random() * W,
    y: Math.random() * H,
    w: 60 + Math.random() * 80,
    speed: 0.2 + Math.random() * 0.3,
    alpha: 0.04 + Math.random() * 0.06,
  });
}

let particles = [];
let player = null;
let bullets = [];
let enemies = [];
let enemyBullets = [];
let boss = null;
let bossActive = false;
let fireTimer = 0;
let correctAnswer = 0;
let quizActive = false;

const keys = {};
window.addEventListener('keydown', e => {
  keys[e.key] = true;
  if (['ArrowUp','ArrowDown','ArrowLeft','ArrowRight',' '].includes(e.key)) e.preventDefault();
});
window.addEventListener('keyup', e => { delete keys[e.key]; });

// 터치 지원
let touchX = null;
let touchY = null;
canvas.addEventListener('touchstart', e => {
  e.preventDefault();
  const r = canvas.getBoundingClientRect();
  const scaleX = W / r.width;
  const scaleY = H / r.height;
  touchX = (e.touches[0].clientX - r.left) * scaleX;
  touchY = (e.touches[0].clientY - r.top) * scaleY;
});
canvas.addEventListener('touchmove', e => {
  e.preventDefault();
  const r = canvas.getBoundingClientRect();
  const scaleX = W / r.width;
  const scaleY = H / r.height;
  touchX = (e.touches[0].clientX - r.left) * scaleX;
  touchY = (e.touches[0].clientY - r.top) * scaleY;
});
canvas.addEventListener('touchend', () => { touchX = null; touchY = null; });

// ============================================================
// 플레이어
// ============================================================
function createPlayer(type) {
  const t = PLANE_TYPES[type];
  return {
    type,
    x: W / 2,
    y: H - 90,
    w: 44,
    h: 50,
    speed: t.speed,
    fireRate: t.fireRate,
    hp: t.maxHp,
    maxHp: t.maxHp,
    invincible: 0,
  };
}

// ============================================================
// 적
// ============================================================
function createEnemy(stage) {
  const configs = [
    { w: 30, h: 30, hp: 1, speed: 1.8, colors: ['#ff6348','#ff4757'], score: 10, pattern: 'straight' },
    { w: 32, h: 32, hp: 1, speed: 2.2, colors: ['#ffa502','#ff6348'], score: 15, pattern: 'zigzag' },
    { w: 36, h: 36, hp: 2, speed: 1.5, colors: ['#a55eea','#8854d0'], score: 25, pattern: 'straight' },
  ];
  const idx = Math.floor(Math.random() * Math.min(stage + 1, configs.length));
  const cfg = configs[idx];
  return {
    x: 30 + Math.random() * (W - 60),
    y: -40,
    w: cfg.w,
    h: cfg.h,
    hp: cfg.hp,
    speed: cfg.speed + (stage - 1) * 0.3,
    color1: cfg.colors[0],
    color2: cfg.colors[1],
    score: cfg.score,
    pattern: cfg.pattern,
    phase: Math.random() * Math.PI * 2,
    canShoot: stage >= 2 && Math.random() < 0.3,
    shootTimer: 60 + Math.random() * 80,
  };
}

function drawEnemy(e) {
  ctx.save();
  ctx.translate(e.x, e.y);
  // 몸체 (아래를 향한 비행기)
  ctx.fillStyle = e.color1;
  ctx.beginPath();
  ctx.moveTo(0, e.h * 0.5);
  ctx.lineTo(-e.w * 0.45, -e.h * 0.2);
  ctx.lineTo(-e.w * 0.2, -e.h * 0.5);
  ctx.lineTo(e.w * 0.2, -e.h * 0.5);
  ctx.lineTo(e.w * 0.45, -e.h * 0.2);
  ctx.closePath();
  ctx.fill();
  // 날개
  ctx.fillStyle = e.color2;
  ctx.beginPath();
  ctx.moveTo(-e.w * 0.15, -e.h * 0.1);
  ctx.lineTo(-e.w * 0.5, -e.h * 0.4);
  ctx.lineTo(-e.w * 0.3, 0);
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(e.w * 0.15, -e.h * 0.1);
  ctx.lineTo(e.w * 0.5, -e.h * 0.4);
  ctx.lineTo(e.w * 0.3, 0);
  ctx.fill();
  // 눈 (귀여운 적)
  ctx.fillStyle = '#fff';
  ctx.beginPath();
  ctx.arc(-e.w * 0.12, e.h * 0.1, 4, 0, Math.PI * 2);
  ctx.arc(e.w * 0.12, e.h * 0.1, 4, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#000';
  ctx.beginPath();
  ctx.arc(-e.w * 0.12, e.h * 0.12, 2, 0, Math.PI * 2);
  ctx.arc(e.w * 0.12, e.h * 0.12, 2, 0, Math.PI * 2);
  ctx.fill();
  // HP > 1
  if (e.hp > 1) {
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 11px Jua';
    ctx.textAlign = 'center';
    ctx.fillText(e.hp, 0, e.h * 0.35);
  }
  ctx.restore();
}

// ============================================================
// 보스
// ============================================================
const BOSS_DATA = [
  { name: '더하기 대장', emoji: '👹', hp: 12, color: '#ff6b6b', color2: '#ee5a24', w: 80, h: 70 },
  { name: '빼기 마왕', emoji: '👾', hp: 18, color: '#a55eea', color2: '#8854d0', w: 95, h: 80 },
  { name: '곱셈의 왕', emoji: '🐉', hp: 25, color: '#ff4757', color2: '#c0392b', w: 110, h: 90 },
];

function createBoss(stage) {
  const d = BOSS_DATA[stage - 1];
  return {
    ...d,
    stage,
    x: W / 2,
    y: -100,
    targetY: 90,
    maxHp: d.hp,
    entering: true,
    moveTimer: 0,
    moveDir: 1,
    shootTimer: 0,
    defeated: false,
  };
}

function drawBoss(b) {
  ctx.save();
  ctx.translate(b.x, b.y);

  const pulse = 1 + 0.03 * Math.sin(frameCount * 0.08);
  ctx.scale(pulse, pulse);

  // 글로우
  ctx.shadowBlur = 25;
  ctx.shadowColor = b.color;

  // 기체
  ctx.fillStyle = b.color;
  ctx.beginPath();
  if (b.stage === 1) {
    ctx.moveTo(0, b.h * 0.5);
    ctx.lineTo(-b.w * 0.5, 0);
    ctx.lineTo(-b.w * 0.35, -b.h * 0.5);
    ctx.lineTo(0, -b.h * 0.3);
    ctx.lineTo(b.w * 0.35, -b.h * 0.5);
    ctx.lineTo(b.w * 0.5, 0);
  } else if (b.stage === 2) {
    ctx.moveTo(0, b.h * 0.5);
    ctx.lineTo(-b.w * 0.3, b.h * 0.2);
    ctx.lineTo(-b.w * 0.55, b.h * 0.1);
    ctx.lineTo(-b.w * 0.4, -b.h * 0.3);
    ctx.lineTo(-b.w * 0.15, -b.h * 0.5);
    ctx.lineTo(b.w * 0.15, -b.h * 0.5);
    ctx.lineTo(b.w * 0.4, -b.h * 0.3);
    ctx.lineTo(b.w * 0.55, b.h * 0.1);
    ctx.lineTo(b.w * 0.3, b.h * 0.2);
  } else {
    // 크라운 형태 최종보스
    ctx.moveTo(0, b.h * 0.5);
    ctx.lineTo(-b.w * 0.25, b.h * 0.25);
    ctx.lineTo(-b.w * 0.5, b.h * 0.3);
    ctx.lineTo(-b.w * 0.45, -b.h * 0.1);
    ctx.lineTo(-b.w * 0.55, -b.h * 0.45);
    ctx.lineTo(-b.w * 0.25, -b.h * 0.25);
    ctx.lineTo(0, -b.h * 0.5);
    ctx.lineTo(b.w * 0.25, -b.h * 0.25);
    ctx.lineTo(b.w * 0.55, -b.h * 0.45);
    ctx.lineTo(b.w * 0.45, -b.h * 0.1);
    ctx.lineTo(b.w * 0.5, b.h * 0.3);
    ctx.lineTo(b.w * 0.25, b.h * 0.25);
  }
  ctx.closePath();
  ctx.fill();

  ctx.shadowBlur = 0;
  ctx.strokeStyle = 'rgba(255,255,255,0.5)';
  ctx.lineWidth = 2;
  ctx.stroke();

  // 보스 얼굴
  ctx.fillStyle = '#fff';
  ctx.beginPath();
  ctx.arc(-b.w * 0.14, -b.h * 0.02, 8, 0, Math.PI * 2);
  ctx.arc(b.w * 0.14, -b.h * 0.02, 8, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#000';
  ctx.beginPath();
  ctx.arc(-b.w * 0.14, 0, 4, 0, Math.PI * 2);
  ctx.arc(b.w * 0.14, 0, 4, 0, Math.PI * 2);
  ctx.fill();
  // 입
  ctx.strokeStyle = '#000';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(0, b.h * 0.15, 10, 0, Math.PI);
  ctx.stroke();

  ctx.restore();
}

// ============================================================
// 파티클
// ============================================================
function spawnParticles(x, y, color, count) {
  for (let i = 0; i < count; i++) {
    const angle = Math.random() * Math.PI * 2;
    const speed = 1 + Math.random() * 4;
    particles.push({
      x, y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      life: 25 + Math.random() * 20,
      maxLife: 45,
      color,
      size: 2 + Math.random() * 4,
    });
  }
}

function updateAndDrawParticles() {
  for (let i = particles.length - 1; i >= 0; i--) {
    const p = particles[i];
    p.x += p.vx;
    p.y += p.vy;
    p.vx *= 0.97;
    p.vy *= 0.97;
    p.life--;
    if (p.life <= 0) { particles.splice(i, 1); continue; }
    ctx.globalAlpha = p.life / p.maxLife;
    ctx.fillStyle = p.color;
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.size * (p.life / p.maxLife), 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;
}

// ============================================================
// 배경
// ============================================================
const BG_COLORS = [
  ['#0c0c3a', '#1a1a5e'],  // Stage 1: 밤하늘
  ['#1a0a3e', '#2d1b69'],  // Stage 2: 보라 우주
  ['#2a0a0a', '#4a1020'],  // Stage 3: 붉은 우주
];

function drawBackground() {
  const colors = BG_COLORS[currentStage - 1] || BG_COLORS[0];
  const grad = ctx.createLinearGradient(0, 0, 0, H);
  grad.addColorStop(0, colors[0]);
  grad.addColorStop(1, colors[1]);
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, W, H);

  // 별
  stars.forEach(s => {
    s.y += s.speed;
    s.twinkle += 0.03;
    if (s.y > H) { s.y = -5; s.x = Math.random() * W; }
    const alpha = 0.4 + 0.4 * Math.sin(s.twinkle);
    ctx.fillStyle = `rgba(255,255,255,${alpha})`;
    ctx.beginPath();
    ctx.arc(s.x, s.y, s.size, 0, Math.PI * 2);
    ctx.fill();
  });

  // 구름
  clouds.forEach(cl => {
    cl.y += cl.speed;
    if (cl.y > H + 60) { cl.y = -60; cl.x = Math.random() * W; }
    ctx.fillStyle = `rgba(255,255,255,${cl.alpha})`;
    ctx.beginPath();
    ctx.ellipse(cl.x, cl.y, cl.w, cl.w * 0.4, 0, 0, Math.PI * 2);
    ctx.fill();
  });
}

// ============================================================
// HUD
// ============================================================
function updateHUD() {
  scoreDisplay.textContent = `⭐ ${score}`;
  let hearts = '';
  for (let i = 0; i < player.maxHp; i++) hearts += i < player.hp ? '❤️' : '🖤';
  hpDisplay.textContent = hearts;
  stageLabel.textContent = `STAGE ${currentStage}`;

  const needed = KILLS_PER_STAGE[currentStage - 1] || 10;
  if (!bossActive) {
    killProgress.textContent = `${stageKills}/${needed} 처치`;
  } else {
    killProgress.textContent = '⚔️ 보스전!';
  }

  if (bossActive && boss) {
    bossHpLabel.classList.remove('hidden');
    bossHpOuter.classList.remove('hidden');
    const pct = Math.max(0, (boss.hp / boss.maxHp) * 100);
    bossHpInner.style.width = pct + '%';
  } else {
    bossHpLabel.classList.add('hidden');
    bossHpOuter.classList.add('hidden');
  }
}

// ============================================================
// 퀴즈 (객관식)
// ============================================================
function generateQuiz(stage) {
  let a, b, op, answer, qText;

  const ops = ['+', '-'];
  if (stage >= 2) ops.push('×');
  if (stage >= 3) ops.push('÷');
  op = ops[Math.floor(Math.random() * ops.length)];

  switch (op) {
    case '+':
      a = Math.floor(Math.random() * (5 + stage * 3)) + 1;
      b = Math.floor(Math.random() * (5 + stage * 3)) + 1;
      answer = a + b;
      qText = `${a} + ${b} = ?`;
      break;
    case '-':
      a = Math.floor(Math.random() * (8 + stage * 3)) + 3;
      b = Math.floor(Math.random() * (a - 1)) + 1;
      answer = a - b;
      qText = `${a} - ${b} = ?`;
      break;
    case '×':
      a = Math.floor(Math.random() * 8) + 2;
      b = Math.floor(Math.random() * 8) + 2;
      answer = a * b;
      qText = `${a} × ${b} = ?`;
      break;
    case '÷':
      b = Math.floor(Math.random() * 8) + 2;
      answer = Math.floor(Math.random() * 8) + 1;
      a = answer * b;
      qText = `${a} ÷ ${b} = ?`;
      break;
  }

  // 오답 생성 (정답 근처에서)
  const wrongSet = new Set();
  while (wrongSet.size < 3) {
    let wrong;
    const offset = Math.floor(Math.random() * 6) + 1;
    wrong = answer + (Math.random() < 0.5 ? offset : -offset);
    if (wrong < 0) wrong = answer + offset + Math.floor(Math.random() * 3);
    if (wrong !== answer && !wrongSet.has(wrong)) {
      wrongSet.add(wrong);
    }
  }

  const choices = [answer, ...wrongSet];
  // 셔플
  for (let i = choices.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [choices[i], choices[j]] = [choices[j], choices[i]];
  }

  return { question: qText, answer, choices };
}

function triggerQuiz() {
  if (state === 'gameover' || state === 'win' || state === 'stageclear') return;
  if (!boss || boss.defeated) return;

  quizActive = true;
  state = 'quiz';
  const quiz = generateQuiz(currentStage);
  correctAnswer = quiz.answer;
  questionEl.textContent = quiz.question;
  quizFeedback.textContent = '';

  choicesEl.innerHTML = '';
  quiz.choices.forEach(val => {
    const btn = document.createElement('button');
    btn.className = 'choice-btn';
    btn.textContent = val;
    btn.addEventListener('click', () => handleChoice(btn, val));
    choicesEl.appendChild(btn);
  });

  quizContainer.classList.remove('hidden');
}

function handleChoice(btn, value) {
  if (!quizActive) return;
  quizActive = false;

  const allBtns = choicesEl.querySelectorAll('.choice-btn');
  allBtns.forEach(b => { b.style.pointerEvents = 'none'; });

  if (value === correctAnswer) {
    btn.classList.add('correct');
    quizFeedback.style.color = '#2ecc71';
    quizFeedback.textContent = '🎉 정답! 보스에게 큰 데미지!';
    if (boss && !boss.defeated) {
      const dmg = 3 + currentStage * 2;
      boss.hp -= dmg;
      spawnParticles(boss.x, boss.y, '#ffff00', 15);
      if (boss.hp <= 0) {
        boss.hp = 0;
        boss.defeated = true;
        setTimeout(() => {
          quizContainer.classList.add('hidden');
          bossDied();
        }, 800);
        return;
      }
    }
  } else {
    btn.classList.add('wrong');
    // 정답 버튼 표시
    allBtns.forEach(b => {
      if (parseInt(b.textContent) === correctAnswer) b.classList.add('correct');
    });
    quizFeedback.style.color = '#e74c3c';
    quizFeedback.textContent = `😢 아쉬워요! 정답은 ${correctAnswer}`;
    if (player) {
      player.hp--;
      if (player.hp <= 0) {
        setTimeout(() => {
          quizContainer.classList.add('hidden');
          gameOver();
        }, 800);
        return;
      }
    }
  }

  setTimeout(() => {
    quizContainer.classList.add('hidden');
    state = 'playing';
    // 보스가 아직 살아있으면 다음 퀴즈
    if (boss && !boss.defeated && boss.hp > 0) {
      setTimeout(() => {
        if (state === 'playing' && boss && !boss.defeated && boss.hp > 0) {
          triggerQuiz();
        }
      }, 3500);
    }
  }, 1200);
}

// ============================================================
// 충돌
// ============================================================
function hitTest(ax, ay, aw, ah, bx, by, bw, bh) {
  return Math.abs(ax - bx) < (aw + bw) / 2 && Math.abs(ay - by) < (ah + bh) / 2;
}

function playerHit() {
  if (!player || player.invincible > 0) return;
  player.hp--;
  player.invincible = 60;
  spawnParticles(player.x, player.y, '#fff', 6);
  if (player.hp <= 0) gameOver();
}

// ============================================================
// 보스 처치 / 스테이지 진행
// ============================================================
function bossDied() {
  if (!boss) return;
  spawnParticles(boss.x, boss.y, boss.color, 30);
  spawnParticles(boss.x, boss.y, '#ffcc02', 20);
  spawnParticles(boss.x, boss.y, '#fff', 15);
  score += 100 * currentStage;

  const clearedStage = currentStage;
  boss = null;
  bossActive = false;
  enemyBullets = [];

  if (clearedStage >= 3) {
    // 모든 보스 클리어!
    setTimeout(() => winGame(), 500);
  } else {
    // 다음 스테이지
    showStageClear(clearedStage);
  }
}

function showStageClear(clearedStage) {
  state = 'stageclear';
  stageClearText.textContent = `🎉 STAGE ${clearedStage} 클리어!`;
  stageClear.classList.remove('hidden');
  enemies = [];
  enemyBullets = [];
  bullets = [];

  setTimeout(() => {
    stageClear.classList.add('hidden');
    currentStage = clearedStage + 1;
    stageKills = 0;
    state = 'playing';
  }, 2500);
}

function gameOver() {
  state = 'gameover';
  quizContainer.classList.add('hidden');
  finalScoreEl.textContent = score;
  finalStageEl.textContent = currentStage;
  gameOverScreen.classList.remove('hidden');
  hudEl.classList.add('hidden');
}

function winGame() {
  state = 'win';
  quizContainer.classList.add('hidden');
  winScoreEl.textContent = score;
  winScreen.classList.remove('hidden');
  hudEl.classList.add('hidden');
}

// ============================================================
// 업데이트
// ============================================================
function update() {
  if (!player || state !== 'playing') return;
  frameCount++;

  // 이동
  if (keys['ArrowLeft'] || keys['a']) player.x -= player.speed;
  if (keys['ArrowRight'] || keys['d']) player.x += player.speed;
  if (keys['ArrowUp'] || keys['w']) player.y -= player.speed;
  if (keys['ArrowDown'] || keys['s']) player.y += player.speed;

  // 터치 이동
  if (touchX !== null && touchY !== null) {
    const dx = touchX - player.x;
    const dy = touchY - player.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    if (dist > 5) {
      player.x += (dx / dist) * player.speed;
      player.y += (dy / dist) * player.speed;
    }
  }

  // 경계
  player.x = Math.max(player.w / 2, Math.min(W - player.w / 2, player.x));
  player.y = Math.max(player.h / 2, Math.min(H - player.h / 2, player.y));

  if (player.invincible > 0) player.invincible--;

  // 자동 발사
  fireTimer++;
  if (fireTimer >= player.fireRate) {
    fireTimer = 0;
    const bc = PLANE_TYPES[player.type].bulletColor;
    if (PLANE_TYPES[player.type].bulletCount === 2) {
      bullets.push({ x: player.x - 10, y: player.y - player.h / 2, w: 4, h: 12, speed: 9, color: bc });
      bullets.push({ x: player.x + 10, y: player.y - player.h / 2, w: 4, h: 12, speed: 9, color: bc });
    } else {
      bullets.push({ x: player.x, y: player.y - player.h / 2, w: 5, h: 14, speed: 8, color: bc });
    }
  }

  // 총알
  for (let i = bullets.length - 1; i >= 0; i--) {
    bullets[i].y -= bullets[i].speed;
    if (bullets[i].y < -20) bullets.splice(i, 1);
  }

  // 적 총알
  for (let i = enemyBullets.length - 1; i >= 0; i--) {
    const eb = enemyBullets[i];
    eb.x += eb.vx;
    eb.y += eb.vy;
    if (eb.y > H + 20 || eb.y < -20 || eb.x < -20 || eb.x > W + 20) {
      enemyBullets.splice(i, 1);
      continue;
    }
    if (hitTest(eb.x, eb.y, 6, 6, player.x, player.y, player.w * 0.4, player.h * 0.4)) {
      enemyBullets.splice(i, 1);
      playerHit();
    }
  }

  // 적 스폰
  if (!bossActive) {
    const rate = 0.025 + currentStage * 0.005;
    if (Math.random() < rate) enemies.push(createEnemy(currentStage));
  }

  // 적 업데이트
  for (let i = enemies.length - 1; i >= 0; i--) {
    const e = enemies[i];
    e.y += e.speed;
    if (e.pattern === 'zigzag') {
      e.phase += 0.05;
      e.x += Math.sin(e.phase) * 1.5;
    }
    if (e.y > H + 50) { enemies.splice(i, 1); continue; }

    // 적 사격
    if (e.canShoot) {
      e.shootTimer--;
      if (e.shootTimer <= 0) {
        e.shootTimer = 80 + Math.random() * 60;
        const dx = player.x - e.x;
        const dy = player.y - e.y;
        const dist = Math.sqrt(dx * dx + dy * dy) || 1;
        enemyBullets.push({ x: e.x, y: e.y + e.h / 2, vx: (dx / dist) * 2.5, vy: (dy / dist) * 2.5, color: '#ff6b81' });
      }
    }

    // 총알 → 적
    for (let j = bullets.length - 1; j >= 0; j--) {
      if (hitTest(bullets[j].x, bullets[j].y, bullets[j].w, bullets[j].h, e.x, e.y, e.w, e.h)) {
        bullets.splice(j, 1);
        e.hp--;
        spawnParticles(e.x, e.y, e.color1, 4);
        if (e.hp <= 0) {
          spawnParticles(e.x, e.y, e.color1, 10);
          score += e.score;
          stageKills++;
          enemies.splice(i, 1);
        }
        break;
      }
    }

    // 플레이어 ↔ 적
    if (enemies[i] && hitTest(player.x, player.y, player.w * 0.35, player.h * 0.35, e.x, e.y, e.w * 0.5, e.h * 0.5)) {
      spawnParticles(e.x, e.y, e.color1, 8);
      enemies.splice(i, 1);
      playerHit();
    }
  }

  // 보스 스폰
  const needed = KILLS_PER_STAGE[currentStage - 1] || 10;
  if (!bossActive && stageKills >= needed) {
    bossActive = true;
    boss = createBoss(currentStage);
    enemies = [];
  }

  // 보스 업데이트
  if (boss && !boss.defeated) {
    if (boss.entering) {
      boss.y += 2;
      if (boss.y >= boss.targetY) {
        boss.y = boss.targetY;
        boss.entering = false;
        triggerQuiz();
      }
    } else {
      boss.moveTimer++;
      if (boss.moveTimer > 50) { boss.moveTimer = 0; boss.moveDir *= -1; }
      boss.x += boss.moveDir * (1 + currentStage * 0.5);
      boss.x = Math.max(boss.w / 2 + 10, Math.min(W - boss.w / 2 - 10, boss.x));

      // 보스 사격
      boss.shootTimer++;
      if (boss.shootTimer > 50 - currentStage * 8) {
        boss.shootTimer = 0;
        const dx = player.x - boss.x;
        const dy = player.y - boss.y;
        const dist = Math.sqrt(dx * dx + dy * dy) || 1;
        const spd = 2 + currentStage * 0.5;
        enemyBullets.push({ x: boss.x, y: boss.y + boss.h / 2, vx: (dx / dist) * spd, vy: (dy / dist) * spd, color: boss.color });
        if (currentStage >= 3) {
          // 최종보스 추가 탄
          enemyBullets.push({ x: boss.x - 20, y: boss.y + boss.h / 2, vx: (dx / dist) * spd - 0.5, vy: (dy / dist) * spd, color: boss.color });
          enemyBullets.push({ x: boss.x + 20, y: boss.y + boss.h / 2, vx: (dx / dist) * spd + 0.5, vy: (dy / dist) * spd, color: boss.color });
        }
      }

      // 총알 → 보스
      for (let j = bullets.length - 1; j >= 0; j--) {
        if (hitTest(bullets[j].x, bullets[j].y, bullets[j].w, bullets[j].h, boss.x, boss.y, boss.w, boss.h)) {
          bullets.splice(j, 1);
          boss.hp -= 0.3;
          spawnParticles(boss.x + (Math.random() - 0.5) * boss.w * 0.5, boss.y + (Math.random() - 0.5) * boss.h * 0.5, '#ffaa00', 2);
          if (boss.hp <= 0) {
            boss.hp = 0;
            boss.defeated = true;
            bossDied();
          }
        }
      }
    }
  }
}

// ============================================================
// 렌더 루프
// ============================================================
function render() {
  drawBackground();

  if (state === 'playing' || state === 'quiz' || state === 'stageclear') {
    // 적 총알
    enemyBullets.forEach(eb => {
      ctx.fillStyle = eb.color;
      ctx.shadowBlur = 8;
      ctx.shadowColor = eb.color;
      ctx.beginPath();
      ctx.arc(eb.x, eb.y, 5, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;
    });

    enemies.forEach(drawEnemy);
    if (boss && !boss.defeated) drawBoss(boss);

    // 플레이어 총알
    bullets.forEach(b => {
      ctx.fillStyle = b.color;
      ctx.shadowBlur = 6;
      ctx.shadowColor = b.color;
      ctx.fillRect(b.x - b.w / 2, b.y - b.h / 2, b.w, b.h);
      ctx.shadowBlur = 0;
    });

    // 플레이어
    if (player) {
      if (player.invincible <= 0 || Math.floor(frameCount / 4) % 2 === 0) {
        drawPlane(ctx, player.type, player.x - player.w / 2, player.y - player.h / 2, player.w, player.h);
      }
    }

    updateAndDrawParticles();

    if (state === 'playing') {
      update();
    } else if (state === 'quiz') {
      // 퀴즈 중에도 보스 이동
      if (boss && !boss.entering && !boss.defeated) {
        boss.moveTimer++;
        if (boss.moveTimer > 50) { boss.moveTimer = 0; boss.moveDir *= -1; }
        boss.x += boss.moveDir * 0.8;
        boss.x = Math.max(boss.w / 2 + 10, Math.min(W - boss.w / 2 - 10, boss.x));
      }
      frameCount++;
    } else {
      frameCount++;
    }

    if (player) updateHUD();
  }

  animFrame = requestAnimationFrame(render);
}

// ============================================================
// 시작 / 재시작
// ============================================================
function startPlaying() {
  score = 0;
  currentStage = 1;
  stageKills = 0;
  bullets = [];
  enemies = [];
  enemyBullets = [];
  particles = [];
  boss = null;
  bossActive = false;
  fireTimer = 0;
  frameCount = 0;
  quizActive = false;
  player = createPlayer(selectedPlane);
  state = 'playing';
  hudEl.classList.remove('hidden');
  if (animFrame) cancelAnimationFrame(animFrame);
  render();
}

function goToSelect() {
  if (animFrame) cancelAnimationFrame(animFrame);
  state = 'select';
  selectScreen.classList.remove('hidden');
  drawPlanePreviews();
}

// ============================================================
// 이벤트
// ============================================================
document.getElementById('start-button').addEventListener('click', () => {
  startScreen.classList.add('hidden');
  goToSelect();
});

document.querySelectorAll('.plane-card').forEach(card => {
  card.addEventListener('click', () => {
    selectedPlane = parseInt(card.dataset.plane, 10);
    selectScreen.classList.add('hidden');
    startPlaying();
  });
});

document.getElementById('restart-button').addEventListener('click', () => {
  gameOverScreen.classList.add('hidden');
  goToSelect();
});

document.getElementById('win-restart-button').addEventListener('click', () => {
  winScreen.classList.add('hidden');
  goToSelect();
});

// 초기 상태
hudEl.classList.add('hidden');
