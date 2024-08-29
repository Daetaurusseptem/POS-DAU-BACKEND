import express from 'express';
import { createSale, getAllSales, getSaleById } from '../controllers/sales';
import { validarAdmin, validarEmpresaUsuario, verifyToken } from '../middleware/jwtMiddleware';
import { getSalesByCashRegister } from '../controllers/CashRegisterController';


const router = express.Router();

router.post('/',verifyToken, createSale);
router.get('/', getAllSales);
router.get('/:id',[verifyToken], getSaleById);
router.get('/cash-register/:cashRegisterId', getSalesByCashRegister);
export default router;