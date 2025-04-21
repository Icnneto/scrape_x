# X Profile Scraper
This project scrapes public profile data from **X (Twitter)** using **Puppeteer** with stealth techniques and stores the data in **MongoDB** using **Mongoose**.

### Technologies Used

- **JavaScript (Node.js)**
- **Puppeteer + Stealth Plugin**
- **MongoDB + Mongoose**
- **dotenv** (for secure environment variables)
- **concurrently**

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
In `scraper/scheduleScraper.js`, set the `url` variable to the profile URL of the user whose data you want to scrape

#### Run the Scraper

```bash
npm run dev
```
The scraper will start scraping the defined X profile periodically and push the data into your MongoDB collection.

### Testing without MongoDB
If you’d like to test the scraper without setting up a MongoDB database, follow these simple steps:

- Open the `scraper/scheduleScraper.js` file;
- Remove or comment out the line:
    ```js
    const sendData = await connectAndSendData(data, platform);
    ```
- Add a `console.log()` line to print the scraped data:
    ```js
    console.log(`Data scraped: ${JSON.stringify(data)}`);
    ```

Your updated function will look like this:

```js
async function scheduledScraping() {
    console.log('Starting to scrape...')
    try {
        const data = await scrapeProfile(url);
        console.log(`Data scraped: ${JSON.stringify(data)}`)

    } catch (error) {
        console.error("Scraping process failed:", error);

    }

};

scheduledScraping();
```
This is useful for testing the scraping logic without needing a database connection.

**Useful tip**: If you want to run it in a loop for testing purposes, simply add a setTimeout at the end of the function with a fixed interval.

*The deployed version on Render uses a cron job to control the scraping schedule.*

###  Features
- **Stealth Mode**: Avoid detection by using puppeteer-extra-plugin-stealth.
- **Custom Headers**: Uses a real browser user-agent.
- **Random Delays**: Mimics human-like browsing behavior.
- **XHR Interception**: Extracts data directly from UserByScreenName API.
- **MongoDB Integration**: Stores scraped data with timestamp.
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
1. Launches a headless browser using `Puppeteer + Stealth Plugin`
2. Sets a realistic `user-agent` and disables bot indicators
3. Navigates to the profile URL
4. Listens for XHR responses from `UserByScreenName` endpoint
5. Extracts `username`, `followers_count` and `friends_count`
6. Pushes data to MongoDB
7. Waits before running again

### Future Implementations

- Use rotating proxies to bypass rate limits
- Run the API 24/7 on Render, and trigger the scraping function periodically using a schedule (like a cron job or internal timer)
- Create a dashboard to visualize real time data

### Architecture Design (not implemented yet)
```bash
[Scraper] ----> [MongoDB] <----> [API + watch()]
(Render)                             | (Render)
                                     |
                                     | (WebSocket)
                                     |
                                     v
----------------------------------------------
[                Front-end                   ]
           (Vercel or GitHub Pages)
```
