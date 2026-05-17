const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

async function resizeImages() {
  const assetsDir = path.join(__dirname, 'src', 'assets');
  const files = ['nengra.jpg', 'amropali.jpg', 'khirsapat.jpg', 'bari4.jpg'];

  for (const file of files) {
    const filePath = path.join(assetsDir, file);
    const tempPath = path.join(assetsDir, `temp_${file}`);

    try {
      await sharp(filePath)
        .resize({ width: 400, withoutEnlargement: true })
        .jpeg({ quality: 80 })
        .toFile(tempPath);
      
      fs.unlinkSync(filePath);
      fs.renameSync(tempPath, filePath);
      console.log(`Resized ${file}`);
    } catch (err) {
      console.error(`Error processing ${file}:`, err);
    }
  }
}

resizeImages();
