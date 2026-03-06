const { createCanvas, registerFont } = require('canvas');
const fs = require('fs');
const path = require('path');

// ---------------------------------------------------------------------------
// Register fonts BEFORE any createCanvas() call
// ---------------------------------------------------------------------------
const dmSansDir = path.join(__dirname, '..', 'node_modules', '@expo-google-fonts', 'dm-sans');
const ibmPlexDir = path.join(__dirname, '..', 'node_modules', '@expo-google-fonts', 'ibm-plex-mono');

// Register each weight as a distinct family name for reliable matching
registerFont(path.join(dmSansDir, '400Regular', 'DMSans_400Regular.ttf'), { family: 'DM Sans' });
registerFont(path.join(dmSansDir, '500Medium', 'DMSans_500Medium.ttf'), { family: 'DM Sans Medium' });
registerFont(path.join(dmSansDir, '600SemiBold', 'DMSans_600SemiBold.ttf'), { family: 'DM Sans SemiBold' });
registerFont(path.join(dmSansDir, '700Bold', 'DMSans_700Bold.ttf'), { family: 'DM Sans Bold' });
registerFont(path.join(dmSansDir, '800ExtraBold', 'DMSans_800ExtraBold.ttf'), { family: 'DM Sans ExtraBold' });
registerFont(path.join(ibmPlexDir, '400Regular', 'IBMPlexMono_400Regular.ttf'), { family: 'IBM Plex Mono' });
registerFont(path.join(ibmPlexDir, '500Medium', 'IBMPlexMono_500Medium.ttf'), { family: 'IBM Plex Mono Medium' });
registerFont(path.join(ibmPlexDir, '600SemiBold', 'IBMPlexMono_600SemiBold.ttf'), { family: 'IBM Plex Mono SemiBold' });

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------
const W = 1290;
const H = 2796;
const OUT_DIR = path.join(__dirname, 'screenshots');

// Colors (from src/theme/colors.ts)
const C = {
  bg: '#F5F5F7',
  card: '#FFFFFF',
  cardBorder: '#D2D2D7',
  accent: '#0071E3',
  accentDark: '#0058B0',
  accentLight: '#EBF5FF',
  textPrimary: '#1D1D1F',
  textSecondary: '#6E6E73',
  textMuted: '#AEAEB2',
  success: '#30D158',
  warning: '#FF9500',
  error: '#FF3B30',
  deviceBody: '#2C2C2E',
  screenBg: '#F5F5F7',
};

// Phone frame dimensions
const PHONE = {
  w: 940,
  h: 1870,
  r: 60,
  get x() { return (W - this.w) / 2; },
  get y() { return 520; },
  // Screen inset inside the device body
  bezel: 12,
  get sx() { return this.x + this.bezel; },
  get sy() { return this.y + this.bezel; },
  get sw() { return this.w - this.bezel * 2; },
  get sh() { return this.h - this.bezel * 2; },
  get sr() { return this.r - 6; },
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function roundedRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.arcTo(x + w, y, x + w, y + r, r);
  ctx.lineTo(x + w, y + h - r);
  ctx.arcTo(x + w, y + h, x + w - r, y + h, r);
  ctx.lineTo(x + r, y + h);
  ctx.arcTo(x, y + h, x, y + h - r, r);
  ctx.lineTo(x, y + r);
  ctx.arcTo(x, y, x + r, y, r);
  ctx.closePath();
}

function pill(ctx, x, y, w, h) {
  roundedRect(ctx, x, y, w, h, h / 2);
}

function drawPhoneFrame(ctx) {
  // Device body
  roundedRect(ctx, PHONE.x, PHONE.y, PHONE.w, PHONE.h, PHONE.r);
  ctx.fillStyle = C.deviceBody;
  ctx.fill();

  // Screen area
  roundedRect(ctx, PHONE.sx, PHONE.sy, PHONE.sw, PHONE.sh, PHONE.sr);
  ctx.fillStyle = C.screenBg;
  ctx.fill();

  // Dynamic Island
  const diW = 200;
  const diH = 52;
  const diX = PHONE.sx + (PHONE.sw - diW) / 2;
  const diY = PHONE.sy + 18;
  pill(ctx, diX, diY, diW, diH);
  ctx.fillStyle = '#000000';
  ctx.fill();
}

function drawHeadline(ctx, headline, sub) {
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  // Main headline
  ctx.font = '58px "DM Sans ExtraBold"';
  ctx.fillStyle = C.textPrimary;
  ctx.fillText(headline, W / 2, 280);

  // Sub-headline
  if (sub) {
    ctx.font = '28px "DM Sans"';
    ctx.fillStyle = C.textSecondary;
    ctx.fillText(sub, W / 2, 350);
  }
}

function drawCard(ctx, x, y, w, h, opts = {}) {
  const r = opts.radius || 20;
  roundedRect(ctx, x, y, w, h, r);
  ctx.fillStyle = opts.fill || C.card;
  ctx.fill();
  if (opts.border !== false) {
    ctx.strokeStyle = opts.borderColor || C.cardBorder;
    ctx.lineWidth = 1.5;
    ctx.stroke();
  }
}

