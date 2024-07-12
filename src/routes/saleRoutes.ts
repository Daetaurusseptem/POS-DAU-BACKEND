import express from 'express';
import { createSale, getAllSales, getSaleById } from '../controllers/sales';
import { validarAdmin, validarEmpresaUsuario, verifyToken } from '../middleware/jwtMiddleware';


const router = express.Router();

router.post('/',verifyToken, createSale);
router.get('/', getAllSales);
router.get('/:id',[verifyToken], getSaleById);

export default router;