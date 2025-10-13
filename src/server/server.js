// Servidor de chat TCP con logs

import net from "net";
import fs from "fs";
import path from "path";

//--------- CONFIG--------
const PORT = 7000;
const LOG_DIR = "./logs";
const LOG_FILE = path.join(LOG_DIR, "chat.log");

// ---- LOG ----------
try {
  if (!fs.existsSync(LOG_DIR)) {
    fs.mkdirSync(LOG_DIR, { recursive: true });
    console.log(`[LOG] Carpeta '${LOG_DIR}' creada.`);
  }
} catch (err) {
  console.error("[ERROR] No se pudo crear la carpeta de logs:", err.message);
  process.exit(1);
}

const logStream = fs.createWriteStream(LOG_FILE, { flags: "a" });

//----- CLIENTES CONECTADOS---------
const clients = new Set();

// --------FUNCIÓN AUXILIAR ------
function logLine(line) {
  const timestamp = new Date().toISOString();
  logStream.write(`[${timestamp}] ${line}\n`);
}

//----------SANEAR NICK ---------
function sanitizeNick(rawNick) {
  return rawNick.replace(/[^a-zA-Z0-9_-]/g, "").substring(0, 20) || "Anon";
}

//---------BROADCAST ----------
function broadcast(message, except = null) {
  for (const c of clients) {
    if (c !== except && !c.destroyed) {
      try {
        c.write(message);
      } catch (err) {
        console.error("[WARN] Error enviando mensaje a un cliente:", err.message);
      }
    }
  }
}

//---------SERVIDOR---------
const server = net.createServer((socket) => {
  socket.setEncoding("utf8");
  socket.id = `${socket.remoteAddress}:${socket.remotePort}`;
  socket.nick = sanitizeNick(socket.id);

  clients.add(socket);

  console.log(`[INFO] Cliente conectado: ${socket.id}`);
  logLine(`Cliente conectado: ${socket.id}`);

  socket.write("Bienvenido al chat!\nUsa /nick <nombre> para cambiar tu apodo.\n");
  socket.write("Usa /list para ver los usuarios conectados.\n"); 



  //--------EVENTO DATA------------
  socket.on("data", (data) => {
    try {
      const msg = data.toString().trim();
      if (!msg) return;

      //cambio de nick
      if (msg.startsWith("/nick ")) {
        const newNick = sanitizeNick(msg.slice(6));
        const oldNick = socket.nick;
        socket.nick = newNick;
        socket.write(`Tu nick ahora es '${newNick}'\n`);
        broadcast(`[Servidor]: ${oldNick} ahora es ${newNick}\n`, socket);
        logLine(`${oldNick} cambió su nick a ${newNick}`);
        return;
      }

      // list
      if (msg === "/list") {
        const userList = Array.from(clients)
          .map((c) => c.nick)
          .join(", ");
        socket.write(`Usuarios conectados - (${clients.size}): ${userList}\n`);
        logLine(`${socket.nick} solicitó la lista de usuarios.`);
        return;
      }

      // Mensaje normal
      const line = `[${new Date().toISOString()}] ${socket.nick}: ${msg}\n`;
      broadcast(line, socket);
      logLine(`(${socket.id}) ${socket.nick}: ${msg}`);
    } catch (err) {
      console.error("[ERROR] Procesando mensaje:", err.message);
    }
  });

  //-------------EVENTO END---------------
  socket.on("end", () => {
    clients.delete(socket);
    const leaveMsg = `[Servidor]: ${socket.nick} salió del chat.\n`;
    broadcast(leaveMsg);
    logLine(`${socket.nick} se desconectó (${socket.id})`);
    console.log(`[INFO] Cliente desconectado: ${socket.nick}`);
  });

  // --------------EVENTO ERROR -------------
  socket.on("error", (err) => {
    clients.delete(socket);
    logLine(`[ERROR] ${socket.nick} (${socket.id}): ${err.message}`);
  });
});

//------INICIO SERVIDOR-----
server.listen(PORT, () => {
  console.log(`[OK] Servidor escuchando en el puerto ${PORT}`);
  logLine(`Servidor iniciado en puerto ${PORT}`);
});

// ---------- CIERRE  --------
process.on("SIGINT", () => {
  console.log("\n[INFO] Cerrando servidor...");
  logLine("Servidor detenido manualmente.");
  for (const c of clients) c.destroy();
  logStream.end(() => process.exit(0));
});
