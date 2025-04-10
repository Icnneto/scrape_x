import { WebSocketServer, WebSocket } from "ws";
import { fetchAllData } from "../database/fetchAllData.js";
import { startWatching } from "./watch.js";

let PORT = process.env.PORT || 3000;

const clients = new Set();

const wss = new WebSocketServer({
    port: PORT
});

wss.on('connection', async (ws) => {
    console.log('Client has connected');
    clients.add(ws);

    ws.send('Connection established with WebSocket server');

    try {
        const fetchedData = await fetchAllData();
        ws.send(JSON.stringify(fetchedData));
    } catch (error) {
        console.error('Error fetching data from MongoDB:', error);
        ws.send(`Error fetching data from MongoDB: ${error}`);
    }

    ws.on('close', () => {
        clients.delete(ws);
        console.log('Client has disconnected');
    });

    ws.on('error', (error) => {
        console.error('Error on websocket:', error);
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

    clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify(serializedData));
        };
    });
};

startWatching();

console.log(`WebSocket server running ws://localhost:${PORT}`);
