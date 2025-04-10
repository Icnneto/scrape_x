import { WebSocketServer } from "ws";
import { fetchAllData } from "../database/fetchAllData.js";

let PORT = process.env.PORT || 3000;

const wss = new WebSocketServer({
    port: PORT
});

/*

 * quando alguém se conectar, mandar todas os dados do DB de uma vez para popular o gráfico no front
    - wss.on('connection', {função que será disparada toda vez que uma conexão acontecer})
 * durante a conexão, toda vez que o watch() resgatar uma inserção no db, enviar para o front (wss.broadcast???)
 
**/

async function onConnection(ws, req) {

    /*
        Client connects
        Fetch all data from scraped_data schema
        Send to front-end
        Populate dashboard
    **/

    ws.send('Fetching data...');

    try {
        const fetchedData = await fetchAllData();
        ws.send(JSON.stringify(fetchedData));
    } catch (error) {
        console.error(`Error fetching data from MongDB: ${error}`);
        ws.send(`Error fetching data from MongDB: ${error}`);
    };
}

wss.on('connection', onConnection);

wss.on('close', () => {
    console.log('Client has disconnected');
});

console.log(`WebSocket server running ws://localhost:${PORT}`);
