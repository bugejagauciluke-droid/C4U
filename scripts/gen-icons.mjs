/**
 * Generates PWA icons (192x192 and 512x512) as SVG files
 * then uses sharp (if available) or writes raw SVG as fallback.
 * Run: node scripts/gen-icons.mjs
 */
import { writeFileSync, mkdirSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const PUBLIC = join(__dirname, "../public");

function makeSVG(size) {
  const r = Math.round(size * 0.5);         // circle radius
  const cx = size / 2;
  const cy = size / 2;
  const heartScale = size / 512;

  // Heart path scaled to icon size (centered in 512 viewBox)
  const heart = `M256,192 C256,149 213,128 171,128 C128,128 85,171 85,213 C85,299 171,341 256,427 C341,341 427,299 427,213 C427,171 384,128 341,128 C299,128 256,149 256,192 Z`;

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#0d9488"/>
      <stop offset="100%" style="stop-color:#7c3aed"/>
    </linearGradient>
  </defs>
  <rect width="${size}" height="${size}" rx="${Math.round(size * 0.2)}" fill="url(#bg)"/>
  <g transform="translate(${size/2}, ${size/2}) scale(${heartScale * 0.7}) translate(-256, -277)">
    <path d="${heart}" fill="white"/>
  </g>
</svg>`;
}

for (const size of [192, 512]) {
  const svg = makeSVG(size);
  const path = join(PUBLIC, `icon-${size}.svg`);
  writeFileSync(path, svg);
  console.log(`✓ icon-${size}.svg`);
}

console.log("Icons generated. Update manifest.json to use .svg extension if PNG conversion unavailable.");
