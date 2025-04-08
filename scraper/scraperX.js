import mongoose from 'mongoose';
import { connectDatabase } from '../database/config/dbConnect.js';
import userData from '../database/model/dbSchema.js';
import puppeteerExtra from 'puppeteer-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth'

// Add the stealth plugin to avoid being detected
puppeteerExtra.use(StealthPlugin());

/**
 * Scrapes user profile data from X with anti-bot measures.
 * @param {string} url - The URL of the user profile page
*/

async function scrapeProfile(url) {
    // launch args for puppeteer
    const launchArgs = [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-web-security',
        '--disable-features=IsolateOrigins,site-per-process'
    ];

    // launch browser with Stealth plugin
    const browser = await puppeteerExtra.launch({
        headless: true,
        args: launchArgs
    });

    const page = await browser.newPage();

    // setting a realistic user agent to avoid being detected
    const customUa = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36';
    await page.setUserAgent(customUa);

    await page.setViewport({ width: 1366, height: 768 });

    // add human-like behavior
    await page.evaluateOnNewDocument(() => {
        Object.defineProperty(navigator, 'webdriver', {
            get: () => false,
        });

        Object.defineProperty(navigator, 'languages', {
            get: () => ['en-US', 'en']
        });
    });

    let userInfosResponse = [];

    page.on('response', async (response) => {
        const responseUrl = response.url();

        if (responseUrl.includes('UserByScreenName')) {
            try {
                const jsonResponse = await response.json();

                const followersCount = jsonResponse.data.user.result.legacy.followers_count;
                const following = jsonResponse.data.user.result.legacy.friends_count;

                userInfosResponse.push({
                    "num_followers": followersCount,
                    "num_following": following,
                });
            } catch (error) {
                console.error("Failed to process JSON:", error);
            };
        }
    });

    try {
        await randomDelay(1000, 2500);

        await page.goto(url, {
            waitUntil: 'networkidle2',
            timeout: 60000
        });

        // Scroll naturally to trigger more content loading
        await page.evaluate(async () => {
            await new Promise((resolve) => {
                let totalHeight = 0;
                const distance = 100;
                const timer = setInterval(() => {
                    const scrollHeight = document.body.scrollHeight;
                    window.scrollBy(0, distance);
                    totalHeight += distance;

                    if (totalHeight >= scrollHeight - window.innerHeight) {
                        clearInterval(timer);
                        resolve();
                    }
                }, 100);
            });
        });

        await randomDelay(1000, 2000);
    } catch (error) {
        console.error("Error during scraping:", error);
    } finally {
        await browser.close();
    };

    return userInfosResponse;
};

// implement random delays as a human-like behavior
async function randomDelay(min, max) {
    const delay = Math.floor(Math.random() * (max - min + 1) + min);
    return new Promise(resolve => setTimeout(resolve, delay));
};

// init the database connection and send scraped data
async function connectAndSendData(data) {
    const connection = await connectDatabase();

    connection.on('error', (e) => {
        console.error(`Database connection error: ${e}`);
    });

    connection.once('open', () => {
        console.log('Database connection established')
    });

    try {
        if (!data || !Array.isArray(data) || data.length === 0) {
            throw new Error('Invalid or empty data received');
        }

        const newData = { ...data[0] };

        const createdData = await userData.create(newData);
        return createdData;
    } catch (error) {
        console.error('Error saving to database:', error);
        return `${error.message}`;
    }
}


let retryDelay = 5000;
const maxDelay = 3 * 60 * 1000;
const url = 'https://x.com/elonmusk';

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