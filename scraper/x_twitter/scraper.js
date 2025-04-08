import puppeteerExtra from 'puppeteer-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth'

// Add the stealth plugin to avoid being detected
puppeteerExtra.use(StealthPlugin());

/**
 * Scrapes user profile data from X with anti-bot measures.
 * @param {string} url - The URL of the user profile page
*/

export async function scrapeProfile(url) {
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
                const username = jsonResponse.data.user.result.legacy.name;

                userInfosResponse.push({
                    "username": username,
                    "numFollowers": followersCount,
                    "numFollowing": following,
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