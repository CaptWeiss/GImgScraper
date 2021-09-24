import fs from 'fs';
import Scraper from 'images-scraper';
import fetch from 'node-fetch';

if (!globalThis.fetch) {
    globalThis.fetch = fetch;
}

const google = new Scraper({
    puppeteer: {
        timeout: 120000
    }
})

const keyword = process.argv[2]||'apple';

/** Scrape for images link */
async function ScrapeImg(keyword) {
    try {
        const result = await google.scrape(keyword, 5);
        let data = JSON.stringify(result, null, 4);
        fs.writeFileSync(`imagesLink/${trimText(keyword)}.json`, data);
        result.map((img, idx) => {
            saveImage(img.url, `${keyword}-${idx}`); // joining the keyword with the image index (idx) to avoid overwrite when is getting saved
        })
        console.log(`Result saved to imagesLink/${trimText(keyword)}.json`);
        return;
    } catch (error) {
        console.log(error);
        process.exitCode = 1;
        process.exit();
    }
}

/**
 * This function save individual image to the images folder
 * @param {string} url image url
 * @param {string} filename name to save the image with
 */
function saveImage(url, fileName) {
    fetch(url)
        .then(res => {
            const filePath = `./images/${trimText(fileName)}.jpg`;
            const dest = fs.createWriteStream(filePath);
            res.body.pipe(dest)
        })
        .catch((err) => {
            console.log(`image ${filename} fetched from ${url} - failed!`)
            console.log(err)
        })
}

function trimText(text) {
    return text.replace(/\s/g, '').toLowerCase();
}

ScrapeImg(keyword);
