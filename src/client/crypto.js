// --- CLAVE AES COMPARTIDA PARA TODOS ---
// (Base64 de 32 bytes = AES-256)
const CLAVE_BASE64 = "AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA=";

// Convierte base64 → ArrayBuffer
function b64a(base64) {
    return Uint8Array.from(atob(base64), c => c.charCodeAt(0)).buffer;
}

// Convierte ArrayBuffer → base64
function ab64(buffer) {
    return btoa(String.fromCharCode(...new Uint8Array(buffer)));
}

// Importa la clave AES fija
async function obtenerClave() {
    return await crypto.subtle.importKey(
        "raw",
        b64a(CLAVE_BASE64), 
        { name: "AES-GCM" },
        false,
        ["encrypt", "decrypt"]
    );
}

// Cifra texto plano
async function cifrar(clave, texto) {
    const enc = new TextEncoder().encode(texto);
    const iv = crypto.getRandomValues(new Uint8Array(12));

    const cifrado = await crypto.subtle.encrypt(
        { name: "AES-GCM", iv },
        clave,
        enc
    );

    return JSON.stringify({
        iv: ab64(iv),
        data: ab64(cifrado)
    });
}

// Descifra JSON cifrado
async function descifrar(clave, json) {
    try {
        const obj = JSON.parse(json);
        const iv = b64a(obj.iv);
        const data = b64a(obj.data);

        const descifrado = await crypto.subtle.decrypt(
            { name: "AES-GCM", iv },
            clave,
            data
        );

        return new TextDecoder().decode(descifrado);
    } catch (e) {
        return "[mensaje no descifrable]";
    }
}
