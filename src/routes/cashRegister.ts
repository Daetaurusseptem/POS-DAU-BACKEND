
import express from 'express';
import { openCashRegister, closeCashRegister, getCashRegisters, hasOpenCashRegister, getOpenCashRegister, getOpenCashRegisterWithSales, getSalesByCashRegister, getUserCashRegistersByStartDate } from '../controllers/CashRegisterController';
import { verifyToken } from '../middleware/jwtMiddleware';

const router = express.Router();

//ABRIR CAJA
router.post('/open',verifyToken, openCashRegister);

//CERRAR CAJA
router.post('/close/:id', closeCashRegister);

//OBTENER CAJAS CAJA
router.get('/', getCashRegisters);

//OBTENER CAJAS CAJA
router.get('/has-open/:userId', hasOpenCashRegister);


router.get('/open/:userId', getOpenCashRegister);

// Obtener la caja abierta con ventas
router.get('/open-with-sales/:userId', verifyToken, getOpenCashRegisterWithSales);


// Ruta para obtener las cajas abiertas de un usuario filtradas por fecha
router.get('/user/:userId', getUserCashRegistersByStartDate);



export default router;