// convert-images.js
const fs = require("fs");
const path = require("path");
const sharp = require("sharp");

const inputDir = "public/images";             // folder with your .jpg/.png
const outputDir = "public/images/optimized";  // where to save .webp

if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });

const files = fs.readdirSync(inputDir).filter(f => /\.(png|jpe?g)$/i.test(f));

for (const f of files) {
  const input = path.join(inputDir, f);
  const output = path.join(outputDir, f.replace(/\.(png|jpe?g)$/i, ".webp"));

  sharp(input)
    .resize({ width: 1600, withoutEnlargement: true }) // optional resize
    .webp({ quality: 82 })                             // convert + compress
    .toFile(output)
    .then(() => console.log(`✅ ${f} → ${path.basename(output)}`))
    .catch(err => console.error(`❌ ${f}:`, err.message));
}