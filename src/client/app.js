let ws = null;
let nickActual = null;
let claveAES = null;

async function login() {
    console.log("Login iniciado");
    const nick = document.getElementById("nick").value.trim();
    if (!nick) return alert("Ingresá un nick");

    nickActual = nick;

    // IMPORTA CLAVE COMPARTIDA
    claveAES = await obtenerClave();

    ws = new WebSocket("ws://localhost:3000");

    ws.onopen = async () => {
        document.getElementById("login").style.display = "none";
        document.getElementById("chat").style.display = "block";

        const msg = `${nickActual} se conectó`;
        const cifrado = await cifrar(claveAES, msg);
        ws.send(cifrado);
    };

    ws.onmessage = async (event) => {
        const desc = await descifrar(claveAES, event.data);

        const box = document.getElementById("mensajes");
        const div = document.createElement("div");
        div.textContent = desc;
        box.appendChild(div);
        box.scrollTop = box.scrollHeight;
    };

    ws.onclose = () => {
        alert("Conexión cerrada");
        location.reload();
    };

    ws.onerror = () => console.error("Error en WebSocket");
}

async function enviar() {
    const texto = document.getElementById("msg").value.trim();
    if (!texto) return;

    const msg = `${nickActual}: ${texto}`;
    const cifrado = await cifrar(claveAES, msg);

    ws.send(cifrado);
    document.getElementById("msg").value = "";
}
