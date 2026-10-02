const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const sourceDir = path.join(__dirname, '..', 'images', 'uploads');
const outDir = path.join(__dirname, '..', 'images', 'optimized');
const widths = [480, 960, 1600];
const supported = new Set(['.jpg', '.jpeg', '.png', '.webp', '.tif', '.tiff']);

fs.mkdirSync(outDir, { recursive: true });

async function run() {
  if (!fs.existsSync(sourceDir)) return;

  const files = fs.readdirSync(sourceDir)
    .filter(f => supported.has(path.extname(f).toLowerCase()));

  let made = 0;

  for (const file of files) {
    const input = path.join(sourceDir, file);
    const stem = path.basename(file, path.extname(file));

    let meta;

    try {
      meta = await sharp(input).metadata();
    } catch (e) {
      console.warn('Skipping', file, e.message);
      continue;
    }

    for (const width of widths) {
      if (meta.width && width > meta.width * 1.15) continue;

      const output = path.join(
        outDir,
        `${stem}-${width}.webp`
      );

      await sharp(input)
        .rotate()
        .resize({
          width,
          withoutEnlargement: true
        })
        .webp({
          quality: width === 1600 ? 82 : 78,
          effort: 4
        })
        .toFile(output);

      made++;
    }
  }

  console.log(
    `Generated ${made} responsive WebP images from ${files.length} uploads.`
  );
}

run().catch(err => {
  console.error(err);
  process.exit(1);
});
