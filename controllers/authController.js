import pool from '../config/db.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { OAuth2Client } from 'google-auth-library';

// LOGIN CON GOOGLE
export const googleLogin = async (req, res) => {
    const { idToken } = req.body;
    if (!idToken) return res.status(400).json({ mensaje: 'Token de Google requerido' });

    try {
        const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID_WEB);
        
        // 1. Verificar el token con Google
        const ticket = await client.verifyIdToken({
            idToken,
            audience: process.env.GOOGLE_CLIENT_ID_WEB,
        });
        
        const payload = ticket.getPayload();
        const email = payload.email;
        const nombre = payload.name;
        const foto = payload.picture;

        // 2. Buscar si el usuario ya existe en la BD
        const [users] = await pool.query('SELECT * FROM usuarios WHERE email = ?', [email]);
        let user;

        if (users.length === 0) {
            // 3. Si no existe, crearlo automáticamente (con contraseña aleatoria)
            const randomPassword = Math.random().toString(36).slice(-10);
            const hashedPassword = await bcrypt.hash(randomPassword, 10);
            
            const [result] = await pool.query(
                'INSERT INTO usuarios (nombre, email, password, rol) VALUES (?, ?, ?, ?)',
                [nombre, email, hashedPassword, 'conductor']
            );
            user = { id: result.insertId, nombre, email, rol: 'conductor' };
        } else {
            user = users[0];
        }

        // 4. Generar nuestro JWT
        const token = jwt.sign(
            { id: user.id, rol: user.rol },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.json({ 
            mensaje: 'Login con Google exitoso', 
            token, 
            usuario: { id: user.id, nombre: user.nombre, rol: user.rol, foto } 
        });

    } catch (error) {
        console.error('Error Google Login:', error);
        res.status(401).json({ mensaje: 'Token de Google inválido o expirado' });
    }
};
// REGISTRAR USUARIO
export const register = async (req, res) => {
    const { nombre, email, telefono, password, rol } = req.body;
    try {
        // Verificar si el email ya existe
        const [existing] = await pool.query('SELECT id FROM usuarios WHERE email = ?', [email]);
        if (existing.length > 0) {
            return res.status(400).json({ mensaje: 'El correo ya está registrado' });
        }

        // Encriptar contraseña
        const hashedPassword = await bcrypt.hash(password, 10);

        const [result] = await pool.query(
            'INSERT INTO usuarios (nombre, email, telefono, password, rol) VALUES (?, ?, ?, ?, ?)',
            [nombre, email, telefono, hashedPassword, rol || 'conductor']
        );

        res.status(201).json({ mensaje: 'Usuario registrado exitosamente', id: result.insertId });
    } catch (error) {
        console.error(error);
        res.status(500).json({ mensaje: 'Error en el servidor' });
    }
};

// INICIAR SESIÓN
export const login = async (req, res) => {
    const { email, password } = req.body;
    try {
        const [users] = await pool.query('SELECT * FROM usuarios WHERE email = ?', [email]);
        if (users.length === 0) {
            return res.status(401).json({ mensaje: 'Credenciales incorrectas' });
        }

        const user = users[0];
        
        // NOTA: Los usuarios de prueba insertados en la Fase 5 tienen contraseñas en texto plano.
        // Para que el login funcione con ellos, comparamos directamente. 
        // Para usuarios nuevos registrados por la API, usamos bcrypt.
        let isValidPassword = false;
        if (user.password.startsWith('$2a$')) {
            isValidPassword = await bcrypt.compare(password, user.password);
        } else {
            isValidPassword = (password === user.password); // Solo para datos de prueba iniciales
        }

        if (!isValidPassword) {
            return res.status(401).json({ mensaje: 'Credenciales incorrectas' });
        }

        // Generar Token JWT
        const token = jwt.sign(
            { id: user.id, rol: user.rol },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.json({ 
            mensaje: 'Login exitoso', 
            token, 
            usuario: { id: user.id, nombre: user.nombre, rol: user.rol } 
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ mensaje: 'Error en el servidor' });
    }
};
