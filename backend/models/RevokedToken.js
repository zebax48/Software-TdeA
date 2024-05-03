//RevokedTokens.js  -> nuevo archivo creado en /models para agregar los token que fueron revocados y que el middleware pueda consultar que token fue revocado para quitar accesos a los usuarios cuando cierren sesion
const mongoose = require('mongoose');

const revokedTokenSchema = new mongoose.Schema({
    token: { type: String, required: true },
    createdAt: { type: Date, default: Date.now, expires: 3600 } // Tokens expirados después de 1 hora
});

const RevokedToken = mongoose.model('RevokedToken', revokedTokenSchema);

module.exports = RevokedToken;