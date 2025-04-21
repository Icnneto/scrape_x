import { scrapeProfile } from "./scraper.js";
import { connectAndSendData } from "./sendData.js";

const platform = 'X';
const url = 'https://x.com/elonmusk';

export async function scheduledScraping() {
    console.log('Starting to scrape...')
    try {
        const data = await scrapeProfile(url);
        const sendData = await connectAndSendData(data, platform);
        console.log(`Data sent to database: ${JSON.stringify(sendData)}`);
    } catch (error) {
        console.error("Scraping process failed:", error);
    }
};

// scheduledScraping();