const crypto = require("crypto");

const AES_KEY = "12345678901234567890123456789012"; // 32 bytes
const AES_IV  = "1234567890123456";                 // 16 bytes

function cifrar(texto) {
    const cipher = crypto.createCipheriv("aes-256-cbc", AES_KEY, AES_IV);
    let encrypted = cipher.update(texto, "utf8", "hex");
    encrypted += cipher.final("hex");
    return encrypted;
}

function descifrar(encrypted) {
    const decipher = crypto.createDecipheriv("aes-256-cbc", AES_KEY, AES_IV);
    let decrypted = decipher.update(encrypted, "hex", "utf8");
    decrypted += decipher.final("utf8");
    return decrypted;
}

module.exports = { cifrar, descifrar };
