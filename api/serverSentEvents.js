import express from 'express';
import { fetchAllData } from "../database/fetchAllData.js";
import { startWatching } from './watch.js';

const app = express();
app.use(express.json());

let PORT = process.env.PORT || 3000;

const clients = new Set();

app.get('/events', async (req, res) => {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    // Send an initial message
    res.write(`data: Connected to server\n\n`);

    clients.add(res);

    try {
        const fetchedData = await fetchAllData();
        res.write(`data: ${JSON.stringify(fetchedData)}\n\n`);
    } catch (error) {
        console.error('Error fetching data from MongoDB:', error);
        res.write(`data: Error fetching data from MongoDB: ${error}\n\n`);
    };

    // When client closes connection, stop sending events
    req.on('close', () => {
        clearInterval(intervalId);
        res.end();
    });
});

export async function broadcastToClients(data) {

    const serializedData = {
        _id: data._id.toString(),
        platformAccount: data.platformAccount.toString(),
        num_followers: data.num_followers,
        num_following: data.num_following,
        created_at: data.created_at.toISOString(),
    };

    const message = `data: ${JSON.stringify(serializedData)}\n\n`;

    clients.forEach((clientRes) => {
        try {
            clientRes.write(message);
        } catch (error) {
            console.error('Erro ao enviar dados para um cliente SSE:', error);
            clients.delete(clientRes); // Remove cliente com erro
        }
    });
};

startWatching();

app.listen(PORT, () => {
    console.log(`Server-sent Events server running http://localhost:${PORT}`);
});