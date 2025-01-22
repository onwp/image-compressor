const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

async function compressImage(filePath, settings) {
  const { compressionRate, savePath, suffix } = settings;
  
  const fileName = path.basename(filePath);
  const fileExt = path.extname(fileName);
  const fileNameWithoutExt = path.basename(fileName, fileExt);
  const outputPath = path.join(savePath, `${fileNameWithoutExt}${suffix}${fileExt}`);
  
  try {
    await sharp(filePath)
      .jpeg({ quality: compressionRate })
      .png({ quality: compressionRate })
      .toFile(outputPath);
      
    const inputSize = fs.statSync(filePath).size;
    const outputSize = fs.statSync(outputPath).size;
    
    return {
      success: true,
      fileName,
      originalSize: inputSize,
      compressedSize: outputSize,
      savePath: outputPath
    };
  } catch (error) {
    return {
      success: false,
      fileName,
      error: error.message
    };
  }
}

module.exports = { compressImage }; 