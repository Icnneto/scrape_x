import "dotenv/config";
import mongoose, { mongo } from 'mongoose';

export async function connectDatabase() {
    try {
        await mongoose.connect(
            process.env.DB_CONNECTION_STRING
        );

        console.log('Connected to database!');
        return mongoose.connection;
    } catch (error) {
        console.error('atabase connection error: ', error.message);
        throw error;
    }
};