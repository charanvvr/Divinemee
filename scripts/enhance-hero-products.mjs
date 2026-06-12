import fs from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';

const root = process.cwd();
const cutouts = path.join(root, 'public', 'images', 'cutouts');
const products = ['rose-magic.png', 'lavender-bliss.png', 'jar-pair.png'];

for (const filename of products) {
  const source = path.join(cutouts, filename);
  const input = await fs.readFile(source);
  const metadata = await sharp(input).metadata();
  const targetHeight = Math.max(4096, (metadata.height || 2048) * 2);

  const enhanced = await sharp(input)
    .ensureAlpha()
    .resize({
      height: targetHeight,
      kernel: sharp.kernel.lanczos3,
      withoutEnlargement: false,
    })
    .sharpen({
      sigma: 1.05,
      m1: 0.8,
      m2: 1.6,
      x1: 2,
      y2: 10,
      y3: 20,
    })
    .png({ compressionLevel: 9, adaptiveFiltering: true })
    .toBuffer();

  await fs.writeFile(source, enhanced);
  const result = await sharp(enhanced).metadata();
  console.log(`${filename}: ${metadata.width}x${metadata.height} -> ${result.width}x${result.height}`);
}
