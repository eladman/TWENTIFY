const { createCanvas, registerFont } = require('canvas');
const fs = require('fs');
const path = require('path');

// ---------------------------------------------------------------------------
// Register fonts BEFORE any createCanvas() call (node-canvas requirement)
// ---------------------------------------------------------------------------
const fontDir = path.join(
  __dirname,
  '..',
  'node_modules',
  '@expo-google-fonts',
  'dm-sans',
);

registerFont(
  path.join(fontDir, '800ExtraBold', 'DMSans_800ExtraBold.ttf'),
  { family: 'DM Sans', weight: '800' },
);
registerFont(
  path.join(fontDir, '700Bold', 'DMSans_700Bold.ttf'),
  { family: 'DM Sans', weight: '700' },
);

const ASSETS_DIR = path.join(__dirname, '..', 'assets');

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Draw a rounded rectangle path using arcTo. */
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

/**
 * Create a 145-degree linear gradient (#0071E3 → #0058B0).
 * 145deg means the gradient line goes from upper-left toward lower-right.
 */
function blueGradient(ctx, w, h) {
  const angle = (145 * Math.PI) / 180;
  const cx = w / 2;
  const cy = h / 2;
  const len = Math.abs(w * Math.sin(angle)) + Math.abs(h * Math.cos(angle));
  const half = len / 2;
  const dx = Math.sin(angle) * half;
  const dy = -Math.cos(angle) * half;
  const grad = ctx.createLinearGradient(cx - dx, cy - dy, cx + dx, cy + dy);
  grad.addColorStop(0, '#0071E3');
  grad.addColorStop(1, '#0058B0');
  return grad;
}

/** Write a canvas to a PNG file and log its size. */
function save(canvas, name) {
  const filePath = path.join(ASSETS_DIR, name);
  const buf = canvas.toBuffer('image/png');
  fs.writeFileSync(filePath, buf);
  const kb = (buf.length / 1024).toFixed(1);
  console.log(`Created ${name}  (${canvas.width}x${canvas.height}, ${kb} KB)`);
}

// ---------------------------------------------------------------------------
// 1. icon.png — 1024x1024, rounded rect, gradient, white "20"
// ---------------------------------------------------------------------------
function generateIcon() {
  const size = 1024;
  const canvas = createCanvas(size, size);
  const ctx = canvas.getContext('2d');

  // Rounded rect background
  const radius = size * 0.18; // ~184px, standard iOS radius proportion
  roundedRect(ctx, 0, 0, size, size, radius);
  ctx.fillStyle = blueGradient(ctx, size, size);
  ctx.fill();

  // "20" text
  const fontSize = 420;
  ctx.font = `800 ${fontSize}px "DM Sans"`;
  ctx.fillStyle = '#FFFFFF';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('20', size / 2, size / 2 + fontSize * 0.04); // slight nudge down

  save(canvas, 'icon.png');
}

// ---------------------------------------------------------------------------
// 2. adaptive-icon.png — 1024x1024, full bleed gradient, smaller "20"
// ---------------------------------------------------------------------------
function generateAdaptiveIcon() {
  const size = 1024;
  const canvas = createCanvas(size, size);
  const ctx = canvas.getContext('2d');

  // Full bleed gradient (no rounded rect — Android masks it)
  ctx.fillStyle = blueGradient(ctx, size, size);
  ctx.fillRect(0, 0, size, size);

  // "20" — smaller to stay in 66% safe zone
  const fontSize = 300;
  ctx.font = `800 ${fontSize}px "DM Sans"`;
  ctx.fillStyle = '#FFFFFF';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('20', size / 2, size / 2 + fontSize * 0.04);

  save(canvas, 'adaptive-icon.png');
}

// ---------------------------------------------------------------------------
// 3. favicon.png — 48x48, solid blue, white "20"
// ---------------------------------------------------------------------------
function generateFavicon() {
  const size = 48;
  const canvas = createCanvas(size, size);
  const ctx = canvas.getContext('2d');

  // Solid fill (gradient invisible at this size)
  ctx.fillStyle = '#0071E3';
  ctx.fillRect(0, 0, size, size);

  const fontSize = 20;
  ctx.font = `800 ${fontSize}px "DM Sans"`;
  ctx.fillStyle = '#FFFFFF';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('20', size / 2, size / 2 + 1);

  save(canvas, 'favicon.png');
}

// ---------------------------------------------------------------------------
// 4. splash.png — 1284x2778, light bg, centered "twentify" wordmark
// ---------------------------------------------------------------------------
function generateSplash() {
  const w = 1284;
  const h = 2778;
  const canvas = createCanvas(w, h);
  const ctx = canvas.getContext('2d');

  // Light background
  ctx.fillStyle = '#F5F5F7';
  ctx.fillRect(0, 0, w, h);

  // "twentify" wordmark
  const fontSize = 72;
  ctx.font = `700 ${fontSize}px "DM Sans"`;
  ctx.fillStyle = '#1D1D1F';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('twentify', w / 2, h / 2);

  save(canvas, 'splash.png');
}

// ---------------------------------------------------------------------------
// 5. notification-icon.png — 96x96, white "20" on transparent
// ---------------------------------------------------------------------------
function generateNotificationIcon() {
  const size = 96;
  const canvas = createCanvas(size, size);
  const ctx = canvas.getContext('2d');

  // Transparent background (default for canvas)

  const fontSize = 44;
  ctx.font = `800 ${fontSize}px "DM Sans"`;
  ctx.fillStyle = '#FFFFFF';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('20', size / 2, size / 2 + 1);

  save(canvas, 'notification-icon.png');
}

// ---------------------------------------------------------------------------
// Run all
// ---------------------------------------------------------------------------
console.log('Generating Twentify assets...\n');
generateIcon();
generateAdaptiveIcon();
generateFavicon();
generateSplash();
generateNotificationIcon();
console.log('\nDone!');
