const WebSocket = require("ws");
const http = require("http");
const logger = require("./logger");
const fs = require("fs");

const server = http.createServer();
const wss = new WebSocket.Server({ server });

let clientes = [];
let usuarios = [];

wss.on("connection", (ws) => {
    logger.info("Cliente conectado (esperando mensaje inicial)");
    let primerMensaje = true; // <- para detectar el mensaje de inicio

    clientes.push(ws);

    ws.on("message", (msg) => {
        const texto = msg.toString();

        // --- Detectar mensaje inicial de nick ---
        try {
            const obj = JSON.parse(texto);
            if (obj.tipo === "nick") {
                ws.nick = obj.nick; // guardar nick en el socket
                usuarios.push(obj.nick);
                logger.info(`Cliente conectado: ${obj.nick}`);
                return; // no reenviar esto a otros clientes
            }
            if (obj.tipo === "listar") {
                ws.send(JSON.stringify({ tipo: "usuarios", data: usuarios }));
                return;
            }
            if (obj.tipo === "cambiar-nick") {
                const viejo = ws.nick;
                const nuevo = obj.nuevo;

                logger.info(`Usuario cambió nick: ${viejo} -> ${nuevo}`);

                usuarios = usuarios.map(u => u === viejo ? nuevo : u);
                ws.nick = nuevo;

                return;
            }

        } catch (e) {
            // No era JSON → debe ser mensaje cifrado normal
        }

        // Resto del código existente...
        logger.info(`Mensaje cifrado recibido de ${ws.nick ?? "desconocido"}: ${texto}`);
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
        usuarios = usuarios.filter(u => u !== ws.nick);
    });
});

server.listen(3000, () => {
    console.log("Servidor WebSocket escuchando en http://localhost:3000");
});


