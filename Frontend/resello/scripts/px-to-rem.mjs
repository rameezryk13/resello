/*
 * One-off: map px font-size declarations onto the --text-* rem scale.
 *
 * Only `font-size` is touched. Borders, shadows and radii stay in px on
 * purpose (rem borders blur when scaled; radii are already tokenised).
 * Sizes above 22px are left alone and reported — those are display sizes
 * where a clamp() usually reads better than a fixed scale step, so they
 * get a human decision instead of a mechanical rename.
 *
 * Usage: node scripts/px-to-rem.mjs <file|dir> [...]
 */
import { readFileSync, writeFileSync, statSync, readdirSync } from 'node:fs';
import { join, extname } from 'node:path';

const STEPS = [
  [11.5, '--text-2xs'],   // 10, 10.5, 11, 11.5
  [12.5, '--text-xs'],    // 12, 12.5
  [14.5, '--text-sm'],    // 13, 13.5, 14, 14.5
  [16, '--text-base'],    // 15, 15.5, 16
  [18, '--text-lg'],      // 17, 18
  [22, '--text-xl'],      // 19, 20, 21, 22
];

function tokenFor(px) {
  for (const [ceil, token] of STEPS) if (px <= ceil) return token;
  return null;
}

function collect(target, acc = []) {
  const st = statSync(target);
  if (st.isDirectory()) {
    for (const entry of readdirSync(target)) collect(join(target, entry), acc);
  } else if (extname(target) === '.css') {
    acc.push(target);
  }
  return acc;
}

const files = process.argv.slice(2).flatMap((t) => collect(t));
let converted = 0;
const skipped = [];

for (const file of files) {
  const before = readFileSync(file, 'utf8');
  const after = before.replace(
    /font-size:\s*(\d+(?:\.\d+)?)px/g,
    (match, num) => {
      const px = parseFloat(num);
      const token = tokenFor(px);
      if (!token) {
        skipped.push(`${file}: ${match}`);
        return match;
      }
      converted += 1;
      return `font-size: var(${token})`;
    },
  );
  if (after !== before) writeFileSync(file, after);
}

console.log(`converted ${converted} declaration(s) across ${files.length} file(s)`);
if (skipped.length) {
  console.log(`\nleft for manual review (>22px display sizes):`);
  for (const s of skipped) console.log(`  ${s}`);
}
