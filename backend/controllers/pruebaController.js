const XLSX = require('xlsx');
const Prueba = require('../models/Prueba');
const ResultadoAprendizaje = require('../models/ResultadoAprendizaje');
const Program = require('../models/Program');
const User = require('../models/User');
const fs = require('fs');
const path = require('path');
const xlsx = require('xlsx');

// Crear una nueva prueba
const createPrueba = async (req, res) => {
    const { programId, raId, userId, descripcion } = req.body;

    try {
        const program = await Program.findById(programId);
        if (!program) {
            return res.status(404).json({ message: 'Programa no encontrado' });
        }

        const resultadoAprendizaje = await ResultadoAprendizaje.findById(raId);
        if (!resultadoAprendizaje) {
            return res.status(404).json({ message: 'Resultado de aprendizaje no encontrado' });
        }

        const usuario = await User.findById(userId);
        if (!usuario) {
            return res.status(404).json({ message: 'Usuario no encontrado' });
        }

        const prueba = new Prueba({
            programa: programId,
            resultadoAprendizaje: raId,
            usuario: userId,
            descripcion: descripcion,
            estudiantes: [],
        });

        await prueba.save();

        res.status(201).json({ message: 'Prueba creada exitosamente', prueba });
    } catch (error) {
        console.error('Error al crear la prueba:', error);
        res.status(500).json({ error: 'Error del servidor' });
    }
};

// Función para leer nombres de estudiantes desde un archivo Excel
const readStudentNamesFromExcel = (filePath) => {
    const workbook = xlsx.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const data = xlsx.utils.sheet_to_json(sheet, { header: 1 });

    if (data.length === 0 || data[0][0].toLowerCase() !== 'nombre') {
        throw new Error('El archivo Excel debe tener una columna "nombre" en la primera fila');
    }

    return data.slice(1).map(row => row[0]);
};

// Importar estudiantes desde un archivo Excel a una prueba existente
const importStudentsToPrueba = async (req, res) => {
    const pruebaId = req.params.pruebaId;
    const filePath = req.file.path;

    try {
        const prueba = await Prueba.findById(pruebaId);
        if (!prueba) {
            return res.status(404).json({ message: 'Prueba no encontrada' });
        }

        const studentNames = readStudentNamesFromExcel(filePath);
        const estudiantes = studentNames.map(nombre => ({ nombre }));

        prueba.estudiantes.push(...estudiantes);
        await prueba.save();

        res.status(200).json({ message: 'Estudiantes importados exitosamente', prueba });
    } catch (error) {
        console.error('Error al importar estudiantes:', error);
        if (error.message === 'El archivo Excel debe tener una columna "nombre" en la primera fila') {
            return res.status(400).json({ error: error.message });
        }
        res.status(500).json({ error: 'Error del servidor' });
    }
};

// Importar estudiantes con notas a una prueba
const loadStudentsWithGradesToPrueba = async (req, res) => {
    const { pruebaId } = req.params;
    const filePath = req.file.path;

    try {
        const prueba = await Prueba.findById(pruebaId);
        if (!prueba) {
            return res.status(404).json({ message: 'Prueba no encontrada' });
        }

        const studentData = readStudentDataFromExcel(filePath); // Asume una función que lee nombres y notas del archivo
        const newEstudiantes = studentData.map(data => ({ nombre: data.nombre, nota: data.nota }));

        const nombresExistentes = new Set(prueba.estudiantes.map(est => est.nombre));
        const estudiantesFiltrados = newEstudiantes.filter(est => !nombresExistentes.has(est.nombre));

        if (estudiantesFiltrados.length < newEstudiantes.length) {
            return res.status(400).json({ message: 'No se pueden cargar estudiantes con nombres duplicados' });
        }

        const totalNotas = prueba.estudiantes.reduce((sum, estudiante) => sum + (estudiante.nota || 0), 0);
        const promedio = prueba.estudiantes.length > 0 ? totalNotas / prueba.estudiantes.length : 0;
        prueba.promedio = promedio;

        prueba.estudiantes.push(...estudiantesFiltrados);
        await prueba.save();

        res.status(200).json({ message: 'Estudiantes y notas cargados exitosamente', prueba });
    } catch (error) {
        console.error('Error al cargar estudiantes y notas:', error);
        res.status(500).json({ error: 'Error del servidor' });
    }
};