function drawBadge(ctx, x, y, label, variant) {
  const colors = {
    accent: { bg: C.accentLight, text: C.accent },
    success: { bg: '#E8F9ED', text: '#1B8D36' },
    warning: { bg: '#FFF3E0', text: '#CC7700' },
    muted: { bg: '#F0F0F2', text: C.textSecondary },
  };
  const c = colors[variant] || colors.muted;

  ctx.font = '22px "DM Sans SemiBold"';
  const tw = ctx.measureText(label).width;
  const pw = tw + 28;
  const ph = 32;

  pill(ctx, x, y, pw, ph);
  ctx.fillStyle = c.bg;
  ctx.fill();

  ctx.fillStyle = c.text;
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  ctx.fillText(label, x + 14, y + ph / 2 + 1);

  return pw;
}

function drawButton(ctx, x, y, w, label, opts = {}) {
  const h = opts.height || 62;
  const r = opts.radius || 16;
  roundedRect(ctx, x, y, w, h, r);
  ctx.fillStyle = opts.bg || C.accent;
  ctx.fill();

  ctx.font = `${opts.fontSize || 24}px "DM Sans Bold"`;
  ctx.fillStyle = opts.color || '#FFFFFF';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(label, x + w / 2, y + h / 2 + 1);
}

function wrapText(ctx, text, maxWidth) {
  const words = text.split(' ');
  const lines = [];
  let current = '';
  for (const word of words) {
    const test = current ? current + ' ' + word : word;
    if (ctx.measureText(test).width > maxWidth) {
      if (current) lines.push(current);
      current = word;
    } else {
      current = test;
    }
  }
  if (current) lines.push(current);
  return lines;
}

function drawStatusBar(ctx) {
  const y = PHONE.sy + 25;
  const left = PHONE.sx + 50;
  const right = PHONE.sx + PHONE.sw - 50;

  ctx.font = '24px "DM Sans SemiBold"';
  ctx.fillStyle = C.textPrimary;
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  ctx.fillText('9:41', left, y + 26);

  // Battery icon (simplified)
  ctx.textAlign = 'right';
  const batW = 40;
  const batH = 18;
  const batX = right - batW;
  const batY = y + 17;
  roundedRect(ctx, batX, batY, batW, batH, 5);
  ctx.strokeStyle = C.textPrimary;
  ctx.lineWidth = 1.5;
  ctx.stroke();
  roundedRect(ctx, batX + 3, batY + 3, batW - 6, batH - 6, 3);
  ctx.fillStyle = C.textPrimary;
  ctx.fill();
  // Battery nub
  roundedRect(ctx, right + 2, batY + 4, 4, batH - 8, 2);
  ctx.fillStyle = C.textPrimary;
  ctx.fill();

  // Signal dots
  for (let i = 0; i < 4; i++) {
    const dotR = 4;
    const dotX = right - 90 - i * 14;
    ctx.beginPath();
    ctx.arc(dotX, y + 26, dotR, 0, Math.PI * 2);
    ctx.fillStyle = i < 3 ? C.textPrimary : C.textMuted;
    ctx.fill();
  }
}

function clipScreen(ctx) {
  roundedRect(ctx, PHONE.sx, PHONE.sy, PHONE.sw, PHONE.sh, PHONE.sr);
  ctx.clip();
}

function save(canvas, filename) {
  const filePath = path.join(OUT_DIR, filename);
  const buf = canvas.toBuffer('image/png');
  fs.writeFileSync(filePath, buf);
  const kb = (buf.length / 1024).toFixed(1);
  console.log(`  ${filename}  (${canvas.width}×${canvas.height}, ${kb} KB)`);
}

// ---------------------------------------------------------------------------
// Screenshot orchestrator
// ---------------------------------------------------------------------------
function createScreenshot(drawFn, headline, sub, filename) {
  const canvas = createCanvas(W, H);
  const ctx = canvas.getContext('2d');

  // Background
  ctx.fillStyle = C.bg;
  ctx.fillRect(0, 0, W, H);

  // Headline above phone
  drawHeadline(ctx, headline, sub);

  // Phone frame
  drawPhoneFrame(ctx);

  // Clip to screen and draw content
  ctx.save();
  clipScreen(ctx);
  drawStatusBar(ctx);
  drawFn(ctx);
  ctx.restore();

  // Re-draw Dynamic Island on top (over clipped content)
  const diW = 200;
  const diH = 52;
  const diX = PHONE.sx + (PHONE.sw - diW) / 2;
  const diY = PHONE.sy + 18;
  pill(ctx, diX, diY, diW, diH);
  ctx.fillStyle = '#000000';
  ctx.fill();

  save(canvas, filename);
}

// ---------------------------------------------------------------------------
// Screen content area helpers
// ---------------------------------------------------------------------------
const SCREEN = {
  get x() { return PHONE.sx + 36; },
  get y() { return PHONE.sy + 100; },
  get w() { return PHONE.sw - 72; },
  get bottom() { return PHONE.sy + PHONE.sh - 50; },
};

