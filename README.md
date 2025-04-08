# X Profile Scraper
This project scrapes public profile data from **X (Twitter)** using **Puppeteer** with stealth techniques and stores the data in **MongoDB** using **Mongoose**.

### Technologies Used

- **JavaScript (Node.js)**
- **Puppeteer + Stealth Plugin**
- **MongoDB + Mongoose**
- **dotenv** (for secure environment variables)

### Why Puppeteer?

X (formerly Twitter) is a Single Page Application (SPA) that heavily relies on JavaScript for rendering content. Puppeteer enables server-side rendering, allowing us to intercept API responses and extract data that wouldn't be accessible via a simple HTTP request.

- [Article by Scrapfly](https://scrapfly.io/blog/how-to-scrape-twitter/)

### How to Run

#### Setup Instructions

Clone the Repository

#### Install dependencies

```bash
npm install
```

#### Environment Configuration
Create a `.env` file at the root and add your MongoDB connection string:

```bash
DB_CONNECTION_STRING=mongodb+srv://your_username:your_password@cluster.mongodb.net/your_db_name
```

#### Define the User to Scrape
In `scraper/x_twitter/scheduleScraper.js`, set the `url` variable to the profile URL of the user whose data you want to scrape

#### Run the Scraper

```bash
npm run scraper
```
The scraper will start scraping the defined X profile periodically and push the data into your MongoDB collection.

#### Testing without MongoDB
If you'd like to test this application in a simpler way, without the need of configuring a MongoDB database, here's how:

- Access `scraper/x_twitter/scheduleScraper.js` directory;
- Remove the function call `const sendData = await connectAndSendData(data, platform)`;
- Add a `console.log(`Data scraped: ${JSON.stringify(data)}`)`

And the code will look like this:

```js
async function scheduledScraping() {
    console.log('Starting to scrape...')
    try {
        const data = await scrapeProfile(url);
        console.log(`Data scraped: ${JSON.stringify(data)}`)

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
```

###  Features
- **Stealth Mode**: Avoid detection by using puppeteer-extra-plugin-stealth.
- **Custom Headers**: Uses a real browser user-agent.
- **Random Delays**: Mimics human-like browsing behavior.
- **XHR Interception**: Extracts data directly from UserByScreenName API.
- **MongoDB Integration**: Stores scraped data with timestamp.
- **Automatic Retry Logic**: Handles failures with exponential backoff.
- **Timestamps**: Records when each data point was captured (created_at).

### MongoDB Schema
The MongoDB schema structure is organized within a nested directory called `database`, with all schema models located in `database/model/`.

The schemas are separated into individual files:

- `platformAccountSchema.js`
- `scrapedDataSchema.js`
- `userSchema.js`

```js
    _id: ObjectId,
    platformAccount: ObjectId,
    num_followers: Number,
    num_following: Number,
    created_at: ISODate
```
Defined in: `database/model/scrapedDataSchema.js`

### How It Works
1. Launches a headless browser using Puppeteer + Stealth Plugin
2. Sets a realistic user-agent and disables bot indicators
3. Navigates to the profile URL
4. Listens for XHR responses from UserByScreenName endpoint
5. Extracts followers_count and friends_count
6. Pushes data to MongoDB
7. Waits before running again, increasing the delay if errors occur

### Future Implementations

- Use rotating proxies or headless browsers to bypass rate limits
- Create a dashboard to visualize real time data
- Run 24/7 via cronjob or background worker (Docker or cloud function)
