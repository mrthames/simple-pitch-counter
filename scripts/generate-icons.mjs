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

async function generateAndroidForDensity({ dir, fg, legacy }) {
  const outDir = resolve(androidRes, dir);
  await fs.mkdir(outDir, { recursive: true });

  // Adaptive foreground: edge-to-edge logo. The system composites this over the
  // ic_launcher_background color and then applies the device's icon mask.
  await sharp(SRC_LIGHT).resize(fg, fg, { fit: 'cover' }).webp({ quality: 95 })
    .toFile(resolve(outDir, 'ic_launcher_foreground.webp'));

  // Legacy square icon (pre-Android 8 launchers).
  await sharp(SRC_LIGHT).resize(legacy, legacy, { fit: 'cover' }).webp({ quality: 95 })
    .toFile(resolve(outDir, 'ic_launcher.webp'));

  // Round legacy icon: same content masked to a circle.
  const r = legacy / 2;
  const roundMask = Buffer.from(
    `<svg xmlns="http://www.w3.org/2000/svg" width="${legacy}" height="${legacy}"><circle cx="${r}" cy="${r}" r="${r}" fill="white"/></svg>`
  );
  const square = await sharp(SRC_LIGHT).resize(legacy, legacy, { fit: 'cover' }).png().toBuffer();
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

  console.log('\nGenerating Android icons (light variant only)…');
  for (const d of ANDROID_DENSITIES) await generateAndroidForDensity(d);
  await updateAndroidBackgroundColor();

  console.log('\nGenerating website icons…');
  await generateWebsiteIcons();

  console.log('\nDone.');
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