// ---------------------------------------------------------------------------
// Screenshot 1: Today screen
// ---------------------------------------------------------------------------
function drawTodayScreen(ctx) {
  const sx = SCREEN.x;
  let y = SCREEN.y;
  const sw = SCREEN.w;

  // Section header
  ctx.font = '44px "DM Sans ExtraBold"';
  ctx.fillStyle = C.textPrimary;
  ctx.textAlign = 'left';
  ctx.textBaseline = 'top';
  ctx.fillText("Today's 20%", sx, y);
  y += 70;

  // Activity Card
  const cardX = sx;
  const cardW = sw;
  const cardH = 680;
  drawCard(ctx, cardX, y, cardW, cardH);

  const cx = cardX + 30;
  let cy = y + 28;
  const cw = cardW - 60;

  // Badge
  drawBadge(ctx, cx, cy, 'READY', 'accent');
  cy += 50;

  // Workout name
  ctx.font = '34px "DM Sans Bold"';
  ctx.fillStyle = C.textPrimary;
  ctx.textAlign = 'left';
  ctx.textBaseline = 'top';
  ctx.fillText('Upper Body', cx, cy);
  cy += 46;

  // Subtitle
  ctx.font = '22px "DM Sans"';
  ctx.fillStyle = C.textSecondary;
  ctx.fillText('5 exercises · 25 min', cx, cy);
  cy += 50;

  // Divider
  ctx.beginPath();
  ctx.moveTo(cx, cy);
  ctx.lineTo(cx + cw, cy);
  ctx.strokeStyle = C.cardBorder;
  ctx.lineWidth = 1;
  ctx.stroke();
  cy += 20;

  // Exercise list
  const exercises = [
    { name: 'Bench Press', sets: '3×8' },
    { name: 'Bent-Over Row', sets: '3×8' },
    { name: 'Overhead Press', sets: '3×10' },
    { name: 'Pull-Up', sets: '3×6' },
    { name: 'Face Pull', sets: '3×15' },
  ];

  for (let i = 0; i < exercises.length; i++) {
    const ex = exercises[i];
    const rowY = cy + i * 60;

    // Index
    ctx.font = '22px "DM Sans Medium"';
    ctx.fillStyle = C.textMuted;
    ctx.textAlign = 'left';
    ctx.fillText(`${i + 1}`, cx, rowY);

    // Exercise name
    ctx.font = '24px "DM Sans SemiBold"';
    ctx.fillStyle = C.accent;
    ctx.fillText(ex.name, cx + 40, rowY);

    // Sets
    ctx.font = '22px "IBM Plex Mono"';
    ctx.fillStyle = C.textSecondary;
    ctx.textAlign = 'right';
    ctx.fillText(ex.sets, cx + cw, rowY);
  }

  cy += exercises.length * 60 + 30;

  // Start Workout button
  drawButton(ctx, cx, cy, cw, 'Start Workout');
}