// Metodo validación excel con estudiantes y notas
const readStudentDataFromExcel = (filePath) => {
    const workbook = xlsx.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const data = xlsx.utils.sheet_to_json(sheet, { header: 1 });

    const headers = data[0];
    if (!headers.includes("nombre") || !headers.includes("nota")) {
        throw new Error("El archivo Excel debe contener las columnas 'nombre' y 'nota'");
    }

    return data.slice(1).map(row => ({
        nombre: row[headers.indexOf("nombre")],
        nota: row[headers.indexOf("nota")]
    }));
};

// Asignar notas a los estudiantes de una prueba
const assignGradesToStudents = async (req, res) => {
    const { pruebaId, notas } = req.body;

    try {
        const prueba = await Prueba.findById(pruebaId);
        if (!prueba) {
            return res.status(404).json({ message: 'Prueba no encontrada' });
        }

        for (let estudiante of prueba.estudiantes) {
            if (notas[estudiante.nombre] !== undefined) {
                const nota = notas[estudiante.nombre];
                if (nota < 0 || nota > 5) {
                    return res.status(400).json({ message: "Verifique que todas las notas ingresadas estén entre 0 y 5" });
                }
                estudiante.nota = nota;
            }
        }

        const totalNotas = prueba.estudiantes.reduce((sum, estudiante) => sum + (estudiante.nota || 0), 0);
        const promedio = prueba.estudiantes.length > 0 ? totalNotas / prueba.estudiantes.length : 0;
        prueba.promedio = promedio;

        await prueba.save();

        res.status(200).json({ message: 'Notas asignadas exitosamente', prueba });
    } catch (error) {
        console.error('Error al asignar notas a los estudiantes:', error);
        res.status(500).json({ error: 'Error del servidor' });
    }
};

// Prueba de lectura archivo excel
const testReadExcel = async (req, res) => {
    try {
        const filePath = req.file.path;
        const workbook = xlsx.readFile(filePath);
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const data = xlsx.utils.sheet_to_json(worksheet);

        res.json(data);
    } catch (error) {
        console.error('Error al leer el archivo Excel:', error);
        res.status(500).json({ error: 'Error al leer el archivo Excel' });
    }
};

// Obtener los promedios de los resultados de aprendizaje de un programa
const getPromediosPorPrograma = async (req, res) => {
    const { programId } = req.params;

    try {
        const pruebas = await Prueba.find({ programa: programId }).populate('resultadoAprendizaje');

        if (pruebas.length === 0) {
            return res.status(404).json({ message: 'No se encontraron pruebas para el programa dado' });
        }

        const promedios = pruebas.map(prueba => ({
            resultadoAprendizaje: prueba.resultadoAprendizaje.nombre,
            promedio: prueba.promedio
        }));

        res.status(200).json({ promedios });
    } catch (error) {
        console.error('Error al obtener promedios:', error);
        res.status(500).json({ error: 'Error del servidor' });
    }
};

//Obtener todos los reultados de aprendizaje con programas relacionados
const getAllPruebas = async (req, res) => {
    try {
        const pruebas = await Prueba.find()
        .populate('usuario')
        .populate('resultadoAprendizaje')
        .populate('programa');
        res.json(pruebas);
    } catch (error) {
        console.error('Error al obtener pruebas:', error.message, error.stack);
        res.status(500).json({ error: 'Error al obtener pruebas' });
    }
};

// Obtener una prueba por su ID
const getPruebaById = async (req, res) => {
    const pruebaId = req.params.pruebaId;

    try {
        const prueba = await Prueba.findById(pruebaId).populate('usuario')
        .populate('resultadoAprendizaje')
        .populate('programa');

        if (!prueba) {
            return res.status(404).json({ message: 'Prueba no encontrada' });
        }

        const totalNotas = prueba.estudiantes.reduce((sum, estudiante) => sum + (estudiante.nota || 0), 0);
        const promedio = prueba.estudiantes.length > 0 ? totalNotas / prueba.estudiantes.length : 0;
        prueba.promedio = promedio;

        res.json(prueba);
    } catch (error) {
        console.error('Error al obtener Prueba:', error);
        res.status(500).json({ error: 'Error al obtener Prueba' });
    }
};

