/* One-off codemod for the px -> rem type-scale conversion.
   Run with: node convert-type.mjs <file> [file...]
   Delete this file once Phase 4 is complete — it is not part of the app. */
import { readFileSync, writeFileSync } from 'node:fs';

// px -> token. Mirrors the "absorbs" comments in styles/variables.css.
const TYPE = {
  8: '--text-2xs', 9: '--text-2xs', 10: '--text-2xs', 10.5: '--text-2xs',
  11: '--text-2xs', 11.5: '--text-2xs',
  12: '--text-xs', 12.5: '--text-xs',
  13: '--text-sm', 13.5: '--text-sm', 14: '--text-sm', 14.5: '--text-sm',
  15: '--text-base', 15.5: '--text-base', 16: '--text-base',
  17: '--text-lg', 18: '--text-lg',
  19: '--text-xl', 20: '--text-xl', 21: '--text-xl', 22: '--text-xl',
  24: '--text-2xl', 28: '--text-2xl',
};

// px -> spacing token, for padding/margin/gap only. 8pt grid.
const SPACE = {
  4: '--space-3xs', 5: '--space-3xs', 6: '--space-3xs', 7: '--space-3xs',
  8: '--space-2xs', 9: '--space-2xs', 10: '--space-2xs', 11: '--space-2xs',
  12: '--space-xs', 14: '--space-xs', 15: '--space-xs',
  16: '--space-sm', 18: '--space-sm', 20: '--space-sm',
  24: '--space-md', 26: '--space-md', 28: '--space-md',
  32: '--space-lg', 36: '--space-lg', 40: '--space-lg',
  48: '--space-xl', 50: '--space-xl', 56: '--space-xl', 60: '--space-xl',
  64: '--space-2xl',
};

let totals = { type: 0, space: 0, transition: 0 };

for (const file of process.argv.slice(2)) {
  let s = readFileSync(file, 'utf8');

  // font-size: Npx  ->  font-size: var(--text-*)
  s = s.replace(/font-size:\s*([0-9.]+)px/g, (m, px) => {
    const t = TYPE[parseFloat(px)];
    if (!t) return m;
    totals.type++;
    return `font-size: var(${t})`;
  });

  // font-size: clamp(Apx, Xvw, Bpx) -> clamp on the two matching tokens,
  // preserving the fluid middle term so the rendered size is unchanged.
  s = s.replace(/font-size:\s*clamp\(\s*([0-9.]+)px\s*,\s*([^,]+?)\s*,\s*([0-9.]+)px\s*\)/g,
    (m, a, mid, b) => {
      const ta = TYPE[parseFloat(a)], tb = TYPE[parseFloat(b)];
      if (!ta || !tb) return m;
      totals.type++;
      return `font-size: clamp(var(${ta}), ${mid}, var(${tb}))`;
    });

  // padding / margin / gap / inset-ish shorthands: convert each px term.
  s = s.replace(
    /(^\s*(?:padding|margin|gap|row-gap|column-gap|padding-(?:top|right|bottom|left|inline|block)|margin-(?:top|right|bottom|left|inline|block)|inset)\s*:\s*)([^;{}]+);/gm,
    (m, prop, val) => {
      if (/var\(|calc\(|clamp\(|%|auto|vh|vw|dvh|rem|em\b/.test(val)) return m;
      let touched = false;
      const out = val.replace(/\b([0-9.]+)px\b/g, (mm, px) => {
        const t = SPACE[parseFloat(px)];
        if (!t) return mm;
        touched = true;
        return `var(${t})`;
      });
      if (!touched) return m;
      totals.space++;
      return `${prop}${out};`;
    });

  writeFileSync(file, s);
  console.log(`converted ${file}`);
}

console.log(`\nfont-size: ${totals.type}   spacing: ${totals.space}`);
