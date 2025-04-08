import { connectDatabase } from "../database/config/dbConnect.js";
import scrapedData from '../database/model/scrapedDataSchema.js';
import userData from '../database/model/userSchema.js';
import platformAccountModel from "../database/model/platformAccountSchema.js";

// init the database connection and send scraped data
export async function connectAndSendData(data, platform) {
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

        const { username, numFollowers, numFollowing } = { ...data[0] };
        console.log('Raw scraped data:', data[0]);

        // check if user already exists
        let user = await userData.findOne({ username: username });

        if (!user) {
            user = await userData.create({ username: username })
        };

        // check if platform account already exists
        let platformAccount = await platformAccountModel.findOne({
            user: user._id,
            platform: platform
        });

        if (!platformAccount) {
            platformAccount = await platformAccountModel.create({
                user: user._id,
                platform: platform
            });
        };

        const createdData = await scrapedData.create({
            platformAccount: platformAccount._id,
            num_followers: numFollowers,
            num_following: numFollowing
        });
        
        return createdData;

    } catch (error) {
        console.error('Error saving to database:', error);

        return `${error.message}`;
    };
};