import fs from 'fs';
import Scraper from 'images-scraper';
import fetch from 'node-fetch';

if (!globalThis.fetch) {
    globalThis.fetch = fetch;
}

const google = new Scraper({ // initailize
    puppeteer: {
        // this is added to extend timeout error incase you are experiencing one. if error persit,
        // the temporary fix which only applies locally is to dig into the npm package and locate
        // the file path: node_modules/images-scraper/src/google/scraper.js 
        // then goto "_scrapePage" function and add `page.setDefaultNavigationTimeout(0);` after `const page = await this.browser.newPage();`
        // thi action will turn off timeout completely
        timeout: 120000 
    }
})

const keyword = process.argv[2]||'apple';
const expectedResultCount = 5;

/**
 * Scrape for images link
 * @param {string} keyword image keyword to search for
 * @returns void
 */
async function ScrapeImg(keyword) {
    try {
        const result = await google.scrape(keyword, expectedResultCount);
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
async function saveImage(url, fileName) {
    try {
        console.log(`extracting and saving ${fileName}.jpg to file...`);
        const res = await fetch(url);
        const filePath = `./images/${trimText(fileName)}.jpg`;
        const dest = fs.createWriteStream(filePath);
        res.body.pipe(dest)
        console.log(`image ${trimText(fileName)}.jpg saved!`)
    } catch (error) {
        console.log(`image ${fileName} fetched from ${url} - failed!`)
        console.log(error.message);
    }
}

function trimText(text) {
    return text.replace(/\s/g, '').toLowerCase();
}

ScrapeImg(keyword);
