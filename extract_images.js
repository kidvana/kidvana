const Tesseract = require('tesseract.js');
const fs = require('fs');
const path = require('path');

const folderPath = path.join(__dirname, 'product');
const files = fs.readdirSync(folderPath).filter(f => f.endsWith('.jpg') || f.endsWith('.png')).sort();

async function processImages() {
    console.log(`Processing ${files.length} images...`);
    // Let's process the first 3 images to sample the content and understand the format
    for (let i = 0; i < Math.min(files.length, 3); i++) {
        const file = files[i];
        console.log(`\n\n=== Reading ${file} ===\n`);
        const imgPath = path.join(folderPath, file);
        try {
            const worker = await Tesseract.createWorker('eng');
            const ret = await worker.recognize(imgPath);
            console.log(ret.data.text);
            await worker.terminate();
        } catch (err) {
            console.error(`Error with ${file}:`, err.message);
        }
    }
}

processImages();
