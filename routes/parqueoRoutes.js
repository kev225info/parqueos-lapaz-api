import { Router } from 'express';
import { getParqueos, getFavoritos, toggleFavorito, updateDisponibilidad } from '../controllers/parqueoController.js';

const router = Router();

router.get('/', getParqueos);
router.get('/favoritos/:usuarioId', getFavoritos);
router.post('/favoritos', toggleFavorito);
router.patch('/:parqueoId/disponibilidad', updateDisponibilidad); // <-- NUEVA RUTA

export default router;