// models/Prueba.js
const mongoose = require('mongoose');

const estudianteSchema = new mongoose.Schema({
    nombre: { type: String, required: true },
    nota: { type: Number, default: null },
});

const pruebaSchema = new mongoose.Schema({
    programa: { type: mongoose.Schema.Types.ObjectId, ref: 'Programa', required: true },
    resultadoAprendizaje: { type: mongoose.Schema.Types.ObjectId, ref: 'ResultadoAprendizaje', required: true },
    usuario: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    descripcion: { type: String, required: true },
    estudiantes: [estudianteSchema],
    semestre: { type: String, required: true },
    promedio: { type: Number, default: 0 },
});

const Prueba = mongoose.model('Prueba', pruebaSchema);

module.exports = Prueba;