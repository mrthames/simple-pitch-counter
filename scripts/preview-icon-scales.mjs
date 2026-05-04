#!/usr/bin/env node
// Preview the Android adaptive icon at multiple foreground scales.
//
// Renders a side-by-side grid showing how the icon would appear on a Pixel
// (circular mask) at scales from 0.50 to 0.80. Output goes to test-results/
// (gitignored) so you can iterate without committing.
//
// Run: node scripts/preview-icon-scales.mjs
// Then open: test-results/icons-preview/scale-grid.png

import sharp from 'sharp';
import { promises as fs } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, '..');
const SRC = resolve(root, 'marketing/logo/spc - light mode - blue S.png');
const BG_HEX = '#0b1c3a';
const OUT_DIR = resolve(root, 'test-results/icons-preview');

const TILE = 320;          // size of each preview tile
const COLS = 4;

// Mode A: navy bg ring + scaled-down logo (preserves source's white-square + S ratio)
const NAVY_RING_SCALES = [0.50, 0.55, 0.60, 0.65, 0.70, 0.72, 0.75, 0.80];

// Mode B: white fills the icon, S is centered smaller within it.
// `markRatio` = visible S size / icon canvas. The source's S+baseball is ~80%
// of source canvas, so we pad the source onto a larger white canvas to push
// the S down to the target ratio, then render the padded source full-bleed.
const WHITE_FRAME_RATIOS = [0.45, 0.50, 0.55, 0.60];

async function renderNavyRingTile(scale) {
  const inner = Math.round(TILE * scale);
  const fg = await sharp(SRC).resize(inner, inner, { fit: 'contain' }).toBuffer();
  const bg = await sharp({ create: { width: TILE, height: TILE, channels: 4, background: BG_HEX } })
    .composite([{ input: fg, gravity: 'center' }])
    .png()
    .toBuffer();
  return circleMask(bg, `${(scale * 100).toFixed(0)}% (navy ring)`);
}

async function renderWhiteFrameTile(markRatio) {
  // Source has the mark at ~80% of source canvas. To get visible mark = markRatio
  // of icon canvas (rendered full-bleed), pad source onto a larger white canvas
  // sized 0.80 / markRatio × source size.
  const SRC_MARK_RATIO = 0.80;
  const meta = await sharp(SRC).metadata();
  const newSize = Math.round(meta.width * (SRC_MARK_RATIO / markRatio));
  const padded = await sharp({
    create: { width: newSize, height: newSize, channels: 4, background: '#ffffff' },
  })
    .composite([{ input: SRC, gravity: 'center' }])
    .png()
    .toBuffer();
  // Now render that padded source full-bleed at TILE size
  const filled = await sharp(padded).resize(TILE, TILE, { fit: 'cover' }).png().toBuffer();
  return circleMask(filled, `${(markRatio * 100).toFixed(0)}% (white frame)`);
}

async function circleMask(buf, labelText) {
  const r = TILE / 2;
  const mask = Buffer.from(
    `<svg xmlns="http://www.w3.org/2000/svg" width="${TILE}" height="${TILE}"><circle cx="${r}" cy="${r}" r="${r}" fill="white"/></svg>`
  );
  const masked = await sharp(buf)
    .composite([{ input: mask, blend: 'dest-in' }])
    .png()
    .toBuffer();
  const labelH = 50;
  const label = Buffer.from(
    `<svg xmlns="http://www.w3.org/2000/svg" width="${TILE}" height="${labelH}">
      <rect width="${TILE}" height="${labelH}" fill="#1a1a1a"/>
      <text x="${TILE / 2}" y="32" font-family="-apple-system,Segoe UI,sans-serif" font-size="20" font-weight="600" fill="#fff" text-anchor="middle">${labelText}</text>
    </svg>`
  );
  return sharp({
    create: { width: TILE, height: TILE + labelH, channels: 4, background: '#1a1a1a' },
  })
    .composite([
      { input: masked, top: 0, left: 0 },
      { input: label, top: TILE, left: 0 },
    ])
    .png()
    .toBuffer();
}

async function gridFromTiles(tiles, outName) {
  const rows = Math.ceil(tiles.length / COLS);
  const tileW = TILE;
  const tileH = TILE + 50;
  const gap = 16;
  const gridW = COLS * tileW + (COLS + 1) * gap;
  const gridH = rows * tileH + (rows + 1) * gap;
  const composites = tiles.map((buf, i) => ({
    input: buf,
    left: gap + (i % COLS) * (tileW + gap),
    top: gap + Math.floor(i / COLS) * (tileH + gap),
  }));
  await sharp({
    create: { width: gridW, height: gridH, channels: 4, background: '#0a0a0a' },
  })
    .composite(composites)
    .png()
    .toFile(resolve(OUT_DIR, outName));
}

async function main() {
  await fs.mkdir(OUT_DIR, { recursive: true });

  console.log('Rendering navy-ring grid (Mode A)…');
  const navyTiles = await Promise.all(NAVY_RING_SCALES.map(renderNavyRingTile));
  await gridFromTiles(navyTiles, 'scale-grid-navy-ring.png');

  console.log('Rendering white-frame grid (Mode B)…');
  const whiteTiles = await Promise.all(WHITE_FRAME_RATIOS.map(renderWhiteFrameTile));
  await gridFromTiles(whiteTiles, 'scale-grid-white-frame.png');

  console.log('');
  console.log('Mode A (navy ring around white square):');
  console.log(`  ${OUT_DIR}/scale-grid-navy-ring.png`);
  console.log('Mode B (white fills icon, S smaller inside):');
  console.log(`  ${OUT_DIR}/scale-grid-white-frame.png`);
  console.log('');
  console.log('Pick one and tell me which scale; I’ll wire it into generate-icons.mjs.');
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
