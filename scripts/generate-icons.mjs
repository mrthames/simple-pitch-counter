#!/usr/bin/env node
// Generates all iOS and Android app-icon assets from marketing/logo/spc - light mode@3x.png.
//
// iOS: one 1024x1024 universal icon (opaque navy bg, square — system rounds corners).
// Android: adaptive icon foreground (108dp safe-zone padded) + legacy + round icons,
//          at mdpi/hdpi/xhdpi/xxhdpi/xxxhdpi as .webp. Background color comes from
//          ic_launcher_background.xml (also updated by this script).
//
// Run: node scripts/generate-icons.mjs

import sharp from 'sharp';
import { promises as fs } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, '..');
const SRC = resolve(root, 'marketing/logo/spc - light mode@3x.png');
const BG_HEX = '#0b1c3a';

const iosOut = resolve(root, 'app/Assets.xcassets/AppIcon.appiconset');
const androidRes = resolve(root, 'android/app/src/main/res');

// The source logo is designed as a complete app-icon mark: red S + baseball with
// a white square as its painted background. We render it edge-to-edge so the
// white extends to the canvas edges (system corner-rounding handles the rest).
const ANDROID_DENSITIES = [
  { dir: 'mipmap-mdpi',    fg: 108, legacy: 48 },
  { dir: 'mipmap-hdpi',    fg: 162, legacy: 72 },
  { dir: 'mipmap-xhdpi',   fg: 216, legacy: 96 },
  { dir: 'mipmap-xxhdpi',  fg: 324, legacy: 144 },
  { dir: 'mipmap-xxxhdpi', fg: 432, legacy: 192 },
];

async function generateIosIcon() {
  const SIZE = 1024;
  await sharp(SRC).resize(SIZE, SIZE, { fit: 'cover' }).png()
    .toFile(resolve(iosOut, 'icon_1024x1024.png'));
  console.log('  iOS universal: icon_1024x1024.png');
}

async function generateAndroidForDensity({ dir, fg, legacy }) {
  const outDir = resolve(androidRes, dir);
  await fs.mkdir(outDir, { recursive: true });

  // Adaptive foreground: edge-to-edge logo. The system composites this over the
  // ic_launcher_background color and then applies the device's icon mask.
  await sharp(SRC).resize(fg, fg, { fit: 'cover' }).webp({ quality: 95 })
    .toFile(resolve(outDir, 'ic_launcher_foreground.webp'));

  // Legacy square icon (pre-Android 8 launchers).
  await sharp(SRC).resize(legacy, legacy, { fit: 'cover' }).webp({ quality: 95 })
    .toFile(resolve(outDir, 'ic_launcher.webp'));

  // Round legacy icon: same content masked to a circle.
  const r = legacy / 2;
  const roundMask = Buffer.from(
    `<svg xmlns="http://www.w3.org/2000/svg" width="${legacy}" height="${legacy}"><circle cx="${r}" cy="${r}" r="${r}" fill="white"/></svg>`
  );
  const square = await sharp(SRC).resize(legacy, legacy, { fit: 'cover' }).png().toBuffer();
  await sharp(square)
    .composite([{ input: roundMask, blend: 'dest-in' }])
    .webp({ quality: 95 })
    .toFile(resolve(outDir, 'ic_launcher_round.webp'));

  console.log(`  Android ${dir}: foreground(${fg}px), legacy(${legacy}px), round(${legacy}px)`);
}

async function updateAndroidBackgroundColor() {
  const path = resolve(androidRes, 'values/ic_launcher_background.xml');
  const xml = `<?xml version="1.0" encoding="utf-8"?>
<resources>
    <color name="ic_launcher_background">${BG_HEX}</color>
</resources>
`;
  await fs.writeFile(path, xml);
  console.log(`  Android bg color → ${BG_HEX}`);
}

async function main() {
  console.log(`Source: ${SRC}`);
  console.log(`Background: ${BG_HEX}\n`);

  console.log('Generating iOS icon…');
  await generateIosIcon();

  console.log('\nGenerating Android icons…');
  for (const d of ANDROID_DENSITIES) await generateAndroidForDensity(d);
  await updateAndroidBackgroundColor();

  console.log('\nDone.');
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