// Actualizar un resultado de aprendizaje por su ID
const updatePrueba = async (req, res) => {
    const { pruebaId } = req.params;
    const { programa, resultadoAprendizaje, usuario, descripcion } = req.body;

    try {
        const prueba = await Prueba.findByIdAndUpdate(
            pruebaId,
            { programa, resultadoAprendizaje, usuario, descripcion },
            { new: true, runValidators: true }
        );

        if (!prueba) {
            return res.status(404).json({ message: 'Prueba no encontrada' });
        }

        res.status(200).json({ message: 'Prueba actualizada exitosamente', prueba });
    } catch (error) {
        console.error('Error al actualizar prueba:', error);
        res.status(500).json({ error: 'Error del servidor' });
    }
};

// Actualizar estudiante de una prueba
const updateStudentInPrueba = async (req, res) => {
    const { pruebaId, estudianteId } = req.params;
    const { nuevoNombre, nuevaNota } = req.body;

    try {
        const prueba = await Prueba.findById(pruebaId);
        if (!prueba) {
            return res.status(404).json({ message: 'Prueba no encontrada' });
        }

        const estudiante = prueba.estudiantes.id(estudianteId);
        if (!estudiante) {
            return res.status(404).json({ message: 'Estudiante no encontrado' });
        }

        if (nuevoNombre) {
            const nombreDuplicado = prueba.estudiantes.some(est => est.nombre === nuevoNombre && est.id !== estudianteId);
            if (nombreDuplicado) {
                return res.status(400).json({ message: 'Ya existe un estudiante con ese nombre' });
            }
            estudiante.nombre = nuevoNombre;
        }

        if (nuevaNota !== undefined) {
            if (nuevaNota < 0 || nuevaNota > 5) {
                return res.status(400).json({ message: 'La nota debe estar entre 0 y 5' });
            }
            estudiante.nota = nuevaNota;
        }

        const totalNotas = prueba.estudiantes.reduce((sum, est) => sum + (est.nota || 0), 0);
        const promedio = prueba.estudiantes.length > 0 ? totalNotas / prueba.estudiantes.length : 0;
        prueba.promedio = promedio;

        await prueba.save();

        res.status(200).json({ message: 'Estudiante actualizado exitosamente', prueba });
    } catch (error) {
        console.error('Error al actualizar estudiante:', error);
        res.status(500).json({ error: 'Error del servidor' });
    }
};

// Eliminar un estudiante de una prueba
const deleteStudentFromPrueba = async (req, res) => {
    const { pruebaId, estudianteId } = req.params;

    try {
        const prueba = await Prueba.findById(pruebaId);
        if (!prueba) {
            return res.status(404).json({ message: 'Prueba no encontrada' });
        }

        const estudiante = prueba.estudiantes.id(estudianteId);
        if (!estudiante) {
            return res.status(404).json({ message: 'Estudiante no encontrado' });
        }

        // Eliminar el estudiante del array
        prueba.estudiantes.pull(estudianteId);

        // Recalcular el promedio
        const totalNotas = prueba.estudiantes.reduce((sum, est) => sum + (est.nota || 0), 0);
        const promedio = prueba.estudiantes.length > 0 ? totalNotas / prueba.estudiantes.length : 0;
        prueba.promedio = promedio;

        await prueba.save();

        res.status(200).json({ message: 'Estudiante eliminado exitosamente', prueba });
    } catch (error) {
        console.error('Error al eliminar estudiante:', error);
        res.status(500).json({ error: 'Error del servidor' });
    }
};

// Eliminar un resultado de aprendizaje por su ID
const deletePrueba = async (req, res) => {
    const { pruebaId } = req.params;

    try {
        const prueba = await Prueba.findByIdAndDelete(pruebaId);
        if (!prueba) {
            return res.status(404).json({ message: 'Prueba no encontrada' });
        }

        res.status(200).json({ message: 'Prueba eliminada exitosamente' });
    } catch (error) {
        console.error('Error al eliminar prueba:', error);
        res.status(500).json({ error: 'Error del servidor' });
    }
};

module.exports = {
    createPrueba,
    importStudentsToPrueba,
    assignGradesToStudents,
    testReadExcel,
    getPromediosPorPrograma,
    getAllPruebas,
    getPruebaById,
    updatePrueba,
    loadStudentsWithGradesToPrueba,
    updateStudentInPrueba,
    deleteStudentFromPrueba
};