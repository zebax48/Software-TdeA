//server.js
const express = require('express');
const mongoose = require('mongoose');
const userRoutes = require('./routes/userRoutes');
const programRoutes = require('./routes/programRoutes');
const User = require('./models/User'); // Importar el modelo de usuario
const Program = require('./models/Program');
const app = express();
const PORT = process.env.PORT || 5000;

// Conectar a la base de datos
mongoose.connect('mongodb://localhost:27017/tecnologico_antioquia', {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(() => console.log('MongoDB connected'))
.catch(err => console.error('MongoDB connection error:', err));

// Analizar en JSON y convertir a req.body
app.use(express.json());

// Usar las rutas de usuario
app.use('/api/users', userRoutes);

//Usar las rutas de programas
app.use('/api/programs', programRoutes);

// Ruta de prueba
app.get('/', (req, res) => {
    res.send('Hello from Express!');
});

// Ruta GET para obtener un usuario por su nombre de usuario
app.get('/api/users/:username', async (req, res) => {
    const username = req.params.username;

    try {
        // Buscar el usuario por su nombre de usuario en la base de datos
        const user = await User.findOne({ username });

        // Verificar si se encontró el usuario
        if (!user) {
            return res.status(404).json({ message: 'Usuario no encontrado' });
        }

        // Enviar el usuario como respuesta
        res.json(user);
    } catch (error) {
        console.error('Error al obtener usuario:', error);
        res.status(500).json({ error: 'Error al obtener usuario' });
    }
});

// Iniciar el servidor
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});