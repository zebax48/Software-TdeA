const express = require('express');
const multer = require('multer');
const path = require('path');

const { 
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
    deleteStudentFromPrueba,
    deletePrueba
} = require('../controllers/pruebaController');

const router = express.Router();

// Configuración de multer
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({ storage: storage });

// Ruta para crear una nueva prueba
router.post('/create-prueba', createPrueba);

// Ruta para obtener todos las pruebas
router.get('/', getAllPruebas)

// Ruta para obtener prueba por Id
router.get('/:pruebaId', getPruebaById)

// Ruta para actualizar prueba
router.put('/update/:pruebaId', updatePrueba)

// Ruta para importar estudiantes desde un archivo Excel
router.post('/import-students/:pruebaId', upload.single('file'), importStudentsToPrueba);

// Ruta para importar estudiantes con nota desde un archivo Excel
router.post('/import-students-grades/:pruebaId', upload.single('file'), loadStudentsWithGradesToPrueba);

// Ruta para asignar notas a los estudiantes de una prueba
router.post('/assign-grades', assignGradesToStudents);

// Ruta para actualizar un estudiante
router.put('/:pruebaId/estudiantes/:estudianteId', updateStudentInPrueba);

// Ruta para eliminar un estudiante
router.delete('/:pruebaId/estudiantes/:estudianteId', deleteStudentFromPrueba);

// Ruta para probar la lectura del archivo Excel
router.post('/test-read-excel', upload.single('file'), testReadExcel);

// Ruta para obtener los promedios de los resultados de aprendizaje de un programa
router.get('/promedios/:programId', getPromediosPorPrograma);

// Ruta para eliminar una prueba
router.delete('/delete/:pruebaId', deletePrueba)

module.exports = router;