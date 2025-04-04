# X Profile Scraper

### Technologies Used

- **JavaScript** (Node.js)
- **Puppeteer** (Headless browser automation)

### Why Puppeteer?

X (formerly Twitter) is a Single Page Application (SPA) that heavily relies on JavaScript for rendering content. Puppeteer enables server-side rendering, allowing us to intercept API responses and extract data that wouldn't be accessible via a simple HTTP request.

- [Article by Scrapfly](https://scrapfly.io/blog/how-to-scrape-twitter/)

### How to Run

#### Prerequisites

Ensure you have Node.js installed.

#### Installation

```bash
npm install puppeteer
```

#### Running the Scraper

```bash
node scraper.js
```

### Future Implementations

- Store results in a database to monitor user statistics (MongoDB, Firebase, Supabase(SQL))
- Implement server-side caching to compare scraped data with the latest database entry
    - If the data remains unchanged, avoid sending new records to minimize database queries
- Use IP proxies and implement IP rotation to prevent request blocking by X
- Create a dashboard to visualize real time data
- Script hosting - to keep it alive 24/7
- Implement anti-bot detection
