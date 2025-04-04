const puppeteer = require("puppeteer");

/** 
 * Scrapes user profile data from X (formerly Twitter).
 * Captures API responses to extract the number of followers and following count
     
 * @param {string} url - The URL of the user profile page
*/
async function scrapeProfile(url) {

    const browser = await puppeteer.launch({
        headless: true
    });

    const page = await browser.newPage();

    let xhrResponses = [];

    page.on("response", async (response) => {
        const url = response.url();

        if (url.includes("UserByScreenName")) {

            try {
                const jsonResponse = await response.json();
                const followersCount = jsonResponse.data.user.result.legacy.followers_count;
                const following = jsonResponse.data.user.result.legacy.friends_count;

                xhrResponses.push({
                    "Number of followers": followersCount,
                    "Follows:": following
                });

            } catch (error) {
                console.error("Failed to process JSON:", error);
            }
        }
    });

    await page.goto(url, { waitUntil: 'networkidle2' });

    // Timeout to avoid browser closing before intercepting response
    setTimeout(() => {
        console.log('Waiting');
    }, 3000);

    await browser.close();

    return xhrResponses;
};

// Set interval to maintain the function running without overlapping
// setInterval(() => scrapeProfile("https://x.com/elonmusk"), 10000);

// Call function only one time
scrapeProfile("https://x.com/elonmusk").then(data => {
    console.log(`Captured data: ${JSON.stringify(data)}`)
})