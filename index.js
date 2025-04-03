const puppeteer = require("puppeteer");

async function scrapeProfile(url) {
    const browser = await puppeteer.launch({ 
        headless: false 
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

                console.log({ 
                    "Number of followers": followersCount,
                    "Follows:": following
                 });

                xhrResponses.push(jsonResponse);
            } catch (error) {
                console.error("Failed to process JSON:", error);
            }
        }
    });

    await page.goto(url, { waitUntil: 'networkidle2' });

    setTimeout(() => {

    }, "1000");

    await browser.close();
};

// Set interval to maintain the function running without overlapping
// setInterval(() => scrapeProfile("https://x.com/gugachacra"), 10000);
scrapeProfile("https://x.com/gugachacra");