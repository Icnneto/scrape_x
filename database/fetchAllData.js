import { connectDatabase } from "./config/dbConnect.js";
import scrapedData from "./model/scrapedDataSchema.js";
import platformAccountModel from "./model/platformAccountSchema.js";
import userData from "./model/userSchema.js";

// implementation: use populate to retrieve the user (profile we are scraping) to send a complete data for front-end processing
export async function fetchAllData() {
    const connection = await connectDatabase();

    connection.on('error', (e) => {
        console.error(`Database connection error: ${e}`);
    });

    connection.once('open', () => {
        console.log('Database connection established')
    });

    try {
        const data = await scrapedData.
            find({}).
            populate({
                path: 'platformAccount',
                select: 'platform -_id',
                populate: {
                    path: 'user',
                    select: 'username -_id'
                }
            }).
            exec();

        return data;
    } catch (error) {
        console.error('Error retrieving data:', error);
        return `${error.message}`;
    };
}