// ---------------------------------------------------------------------------
// Screenshot 2: Active Workout
// ---------------------------------------------------------------------------
function drawActiveWorkout(ctx) {
  const sx = SCREEN.x;
  let y = SCREEN.y;
  const sw = SCREEN.w;

  // Top bar: X button and progress
  ctx.font = '28px "DM Sans SemiBold"';
  ctx.fillStyle = C.textSecondary;
  ctx.textAlign = 'left';
  ctx.textBaseline = 'top';
  ctx.fillText('✕', sx, y);

  // Progress bar
  const pbX = sx + 50;
  const pbW = sw - 50;
  const pbH = 8;
  roundedRect(ctx, pbX, y + 10, pbW, pbH, 4);
  ctx.fillStyle = '#E8E8ED';
  ctx.fill();
  roundedRect(ctx, pbX, y + 10, pbW * 0.4, pbH, 4);
  ctx.fillStyle = C.accent;
  ctx.fill();

  y += 70;

  // Exercise name
  ctx.font = '40px "DM Sans Bold"';
  ctx.fillStyle = C.textPrimary;
  ctx.textAlign = 'center';
  ctx.fillText('Bench Press', sx + sw / 2, y);
  y += 50;

  // Set indicator
  ctx.font = '26px "DM Sans"';
  ctx.fillStyle = C.textSecondary;
  ctx.fillText('Set 2 of 3', sx + sw / 2, y);
  y += 70;

  // Main card
  const cardH = 780;
  drawCard(ctx, sx, y, sw, cardH);

  const cx = sx + 40;
  let cy = y + 40;
  const cw = sw - 80;

  // Target
  ctx.font = '26px "DM Sans SemiBold"';
  ctx.fillStyle = C.textSecondary;
  ctx.textAlign = 'center';
  ctx.fillText('Target: 6-8 reps', cx + cw / 2, cy);
  cy += 36;

  ctx.font = '20px "DM Sans"';
  ctx.fillStyle = C.textMuted;
  ctx.fillText('Previous: 70 kg × 8', cx + cw / 2, cy);
  cy += 70;

  // Weight section
  ctx.font = '22px "DM Sans SemiBold"';
  ctx.fillStyle = C.textSecondary;
  ctx.textAlign = 'center';
  ctx.fillText('Weight (kg)', cx + cw / 2, cy);
  cy += 40;

  // Stepper: - [value] +
  const stepW = 70;
  const stepH = 60;
  const valW = 160;
  const totalStepW = stepW * 2 + valW + 30;
  const stepStartX = cx + (cw - totalStepW) / 2;

  // Minus button
  roundedRect(ctx, stepStartX, cy, stepW, stepH, 14);
  ctx.strokeStyle = C.accent;
  ctx.lineWidth = 2;
  ctx.stroke();
  ctx.font = '32px "DM Sans Bold"';
  ctx.fillStyle = C.accent;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('−', stepStartX + stepW / 2, cy + stepH / 2);

  // Value
  ctx.font = '48px "IBM Plex Mono SemiBold"';
  ctx.fillStyle = C.textPrimary;
  ctx.fillText('70', stepStartX + stepW + 15 + valW / 2, cy + stepH / 2);

  // Plus button
  const plusX = stepStartX + stepW + valW + 30;
  roundedRect(ctx, plusX, cy, stepW, stepH, 14);
  ctx.strokeStyle = C.accent;
  ctx.lineWidth = 2;
  ctx.stroke();
  ctx.font = '32px "DM Sans Bold"';
  ctx.fillStyle = C.accent;
  ctx.fillText('+', plusX + stepW / 2, cy + stepH / 2);
  cy += stepH + 50;

  // Reps section
  ctx.textBaseline = 'top';
  ctx.font = '22px "DM Sans SemiBold"';
  ctx.fillStyle = C.textSecondary;
  ctx.textAlign = 'center';
  ctx.fillText('Reps completed', cx + cw / 2, cy);
  cy += 40;

  // Reps stepper
  // Minus button
  roundedRect(ctx, stepStartX, cy, stepW, stepH, 14);
  ctx.strokeStyle = C.accent;
  ctx.lineWidth = 2;
  ctx.stroke();
  ctx.font = '32px "DM Sans Bold"';
  ctx.fillStyle = C.accent;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('−', stepStartX + stepW / 2, cy + stepH / 2);

  // Reps value
  ctx.font = '48px "IBM Plex Mono SemiBold"';
  ctx.fillStyle = C.textPrimary;
  ctx.fillText('8', stepStartX + stepW + 15 + valW / 2, cy + stepH / 2);

  // Plus button
  roundedRect(ctx, plusX, cy, stepW, stepH, 14);
  ctx.strokeStyle = C.accent;
  ctx.lineWidth = 2;
  ctx.stroke();
  ctx.font = '32px "DM Sans Bold"';
  ctx.fillStyle = C.accent;
  ctx.fillText('+', plusX + stepW / 2, cy + stepH / 2);
  cy += stepH + 50;

  // RPE guidance
  ctx.textBaseline = 'top';
  ctx.font = '22px "DM Sans Medium"';
  ctx.fillStyle = C.accent;
  ctx.textAlign = 'center';
  ctx.fillText('RPE 7-8  ·  2-3 reps in reserve', cx + cw / 2, cy);
  cy += 34;

  ctx.font = '20px "DM Sans"';
  ctx.fillStyle = C.textMuted;
  ctx.fillText('Should feel challenging but not maximal', cx + cw / 2, cy);

  // Complete Set button (below card)
  const btnY = y + cardH + 30;
  drawButton(ctx, sx, btnY, sw, 'Complete Set  ✓', { height: 68 });
}

