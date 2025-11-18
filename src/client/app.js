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

    ws.send(JSON.stringify({ tipo: "nick", nick: nickActual }));

    const msg = `${nickActual} se conectó`;
    const cifrado = await cifrar(claveAES, msg);
    ws.send(cifrado);
};

    ws.onmessage = async (event) => {
        try {
        const obj = JSON.parse(event.data);

        if (obj.tipo === "usuarios") {
            const box = document.getElementById("listaUsuarios");
            box.innerHTML = "<b>Usuarios conectados:</b><br>" + obj.data.join("<br>");
            return; 
        }
    } catch(e) {
        console.log(e);
    }

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


function pedirUsuarios() {
    ws.send(JSON.stringify({ tipo: "listar" }));
}

function cambiarNick() {
    const nuevo = document.getElementById("nuevoNick").value.trim();
    if (!nuevo) return alert("Ingresá un nuevo nick");

    ws.send(JSON.stringify({ tipo: "cambiar-nick", nuevo }));

    const viejo = nickActual;
    nickActual = nuevo;

    enviar(agregarMensajeAlChat(`${viejo}, cambiaste tu nick, tu nuevo nick es :${nuevo}`));
    const aviso = `${viejo} ahora es ${nuevo}`;
    cifrar(claveAES, aviso).then(cifrado => ws.send(cifrado));

}

function agregarMensajeAlChat(texto) {
    const box = document.getElementById("mensajes");
    const div = document.createElement("div");
    div.textContent = texto;
    div.style.fontStyle = "italic";
    box.appendChild(div);
    box.scrollTop = box.scrollHeight;
}

