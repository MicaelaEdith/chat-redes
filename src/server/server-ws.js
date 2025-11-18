const WebSocket = require("ws");
const http = require("http");

const server = http.createServer();
const wss = new WebSocket.Server({ server });

let clientes = [];

wss.on("connection", (ws) => {
    console.log("Cliente conectado");
    clientes.push(ws);

    ws.on("message", (msg) => {
        console.log("Mensaje recibido:", msg.toString());

        // reenviar a todos
        clientes.forEach(c => {
            if (c.readyState === WebSocket.OPEN) {
                c.send(msg.toString());
            }
        });
    });

    ws.on("close", () => {
        console.log("Cliente desconectado");
        clientes = clientes.filter(c => c !== ws);
    });
});

server.listen(3000, () => {
    console.log("Servidor WebSocket escuchando en http://localhost:3000");
});
