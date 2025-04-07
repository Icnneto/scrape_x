const puppeteerExtra = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');

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

    // config viewport
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

    // create empty array to store user scraped data
    let userInfosResponse = [];

    page.on('response', async (response) => {
        const responseUrl = response.url();

        if (responseUrl.includes('UserByScreenName')) {
            try {
                const jsonResponse = await response.json();

                // find infos in the JSON structure
                const followersCount = jsonResponse.data.user.result.legacy.followers_count;
                const following = jsonResponse.data.user.result.legacy.friends_count;

                userInfosResponse.push({
                    "Number of followers": followersCount,
                    "Follows:": following,
                    "Timestamp": new Date().toISOString()
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

        // Wait to ensure we capture the API response
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

// Execute the script
let retryDelay = 5000; // Start with 5 seconds
const maxDelay = 3 * 60 * 1000; // Maximum 3 minutes
const url = 'https://x.com/elonmusk';

async function scheduledScraping() {
    console.log('Starting to scrape...')
    try {
        const data = await scrapeProfile(url);
        console.log(`Captured data: ${JSON.stringify(data)}`);

        // Reset delay after successful scrape
        retryDelay = 5000;
    } catch (error) {
        console.error("Scraping process failed:", error);

        // Increase delay after failure (up to maximum)
        retryDelay = Math.min(retryDelay * 1.5, maxDelay);
    }

    // Schedule next run
    setTimeout(scheduledScraping, retryDelay);
}

// Start the first scrape
scheduledScraping();