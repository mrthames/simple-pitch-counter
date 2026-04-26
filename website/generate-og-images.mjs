import { chromium } from 'playwright';
import { readFileSync, writeFileSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

const articles = [
  {
    file: 'og-pitch-count-rules.png',
    tag: 'Rules Reference',
    title: 'Little League Pitch Count Rules 2026',
    subtitle: 'Daily limits, rest-day charts, and catcher-pitcher restrictions for every age group',
  },
  {
    file: 'og-parents-guide.png',
    tag: 'For Parents',
    title: 'You Don\'t Need to Know Baseball to Count Pitches',
    subtitle: 'A guide for the parent who just volunteered to help at the field',
  },
  {
    file: 'og-catcher-innings-rules.png',
    tag: 'Rules Reference',
    title: 'Catcher Rules: How Many Innings Can a Kid Catch?',
    subtitle: 'Catcher-pitcher eligibility, why both positions are tracked, and common mistakes',
  },
  {
    file: 'og-mercy-rule.png',
    tag: 'Rules Reference',
    title: 'The Mercy Rule Explained',
    subtitle: 'The 10-run rule, how shortened games affect pitch counts and rest days',
  },
  {
    file: 'og-what-is-pitch-count.png',
    tag: 'For Volunteers',
    title: 'What Is a Pitch Counter?',
    subtitle: 'The volunteer role that protects young arms at every Little League game',
  },
  {
    file: 'og-travel-ball-pitch-counts.png',
    tag: 'Travel Ball',
    title: 'Travel Ball vs. Rec League Pitch Counts',
    subtitle: 'Why travel ball parents need to track on their own',
  },
];

const templatePath = join(__dirname, 'og-template.html');
const imagesDir = join(__dirname, 'images');

try { mkdirSync(imagesDir, { recursive: true }); } catch {}

const browser = await chromium.launch();
const context = await browser.newContext({ viewport: { width: 1200, height: 630 } });

for (const article of articles) {
  const page = await context.newPage();
  await page.goto(`file://${templatePath.replace(/\\/g, '/')}`);
  await page.waitForLoadState('networkidle');

  await page.evaluate(({ tag, title, subtitle }) => {
    document.getElementById('tag').textContent = tag;
    document.getElementById('title').textContent = title;
    document.getElementById('subtitle').textContent = subtitle;
  }, article);

  await page.waitForTimeout(500);

  const outputPath = join(imagesDir, article.file);
  await page.screenshot({ path: outputPath, type: 'png' });
  console.log(`Generated: ${article.file}`);
  await page.close();
}

await browser.close();
console.log('All OG images generated.');
