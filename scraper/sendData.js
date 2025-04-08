import { connectDatabase } from "../database/config/dbConnect.js";
import scrapedData from '../database/model/scrapedDataSchema.js';
import platformAccount from '../database/model/platformAccountSchema.js';
import userData from '../database/model/userSchema.js';

// init the database connection and send scraped data
export async function connectAndSendData(data) {
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

        const createdData = await scrapedData.create(newData);
        return createdData;
    } catch (error) {
        console.error('Error saving to database:', error);
        return `${error.message}`;
    }
}