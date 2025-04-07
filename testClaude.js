const puppeteerExtra = require("puppeteer-extra");
const StealthPlugin = require("puppeteer-extra-plugin-stealth");

// Add stealth plugin to avoid detection
puppeteerExtra.use(StealthPlugin());

/**
 * Scrapes user profile data from X with anti-bot measures.
 * @param {string} url - The URL of the user profile page
 * @param {string|null} proxyServer - Optional proxy server URL
*/

async function scrapeProfile(url, proxyServer = null) {
  // Launch arguments for puppeteer
  const launchArgs = [
    '--no-sandbox',
    '--disable-setuid-sandbox',
    '--disable-web-security',
    '--disable-features=IsolateOrigins,site-per-process'
  ];

  // Add proxy if provided
  if (proxyServer) {
    console.log(`Attempting to use proxy: ${proxyServer}`);
    launchArgs.push(`--proxy-server=${proxyServer}`);
  }

  // Launch browser with stealth
  const browser = await puppeteerExtra.launch({
    headless: true,
    args: launchArgs
  });

  const page = await browser.newPage();

  // Set a realistic user agent
  await page.setUserAgent(
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36'
  );

  // Set viewport to a common resolution
  await page.setViewport({ width: 1366, height: 768 });

  // Add randomized human-like behavior
  await page.evaluateOnNewDocument(() => {
    // Overwrite the navigator properties
    Object.defineProperty(navigator, 'webdriver', {
      get: () => false,
    });

    // Create a natural-looking navigator.languages array
    Object.defineProperty(navigator, 'languages', {
      get: () => ['en-US', 'en'],
    });
  });

  let xhrResponses = [];

  page.on("response", async (response) => {
    const responseUrl = response.url();

    if (responseUrl.includes("UserByScreenName")) {
      try {
        const jsonResponse = await response.json();
        // find infos in the JSON structure
        const followersCount = jsonResponse.data.user.result.legacy.followers_count;
        const following = jsonResponse.data.user.result.legacy.friends_count;

        xhrResponses.push({
          "Number of followers": followersCount,
          "Follows:": following,
          "Timestamp": new Date().toISOString()
        });
      } catch (error) {
        console.error("Failed to process JSON:", error);
      }
    }
  });

  // Add random delays to mimic human behavior
  const randomDelay = (min, max) => {
    const delay = Math.floor(Math.random() * (max - min + 1) + min);
    return new Promise(resolve => setTimeout(resolve, delay));
  };

  try {
    // Add a small random delay before navigation
    await randomDelay(1000, 2500);

    // Navigate with natural timing settings
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
  }

  return xhrResponses;
}

/**
 * Tries to scrape with several strategies
 */
async function scrapeWithFallback(url) {
  // Try first without proxy
  console.log("Attempting to scrape without proxy...");
  try {
    const data = await scrapeProfile(url);
    if (data.length > 0) {
      console.log("Successfully scraped without proxy");
      return data;
    }
  } catch (error) {
    console.error("Error scraping without proxy:", error.message);
  }

  const reliableProxies = [
    // A few manually verified proxies - these will need periodic updating - supplied by Claude
    "http://165.227.141.215:3128",
    "http://137.184.232.148:80",
    "http://34.81.120.184:80"
  ];

  for (const proxy of reliableProxies) {
    console.log(`Trying with proxy: ${proxy}`);
    try {
      const data = await scrapeProfile(url, proxy);
      if (data.length > 0) {
        console.log(`Successfully scraped with proxy: ${proxy}`);
        return data;
      }
    } catch (error) {
      console.error(`Error with proxy ${proxy}:`, error.message);
    }
  }

  console.log("All scraping attempts failed");
  return [];
}

// Execute the script
let retryDelay = 5000; // Start with 5 seconds
const maxDelay = 3 * 60 * 1000; // Maximum 3 minutes

async function scheduledScraping() {
  try {
    const data = await scrapeWithFallback("https://x.com/elonmusk");
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