// ---------------------------------------------------------------------------
// Screenshot 3: Weekly Plan
// ---------------------------------------------------------------------------
function drawWeeklyPlan(ctx) {
  const sx = SCREEN.x;
  let y = SCREEN.y;
  const sw = SCREEN.w;

  // Section header
  ctx.font = '44px "DM Sans ExtraBold"';
  ctx.fillStyle = C.textPrimary;
  ctx.textAlign = 'left';
  ctx.textBaseline = 'top';
  ctx.fillText("Today's 20%", sx, y);
  y += 70;

  // Week strip card
  const stripH = 130;
  drawCard(ctx, sx, y, sw, stripH);

  const days = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
  const types = ['gym', 'rest', 'gym', 'run', 'gym', 'rest', 'rest']; // example week
  const dotColors = {
    gym: C.accent,
    run: C.success,
    rest: '#E0E0E4',
  };
  const dayW = sw / 7;
  const today = 2; // Wednesday highlighted

  for (let i = 0; i < 7; i++) {
    const dx = sx + dayW * i + dayW / 2;

    // Day label
    ctx.font = '22px "DM Sans SemiBold"';
    ctx.fillStyle = i === today ? C.textPrimary : C.textSecondary;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    ctx.fillText(days[i], dx, y + 20);

    // Dot
    const dotR = 12;
    ctx.beginPath();
    ctx.arc(dx, y + 72, dotR, 0, Math.PI * 2);
    ctx.fillStyle = dotColors[types[i]];
    ctx.fill();

    // Today highlight ring
    if (i === today) {
      ctx.beginPath();
      ctx.arc(dx, y + 72, dotR + 5, 0, Math.PI * 2);
      ctx.strokeStyle = C.accent;
      ctx.lineWidth = 2.5;
      ctx.stroke();
    }
  }

  // Session counter
  ctx.font = '20px "DM Sans"';
  ctx.fillStyle = C.textSecondary;
  ctx.textAlign = 'right';
  ctx.fillText('3 of 5 sessions', sx + sw - 30, y + 102);

  y += stripH + 24;

  // Activity Card (compact version)
  const cardH = 560;
  drawCard(ctx, sx, y, sw, cardH);

  const cx = sx + 30;
  let cy = y + 28;
  const cw = sw - 60;

  drawBadge(ctx, cx, cy, 'READY', 'accent');
  cy += 50;

  ctx.font = '34px "DM Sans Bold"';
  ctx.fillStyle = C.textPrimary;
  ctx.textAlign = 'left';
  ctx.textBaseline = 'top';
  ctx.fillText('Full Body A', cx, cy);
  cy += 46;

  ctx.font = '22px "DM Sans"';
  ctx.fillStyle = C.textSecondary;
  ctx.fillText('5 exercises · 25 min', cx, cy);
  cy += 50;

  // Divider
  ctx.beginPath();
  ctx.moveTo(cx, cy);
  ctx.lineTo(cx + cw, cy);
  ctx.strokeStyle = C.cardBorder;
  ctx.lineWidth = 1;
  ctx.stroke();
  cy += 20;

  // Exercise list
  const exercises = [
    { name: 'Squat', sets: '3×6' },
    { name: 'Bench Press', sets: '3×8' },
    { name: 'Bent-Over Row', sets: '3×8' },
    { name: 'Romanian Deadlift', sets: '3×10' },
  ];

  for (let i = 0; i < exercises.length; i++) {
    const ex = exercises[i];
    const rowY = cy + i * 60;

    ctx.font = '22px "DM Sans Medium"';
    ctx.fillStyle = C.textMuted;
    ctx.textAlign = 'left';
    ctx.fillText(`${i + 1}`, cx, rowY);

    ctx.font = '24px "DM Sans SemiBold"';
    ctx.fillStyle = C.accent;
    ctx.fillText(ex.name, cx + 40, rowY);

    ctx.font = '22px "IBM Plex Mono"';
    ctx.fillStyle = C.textSecondary;
    ctx.textAlign = 'right';
    ctx.fillText(ex.sets, cx + cw, rowY);
  }

  cy += exercises.length * 60 + 30;

  drawButton(ctx, cx, cy, cw, 'Start Workout');

  // Nutrition card below
  y += cardH + 24;
  const nutH = 200;
  drawCard(ctx, sx, y, sw, nutH);

  const nx = sx + 30;
  let ny = y + 24;
  const nw = sw - 60;

  ctx.font = '26px "DM Sans Bold"';
  ctx.fillStyle = C.textPrimary;
  ctx.textAlign = 'left';
  ctx.textBaseline = 'top';
  ctx.fillText('Protein Today', nx, ny);
  ny += 50;

  // Circles
  const circleR = 16;
  const circleGap = 12;
  const total = 6;
  const filled = 3;
  for (let i = 0; i < total; i++) {
    const circX = nx + i * (circleR * 2 + circleGap) + circleR;
    ctx.beginPath();
    ctx.arc(circX, ny + circleR, circleR, 0, Math.PI * 2);
    if (i < filled) {
      ctx.fillStyle = C.accent;
      ctx.fill();
    } else {
      ctx.strokeStyle = C.cardBorder;
      ctx.lineWidth = 2;
      ctx.stroke();
    }
  }
  ny += circleR * 2 + 24;

  ctx.font = '22px "DM Sans SemiBold"';
  ctx.fillStyle = C.textPrimary;
  ctx.fillText(`${filled}/${total}`, nx, ny);

  ctx.font = '20px "DM Sans"';
  ctx.fillStyle = C.textMuted;
  ctx.fillText('palm-sized portions', nx + 60, ny + 2);
}

