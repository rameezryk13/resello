/*
 * Second pass: the remaining px font-sizes are display sizes (>22px) and
 * clamp() expressions. Neither belongs on the --text-* scale — a heading
 * that reads well at 28px shouldn't be forced down to --text-xl — but px
 * inside a clamp() ignores root font-size exactly like a bare px value
 * does, so they still have to leave px behind.
 *
 * This converts px→rem arithmetically (÷16) inside font-size only,
 * preserving each value's rendered size at the default 16px root while
 * letting it scale when the user raises their browser/OS font size.
 *
 * Usage: node scripts/px-to-rem-display.mjs <file|dir> [...]
 */
import { readFileSync, writeFileSync, statSync, readdirSync } from 'node:fs';
import { join, extname } from 'node:path';

function collect(target, acc = []) {
  const st = statSync(target);
  if (st.isDirectory()) {
    for (const entry of readdirSync(target)) collect(join(target, entry), acc);
  } else if (extname(target) === '.css') {
    acc.push(target);
  }
  return acc;
}

// Trailing zeros trimmed so 1.75rem doesn't come out as 1.750rem.
const toRem = (px) => `${parseFloat((px / 16).toFixed(4))}rem`;

const files = process.argv.slice(2).flatMap((t) => collect(t));
let converted = 0;

for (const file of files) {
  const before = readFileSync(file, 'utf8');
  const after = before.replace(/font-size:\s*([^;{}]+)/g, (match, value) => {
    if (!/\d+(?:\.\d+)?px/.test(value)) return match;
    const next = value.replace(/(\d+(?:\.\d+)?)px/g, (_, n) => {
      converted += 1;
      return toRem(parseFloat(n));
    });
    return `font-size: ${next}`;
  });
  if (after !== before) writeFileSync(file, after);
}

console.log(`converted ${converted} px value(s) across ${files.length} file(s)`);
