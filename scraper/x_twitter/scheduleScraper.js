import { scrapeProfile } from "./scraper.js";
import { connectAndSendData } from "../sendData.js";

const url = 'https://x.com/elonmusk';

let retryDelay = 5000;
const maxDelay = 3 * 60 * 1000;

async function scheduledScraping() {
    console.log('Starting to scrape...')
    try {
        const data = await scrapeProfile(url);

        const sendData = await connectAndSendData(data);
        console.log(`Data sent to database: ${JSON.stringify(sendData)}`);

        retryDelay = 5000;
    } catch (error) {
        console.error("Scraping process failed:", error);

        // Increase delay after failure (up to maximum)
        retryDelay = Math.min(retryDelay * 1.5, maxDelay);
    }

    // Schedule next run
    setTimeout(scheduledScraping, retryDelay);
}

scheduledScraping();