// ---------------------------------------------------------------------------
// Screenshot 4: Exercise Detail
// ---------------------------------------------------------------------------
function drawExerciseDetail(ctx) {
  const sx = SCREEN.x;
  let y = SCREEN.y;
  const sw = SCREEN.w;

  // Back arrow
  ctx.font = '30px "DM Sans Bold"';
  ctx.fillStyle = C.accent;
  ctx.textAlign = 'left';
  ctx.textBaseline = 'top';
  ctx.fillText('‹ Back', sx, y);
  y += 60;

  // Exercise name
  ctx.font = '40px "DM Sans ExtraBold"';
  ctx.fillStyle = C.textPrimary;
  ctx.fillText('Bench Press', sx, y);
  y += 56;

  // Description
  ctx.font = '24px "DM Sans"';
  ctx.fillStyle = C.textSecondary;
  const descLines = wrapText(
    ctx,
    'A compound upper-body push exercise targeting the pectoralis major, anterior deltoids, and triceps. One of the most effective movements for building pressing strength.',
    sw,
  );
  for (const line of descLines) {
    ctx.fillText(line, sx, y);
    y += 36;
  }
  y += 30;

  // Research section
  ctx.font = '28px "DM Sans Bold"';
  ctx.fillStyle = C.textPrimary;
  ctx.fillText('Research', sx, y);
  y += 50;

  // Citation card
  const citeH = 260;
  drawCard(ctx, sx, y, sw, citeH, { radius: 16 });

  const cx = sx + 30;
  let cy = y + 24;
  const cw = sw - 60;

  // Citation badge
  drawBadge(ctx, cx, cy, 'CITATION', 'accent');
  cy += 48;

  ctx.font = '22px "DM Sans SemiBold"';
  ctx.fillStyle = C.textPrimary;
  ctx.textAlign = 'left';
  ctx.fillText('Schoenfeld et al., 2017', cx, cy);
  cy += 36;

  ctx.font = '22px "DM Sans"';
  ctx.fillStyle = C.textSecondary;
  const quoteLines = wrapText(
    ctx,
    '"Multi-joint exercises like the bench press elicit greater muscle activation and hormonal response compared to isolation movements."',
    cw,
  );
  for (const line of quoteLines) {
    ctx.fillText(line, cx, cy);
    cy += 32;
  }

  y += citeH + 30;

  // Alternatives section
  ctx.font = '28px "DM Sans Bold"';
  ctx.fillStyle = C.textPrimary;
  ctx.fillText('Alternatives', sx, y);
  y += 50;

  // Alternative cards
  const alts = ['Dumbbell Bench Press', 'Push-Up', 'Incline Bench Press'];
  for (const alt of alts) {
    const altH = 64;
    drawCard(ctx, sx, y, sw, altH, { radius: 14 });

    ctx.font = '24px "DM Sans SemiBold"';
    ctx.fillStyle = C.accent;
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillText(alt, sx + 24, y + altH / 2);

    ctx.font = '24px "DM Sans"';
    ctx.fillStyle = C.textMuted;
    ctx.textAlign = 'right';
    ctx.fillText('›', sx + sw - 24, y + altH / 2);

    y += altH + 12;
  }
  ctx.textBaseline = 'top';
}

