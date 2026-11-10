import { Router } from 'express';
import { register, login } from '../controllers/authController.js';
import { register, login, googleLogin } from '../controllers/authController.js'; // Asegúrate de importar googleLogin

const router = Router();

router.post('/register', register);
router.post('/login', login);
// ... rutas existentes ...
router.post('/google-login', googleLogin); // NUEVA RUTA
export default router;
