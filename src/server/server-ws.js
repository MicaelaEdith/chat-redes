const WebSocket = require("ws");
const http = require("http");
const logger = require("./logger");
const fs = require("fs");

const server = http.createServer();
const wss = new WebSocket.Server({ server });

let clientes = [];

wss.on("connection", (ws) => {
    logger.info("Cliente conectado (esperando mensaje inicial)");
    let primerMensaje = true; // <- para detectar el mensaje de inicio

    clientes.push(ws);

    ws.on("message", (msg) => {
        const texto = msg.toString();

        // si es el primer mensaje, lo tratamos como "nick conectado"
        if (primerMensaje) {
            logger.info(`Usuario anunció conexión (mensaje cifrado inicial): ${texto}`);
            primerMensaje = false;
        }

        logger.info(`Mensaje cifrado recibido: ${texto}`);
        fs.appendFileSync("mensajes.log", texto + "\n");

        clientes.forEach(c => {
            if (c.readyState === WebSocket.OPEN) {
                c.send(texto);
            }
        });
    });

    ws.on("close", () => {
        logger.info("Usuario desconectado (WS cerrado)");
        clientes = clientes.filter(c => c !== ws);
    });
});

server.listen(3000, () => {
    console.log("Servidor WebSocket escuchando en http://localhost:3000");
});