// ---------------------------------------------------------------------------
// Screenshot 5: Progress
// ---------------------------------------------------------------------------
function drawProgress(ctx) {
  const sx = SCREEN.x;
  let y = SCREEN.y;
  const sw = SCREEN.w;

  // Section header
  ctx.font = '44px "DM Sans ExtraBold"';
  ctx.fillStyle = C.textPrimary;
  ctx.textAlign = 'left';
  ctx.textBaseline = 'top';
  ctx.fillText('Progress', sx, y);
  y += 70;

  // Consistency Grid
  const gridCardH = 420;
  drawCard(ctx, sx, y, sw, gridCardH);

  const gx = sx + 30;
  let gy = y + 24;
  const gw = sw - 60;

  ctx.font = '26px "DM Sans Bold"';
  ctx.fillStyle = C.textPrimary;
  ctx.textAlign = 'left';
  ctx.fillText('Consistency', gx, gy);
  gy += 18;

  ctx.font = '20px "DM Sans"';
  ctx.fillStyle = C.textSecondary;
  ctx.fillText('Last 8 weeks', gx + 180, gy + 4);
  gy += 50;

  // Grid: 7 cols x 8 rows
  const cols = 7;
  const rows = 8;
  const cellSize = 32;
  const cellGap = 8;
  const gridTotalW = cols * cellSize + (cols - 1) * cellGap;
  const gridStartX = gx + (gw - gridTotalW) / 2;

  // Day headers
  const dayLabels = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
  ctx.font = '16px "DM Sans Medium"';
  ctx.fillStyle = C.textMuted;
  ctx.textAlign = 'center';
  for (let c = 0; c < cols; c++) {
    ctx.fillText(dayLabels[c], gridStartX + c * (cellSize + cellGap) + cellSize / 2, gy);
  }
  gy += 28;

  // Grid cells (pre-defined pattern)
  // 0=empty, 1=gym(blue), 2=run(green), 3=rest(light)
  const pattern = [
    [1, 3, 1, 2, 1, 3, 3],
    [1, 3, 1, 2, 1, 3, 3],
    [1, 3, 0, 2, 1, 3, 3],
    [1, 3, 1, 2, 1, 3, 3],
    [1, 3, 1, 0, 1, 3, 3],
    [1, 3, 1, 2, 1, 3, 3],
    [1, 3, 1, 2, 0, 3, 3],
    [1, 3, 1, 2, 1, 3, 3],
  ];
  const cellColors = {
    0: '#F0F0F2',
    1: C.accent,
    2: C.success,
    3: '#E8E8ED',
  };

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const cx = gridStartX + c * (cellSize + cellGap);
      const cy = gy + r * (cellSize + cellGap);
      roundedRect(ctx, cx, cy, cellSize, cellSize, 6);
      ctx.fillStyle = cellColors[pattern[r][c]];
      ctx.fill();
    }
  }

  y += gridCardH + 24;

  // Trend chart card
  const chartCardH = 500;
  drawCard(ctx, sx, y, sw, chartCardH);

  const chx = sx + 30;
  let chy = y + 24;
  const chw = sw - 60;

  ctx.font = '26px "DM Sans Bold"';
  ctx.fillStyle = C.textPrimary;
  ctx.textAlign = 'left';
  ctx.fillText('Bench Press', chx, chy);
  chy += 18;

  ctx.font = '20px "DM Sans"';
  ctx.fillStyle = C.textSecondary;
  ctx.fillText('Estimated 1RM (kg)', chx + 180, chy + 4);
  chy += 60;

  // Chart area
  const chartX = chx;
  const chartY = chy;
  const chartW = chw;
  const chartH = 300;

  // Y axis labels
  ctx.font = '18px "IBM Plex Mono"';
  ctx.fillStyle = C.textMuted;
  ctx.textAlign = 'right';
  const yLabels = ['90', '80', '70', '60'];
  for (let i = 0; i < yLabels.length; i++) {
    const ly = chartY + (i / (yLabels.length - 1)) * chartH;
    ctx.fillText(yLabels[i], chartX - 10, ly + 6);
    // Grid line
    ctx.beginPath();
    ctx.moveTo(chartX, ly);
    ctx.lineTo(chartX + chartW, ly);
    ctx.strokeStyle = '#F0F0F2';
    ctx.lineWidth = 1;
    ctx.stroke();
  }

  // Data points (ascending trend)
  const points = [
    { x: 0, y: 0.85 },
    { x: 0.14, y: 0.78 },
    { x: 0.28, y: 0.72 },
    { x: 0.42, y: 0.62 },
    { x: 0.57, y: 0.5 },
    { x: 0.71, y: 0.38 },
    { x: 0.85, y: 0.28 },
    { x: 1.0, y: 0.15 },
  ];

  // Gradient fill under line
  const grad = ctx.createLinearGradient(0, chartY, 0, chartY + chartH);
  grad.addColorStop(0, 'rgba(0, 113, 227, 0.2)');
  grad.addColorStop(1, 'rgba(0, 113, 227, 0.0)');

  ctx.beginPath();
  ctx.moveTo(chartX + points[0].x * chartW, chartY + points[0].y * chartH);
  for (let i = 1; i < points.length; i++) {
    const px = chartX + points[i].x * chartW;
    const py = chartY + points[i].y * chartH;
    // Smooth curve
    const prevX = chartX + points[i - 1].x * chartW;
    const prevY = chartY + points[i - 1].y * chartH;
    const cpx = (prevX + px) / 2;
    ctx.bezierCurveTo(cpx, prevY, cpx, py, px, py);
  }
  // Close for gradient fill
  ctx.lineTo(chartX + chartW, chartY + chartH);
  ctx.lineTo(chartX, chartY + chartH);
  ctx.closePath();
  ctx.fillStyle = grad;
  ctx.fill();

  // Line on top
  ctx.beginPath();
  ctx.moveTo(chartX + points[0].x * chartW, chartY + points[0].y * chartH);
  for (let i = 1; i < points.length; i++) {
    const px = chartX + points[i].x * chartW;
    const py = chartY + points[i].y * chartH;
    const prevX = chartX + points[i - 1].x * chartW;
    const prevY = chartY + points[i - 1].y * chartH;
    const cpx = (prevX + px) / 2;
    ctx.bezierCurveTo(cpx, prevY, cpx, py, px, py);
  }
  ctx.strokeStyle = C.accent;
  ctx.lineWidth = 3;
  ctx.stroke();

  // Dots
  for (const p of points) {
    const px = chartX + p.x * chartW;
    const py = chartY + p.y * chartH;
    ctx.beginPath();
    ctx.arc(px, py, 6, 0, Math.PI * 2);
    ctx.fillStyle = C.accent;
    ctx.fill();
    ctx.beginPath();
    ctx.arc(px, py, 3, 0, Math.PI * 2);
    ctx.fillStyle = C.card;
    ctx.fill();
  }

  // X axis labels
  ctx.font = '16px "IBM Plex Mono"';
  ctx.fillStyle = C.textMuted;
  ctx.textAlign = 'center';
  const weeks = ['W1', 'W2', 'W3', 'W4', 'W5', 'W6', 'W7', 'W8'];
  for (let i = 0; i < weeks.length; i++) {
    const wx = chartX + (i / (weeks.length - 1)) * chartW;
    ctx.fillText(weeks[i], wx, chartY + chartH + 24);
  }
}

