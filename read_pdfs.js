const tesseract = require("node-tesseract-ocr");
const fs = require("fs");
const path = require("path");

const config = {
    lang: "eng",
    oem: 1,
    psm: 3,
};

const folderPath = path.join(__dirname, "product");

async function readImages() {
    try {
        const files = fs.readdirSync(folderPath).filter(f => f.endsWith('.jpg') || f.endsWith('.png'));
        console.log(`Found ${files.length} images to process.`);
        for (const file of files) {
            const imgPath = path.join(folderPath, file);
            console.log(`\n--- Reading ${file} ---`);
            try {
                const text = await tesseract.recognize(imgPath, config);
                console.log(text.trim());
            } catch (err) {
                console.error(`Error reading ${file}:`, err.message);
            }
        }
    } catch (e) {
        console.error("Error reading folder:", e.message);
    }
}

readImages();
