let ws = null;
let nickActual = null;

function login() {
    const nick = document.getElementById("nick").value.trim();
    if (!nick) return alert("Ingresá un nick");

    nickActual = nick;

    ws = new WebSocket("ws://localhost:3000");

    ws.onopen = () => {
        document.getElementById("login").style.display = "none";
        document.getElementById("chat").style.display = "block";

        ws.send(JSON.stringify({
            type: "system",
            msg: `${nickActual} se conectó`
        }));
    };

    ws.onmessage = (event) => {
        const data = event.data;
        const box = document.getElementById("mensajes");

        const div = document.createElement("div");
        div.textContent = data;
        box.appendChild(div);
        box.scrollTop = box.scrollHeight;
    };

    ws.onclose = () => {
        alert("Conexión cerrada");
        location.reload();
    };

    ws.onerror = () => console.error("Error en WebSocket");
}

function enviar() {
    const texto = document.getElementById("msg").value.trim();
    if (!texto) return;

    ws.send(`${nickActual}: ${texto}`);
    document.getElementById("msg").value = "";
}
