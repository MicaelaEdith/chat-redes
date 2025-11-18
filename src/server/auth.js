const jwt = require("jsonwebtoken");

const JWT_SECRET = "clave23";
function crearToken(nick) {
    return jwt.sign({ nick }, JWT_SECRET, { expiresIn: "1h" });
}

function verificarToken(token) {
    return jwt.verify(token, JWT_SECRET);
}

module.exports = { crearToken, verificarToken };
