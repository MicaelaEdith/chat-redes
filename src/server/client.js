//Cliente TCP interactivo para chat

import net from "net";
import readline from "readline";

//-------- CONFIGURACIÓN ---------
const PORT = 7000;
const HOST = "127.0.0.1";
const RECONNECT_DELAY = 2000;



// ------------ INTERFAZ DE CONSOLA ------------
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  prompt: "> ",
});



// ----------- FUNCIÓN PRINCIPAL -------------
function startClient() {
  console.clear();
  console.log(`Conectando al servidor ${HOST}:${PORT}...\n`);

  const socket = net.createConnection({ host: HOST, port: PORT });

  socket.setEncoding("utf8");


  // ------- EVENTO: CONEXIÓN -----------
  socket.on("connect", () => {
    console.log("Conectado al servidor de chat.\n");
    rl.prompt();
  });



  //------- EVENTO: MENSAJE ------
  socket.on("data", (data) => {
    const msg = data.toString().trim();
    if (msg) console.log(`\n${msg}`);
    rl.prompt();
  });

  //  --------- EVENTO: FIN ---------
  socket.on("end", () => {
    console.log("\n Conexión cerrada por el servidor.");
    cleanupAndReconnect(socket);
  });

  //---------- EVENTO: ERROR --------
  socket.on("error", (err) => {
    console.error(`\n[ERROR] ${err.message}`);
    cleanupAndReconnect(socket);
  });

  // --------- EVENTO: LÍNEA DE USUARIO --------
  rl.on("line", (line) => {
    const msg = line.trim();



    // Ignorar líneas vacías
    if (!msg) {
      rl.prompt();
      return;
    }


    // Comando salir
    if (msg === "/quit") {
      console.log("Cerrando cliente...");
      socket.end();
      rl.close();
      return;
    }

    // Comando de ayuda
    if (msg === "/help") {
      console.log(`
                Comandos disponibles:
                /nick <nombre>  - Cambia tu apodo.
                /quit            - Cierra el cliente.
                `);
      rl.prompt();
      return;

    }

    // Enviar al servidor
    try {
      socket.write(msg + "\n");
    } catch (err) {
      console.error("[ERROR] No se pudo enviar mensaje:", err.message);
    }

    rl.prompt();
  });
}

// ------ FUNCIONES AUXILIARES ------
function cleanupAndReconnect(socket) {
  try {
    socket.destroy();
  } catch {}
  console.log(`Reintentando conexión en ${RECONNECT_DELAY / 1000} segundos.\n`);
  setTimeout(startClient, RECONNECT_DELAY);
}

//--- INICIO --------
startClient();
