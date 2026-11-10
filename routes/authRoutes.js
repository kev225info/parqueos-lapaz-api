import { Router } from 'express';
import { register, login } from '../controllers/authController.js';
import { register, login, googleLogin } from '../controllers/authController.js'; // Asegúrate de importar googleLogin

const router = Router();

router.post('/register', register);
router.post('/login', login);
router.post('/google-login', googleLogin); 
export default router;
