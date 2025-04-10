import mongoose from "mongoose";
import { broadcastToClients } from "./websocket.js";
import { connectDatabase } from "../database/config/dbConnect.js";

export async function startWatching() {
    await connectDatabase();

    const collection = mongoose.connection.collection('scraped_datas');
    const changeStream = collection.watch([{ $match: { operationType: 'insert' } }]);

    changeStream.on('change', (change) => {
        console.log('New insertion detected: ', change.fullDocument);
        broadcastToClients(change.fullDocument);
    });
};