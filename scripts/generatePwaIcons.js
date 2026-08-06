import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

async function generateIcons() {
  const publicDir = path.join(process.cwd(), 'public');
  const stdSvgPath = path.join(publicDir, 'favicon.svg');
  const maskSvgPath = path.join(publicDir, 'maskable.svg');

  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true });
  }

  const stdSvgBuffer = fs.readFileSync(stdSvgPath);
  const maskSvgBuffer = fs.readFileSync(maskSvgPath);

  console.log('[PWA Icon Generator] Generating official Kenfoss PWA PNG icons...');

  // 1. 192x192 PNG
  await sharp(stdSvgBuffer)
    .resize(192, 192)
    .png({ quality: 100, compressionLevel: 9 })
    .toFile(path.join(publicDir, 'pwa-192x192.png'));
  console.log(' ✓ Generated pwa-192x192.png (192x192)');

  // 2. 512x512 PNG
  await sharp(stdSvgBuffer)
    .resize(512, 512)
    .png({ quality: 100, compressionLevel: 9 })
    .toFile(path.join(publicDir, 'pwa-512x512.png'));
  console.log(' ✓ Generated pwa-512x512.png (512x512)');

  // 3. Maskable 512x512 PNG (Full bleed square background)
  await sharp(maskSvgBuffer)
    .resize(512, 512)
    .png({ quality: 100, compressionLevel: 9 })
    .toFile(path.join(publicDir, 'maskable-icon-512.png'));
  console.log(' ✓ Generated maskable-icon-512.png (512x512 Maskable)');

  // 4. Apple Touch Icon 180x180 PNG
  await sharp(stdSvgBuffer)
    .resize(180, 180)
    .png({ quality: 100, compressionLevel: 9 })
    .toFile(path.join(publicDir, 'apple-touch-icon.png'));
  console.log(' ✓ Generated apple-touch-icon.png (180x180)');

  // 5. Favicon ICO (32x32)
  await sharp(stdSvgBuffer)
    .resize(32, 32)
    .png()
    .toFile(path.join(publicDir, 'favicon.ico'));
  console.log(' ✓ Generated favicon.ico (32x32)');

  console.log('[PWA Icon Generator] All icons successfully generated!');
}

generateIcons().catch((err) => {
  console.error('[PWA Icon Generator Error]:', err);
  process.exit(1);
});