// ---------------------------------------------------------------------------
// Screenshot 6: Nutrition
// ---------------------------------------------------------------------------
function drawNutrition(ctx) {
  const sx = SCREEN.x;
  let y = SCREEN.y;
  const sw = SCREEN.w;

  // Section header
  ctx.font = '44px "DM Sans ExtraBold"';
  ctx.fillStyle = C.textPrimary;
  ctx.textAlign = 'left';
  ctx.textBaseline = 'top';
  ctx.fillText("Today's 20%", sx, y);
  y += 70;

  // Nutrition card
  const cardH = 380;
  drawCard(ctx, sx, y, sw, cardH);

  const cx = sx + 36;
  let cy = y + 32;
  const cw = sw - 72;

  // Badge
  drawBadge(ctx, cx, cy, 'NUTRITION', 'success');
  cy += 55;

  // Heading
  ctx.font = '34px "DM Sans Bold"';
  ctx.fillStyle = C.textPrimary;
  ctx.textAlign = 'left';
  ctx.fillText('Protein Today', cx, cy);
  cy += 60;

  // Protein circles
  const circleR = 28;
  const circleGap = 18;
  const total = 6;
  const filled = 4;

  for (let i = 0; i < total; i++) {
    const circX = cx + i * (circleR * 2 + circleGap) + circleR;
    ctx.beginPath();
    ctx.arc(circX, cy + circleR, circleR, 0, Math.PI * 2);
    if (i < filled) {
      ctx.fillStyle = C.accent;
      ctx.fill();
    } else {
      ctx.strokeStyle = C.cardBorder;
      ctx.lineWidth = 2.5;
      ctx.stroke();
    }
  }
  cy += circleR * 2 + 40;

  // Counter
  ctx.font = '36px "DM Sans ExtraBold"';
  ctx.fillStyle = C.textPrimary;
  ctx.fillText(`${filled}/${total}`, cx, cy);

  ctx.font = '22px "DM Sans"';
  ctx.fillStyle = C.textSecondary;
  ctx.fillText('palm-sized portions', cx + 90, cy + 8);
  cy += 50;

  // Caption
  ctx.font = '20px "DM Sans"';
  ctx.fillStyle = C.textMuted;
  ctx.fillText('Tap to log a palm-sized protein portion', cx, cy);

  y += cardH + 24;

  // Second card: Today's summary
  const summaryH = 320;
  drawCard(ctx, sx, y, sw, summaryH);

  const sx2 = sx + 36;
  let sy2 = y + 32;
  const sw2 = sw - 72;

  drawBadge(ctx, sx2, sy2, 'READY', 'accent');
  sy2 += 55;

  ctx.font = '34px "DM Sans Bold"';
  ctx.fillStyle = C.textPrimary;
  ctx.textAlign = 'left';
  ctx.fillText('Upper Body', sx2, sy2);
  sy2 += 46;

  ctx.font = '22px "DM Sans"';
  ctx.fillStyle = C.textSecondary;
  ctx.fillText('5 exercises · 25 min', sx2, sy2);
  sy2 += 60;

  drawButton(ctx, sx2, sy2, sw2, 'Start Workout');

  // Third card: rest day quote
  y += summaryH + 24;
  const quoteH = 240;
  drawCard(ctx, sx, y, sw, quoteH);

  const qx = sx + 36;
  let qy = y + 32;

  drawBadge(ctx, qx, qy, 'TOMORROW', 'muted');
  qy += 55;

  ctx.font = '26px "DM Sans Bold"';
  ctx.fillStyle = C.textPrimary;
  ctx.textAlign = 'left';
  ctx.fillText('Rest Day', qx, qy);
  qy += 50;

  ctx.font = '22px "DM Sans"';
  ctx.fillStyle = C.textSecondary;
  const quoteLines = wrapText(
    ctx,
    '"The magic happens between workouts — recovery is where adaptation occurs."',
    sw - 72,
  );
  for (const line of quoteLines) {
    ctx.fillText(line, qx, qy);
    qy += 32;
  }
  qy += 10;
  ctx.font = '20px "DM Sans Medium"';
  ctx.fillStyle = C.textMuted;
  ctx.fillText('— Dr. Andy Galpin', qx, qy);
}

// ---------------------------------------------------------------------------
// Generate all screenshots
// ---------------------------------------------------------------------------
if (!fs.existsSync(OUT_DIR)) {
  fs.mkdirSync(OUT_DIR, { recursive: true });
}

console.log('Generating App Store screenshots...\n');

createScreenshot(drawTodayScreen, "Your 20% Plan. Ready.", "Everything you need. Nothing you don't.", '01-today.png');
createScreenshot(drawActiveWorkout, "Every set. Guided by science.", "Track weight, reps, and effort in real time.", '02-active-workout.png');
createScreenshot(drawWeeklyPlan, "3 domains. 25 min/day. That's it.", "Gym, cardio, and rest — planned for you.", '03-weekly-plan.png');
createScreenshot(drawExerciseDetail, "Every exercise has a citation.", "Know why every movement is in your plan.", '04-exercise-detail.png');
createScreenshot(drawProgress, "Track what matters. Nothing more.", "Consistency and strength — the metrics that count.", '05-progress.png');
createScreenshot(drawNutrition, "Nutrition simplified to hand portions.", "No calorie counting. Just palm-sized portions.", '06-nutrition.png');

console.log('\nDone! 6 screenshots generated in app-store/screenshots/');
