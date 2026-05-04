#!/usr/bin/env node
// Generates all iOS and Android app-icon assets from the source PNGs in marketing/logo/.
//
// iOS: two 1024x1024 universal icons — light (blue S) and dark (red S on dark grey).
//      The system swaps based on the user's iOS appearance setting.
// Android: adaptive icon foreground (edge-to-edge) + legacy + round icons at
//          mdpi/hdpi/xhdpi/xxhdpi/xxxhdpi as .webp. Android has no system-level
//          dark-mode icon, so only the light variant is used.
//
// Run: node scripts/generate-icons.mjs

import sharp from 'sharp';
import { promises as fs } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, '..');
const SRC_LIGHT = resolve(root, 'marketing/logo/spc - light mode - blue S.png');
const SRC_DARK  = resolve(root, 'marketing/logo/spc - dark mode - red S.png');
const ANDROID_BG_HEX = '#0b1c3a';

// Android icon "white frame" — the visible S+baseball mark should occupy roughly
// MARK_RATIO of the icon canvas, with the rest as white padding. The source PNG
// already has the mark at ~80% of its own canvas (with white painted in for the
// rest), so to land at MARK_RATIO we composite the source onto a larger white
// canvas (sized SOURCE_SIZE × SRC_MARK_RATIO / MARK_RATIO) before resizing.
const SRC_MARK_RATIO = 0.80;
const ANDROID_MARK_RATIO = 0.60;

const iosOut = resolve(root, 'app/Assets.xcassets/AppIcon.appiconset');
const androidRes = resolve(root, 'android/app/src/main/res');
const websiteOut = resolve(root, 'website');

const ANDROID_DENSITIES = [
  { dir: 'mipmap-mdpi',    fg: 108, legacy: 48 },
  { dir: 'mipmap-hdpi',    fg: 162, legacy: 72 },
  { dir: 'mipmap-xhdpi',   fg: 216, legacy: 96 },
  { dir: 'mipmap-xxhdpi',  fg: 324, legacy: 144 },
  { dir: 'mipmap-xxxhdpi', fg: 432, legacy: 192 },
];

async function generateIosIcons() {
  const SIZE = 1024;
  await sharp(SRC_LIGHT).resize(SIZE, SIZE, { fit: 'cover' }).png()
    .toFile(resolve(iosOut, 'icon_1024x1024.png'));
  console.log('  iOS light: icon_1024x1024.png');

  await sharp(SRC_DARK).resize(SIZE, SIZE, { fit: 'cover' }).png()
    .toFile(resolve(iosOut, 'icon_1024x1024_dark.png'));
  console.log('  iOS dark:  icon_1024x1024_dark.png');
}

async function writeIosContentsJson() {
  const json = {
    images: [
      {
        filename: 'icon_1024x1024.png',
        idiom: 'universal',
        platform: 'ios',
        size: '1024x1024',
      },
      {
        appearances: [{ appearance: 'luminosity', value: 'dark' }],
        filename: 'icon_1024x1024_dark.png',
        idiom: 'universal',
        platform: 'ios',
        size: '1024x1024',
      },
    ],
    info: { author: 'xcode', version: 1 },
  };
  await fs.writeFile(
    resolve(iosOut, 'Contents.json'),
    JSON.stringify(json, null, 2) + '\n'
  );
  console.log('  iOS Contents.json updated (light + dark)');
}

async function buildAndroidPaddedSource() {
  // Pad the source onto a larger white canvas so the visible mark lands at
  // ANDROID_MARK_RATIO of the icon canvas when rendered full-bleed.
  const meta = await sharp(SRC_LIGHT).metadata();
  const padded = Math.round(meta.width * (SRC_MARK_RATIO / ANDROID_MARK_RATIO));
  return sharp({ create: { width: padded, height: padded, channels: 4, background: '#ffffff' } })
    .composite([{ input: SRC_LIGHT, gravity: 'center' }])
    .png()
    .toBuffer();
}

async function generateAndroidForDensity({ dir, fg, legacy }, paddedSource) {
  const outDir = resolve(androidRes, dir);
  await fs.mkdir(outDir, { recursive: true });

  // Adaptive foreground: full-bleed white-padded logo. Pixel/squircle masks crop
  // the corners, leaving a clean white circle/squircle with the S centered inside.
  await sharp(paddedSource).resize(fg, fg, { fit: 'cover' }).webp({ quality: 95 })
    .toFile(resolve(outDir, 'ic_launcher_foreground.webp'));

  // Legacy square (pre-Android 8 launchers): same padded source, full bleed.
  await sharp(paddedSource).resize(legacy, legacy, { fit: 'cover' }).webp({ quality: 95 })
    .toFile(resolve(outDir, 'ic_launcher.webp'));

  // Legacy round: padded source, full bleed, circle-masked.
  const square = await sharp(paddedSource).resize(legacy, legacy, { fit: 'cover' }).png().toBuffer();
  const r = legacy / 2;
  const roundMask = Buffer.from(
    `<svg xmlns="http://www.w3.org/2000/svg" width="${legacy}" height="${legacy}"><circle cx="${r}" cy="${r}" r="${r}" fill="white"/></svg>`
  );
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
    <color name="ic_launcher_background">${ANDROID_BG_HEX}</color>
</resources>
`;
  await fs.writeFile(path, xml);
  console.log(`  Android bg color → ${ANDROID_BG_HEX}`);
}

async function generateWebsiteIcons() {
  // Standard favicon (used by browsers, RSS readers, link previews).
  await sharp(SRC_LIGHT).resize(32, 32, { fit: 'cover' }).png()
    .toFile(resolve(websiteOut, 'favicon.png'));
  console.log('  Web: favicon.png (32x32)');

  // Apple touch icon (iOS Add to Home Screen, Safari pinned tabs).
  await sharp(SRC_LIGHT).resize(180, 180, { fit: 'cover' }).png()
    .toFile(resolve(websiteOut, 'apple-touch-icon.png'));
  console.log('  Web: apple-touch-icon.png (180x180)');
}

async function main() {
  console.log(`Light source: ${SRC_LIGHT}`);
  console.log(`Dark source:  ${SRC_DARK}`);
  console.log(`Android bg:   ${ANDROID_BG_HEX}\n`);

  console.log('Generating iOS icons…');
  await generateIosIcons();
  await writeIosContentsJson();

  console.log(`\nGenerating Android icons (white-frame, mark @ ${Math.round(ANDROID_MARK_RATIO * 100)}%)…`);
  const paddedSource = await buildAndroidPaddedSource();
  for (const d of ANDROID_DENSITIES) await generateAndroidForDensity(d, paddedSource);
  await updateAndroidBackgroundColor();

  console.log('\nGenerating website icons…');
  await generateWebsiteIcons();

  console.log('\nDone.');
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
