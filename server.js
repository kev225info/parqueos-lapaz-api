import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/authRoutes.js';
import parqueoRoutes from './routes/parqueoRoutes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Configuración de CORS para producción
app.use(cors({
    origin: '*', // Permite peticiones desde cualquier origen (tu app Android)
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

// Rutas
app.use('/api/auth', authRoutes);
app.use('/api/parqueos', parqueoRoutes);

// Health check
app.get('/', (req, res) => {
    res.json({ 
        mensaje: 'API de Parqueos La Paz - Servidor en Producción 🚀',
        version: '1.0.0',
        timestamp: new Date().toISOString()
    });
});

// Manejo de errores 404
app.use((req, res) => {
    res.status(404).json({ error: 'Ruta no encontrada' });
});

// Iniciar servidor
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Servidor corriendo en puerto ${PORT}`);
    console.log(`Entorno: ${process.env.NODE_ENV || 'development'}`);
});

import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/authRoutes.js';
import parqueoRoutes from './routes/parqueoRoutes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(cors()); // Permite peticiones desde Android
app.use(express.json()); // Permite leer JSON en el body

// Rutas
app.use('/api/auth', authRoutes);
app.use('/api/parqueos', parqueoRoutes);

// Ruta de prueba (Health Check)
app.get('/', (req, res) => {
    res.json({ mensaje: 'API de Parqueos La Paz funcionando correctamente 🚀' });
});

// Iniciar servidor
app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});