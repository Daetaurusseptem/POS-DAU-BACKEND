import express from 'express';
import {
  createProduct,
  deleteProduct,
  getAllCompanyProducts,
  getAllProducts,
  getProductById,
  searchProducts,
  updateProduct,
  getAllProductsOfCompanyForSysadmin // Nueva función importada
} from '../controllers/products';

import { validarSysAdmin, verifyToken } from '../middleware/jwtMiddleware'; // Asegúrate de importar los middlewares necesarios

const router = express.Router();

router.post('/:companyId', createProduct);
router.get('/', getAllProducts);
router.get('/company/:id', getAllCompanyProducts);
router.get('/company/sysadmin/:companyId', [verifyToken, validarSysAdmin], getAllProductsOfCompanyForSysadmin); // Nueva ruta
router.get('/:id', getProductById);
router.put('/:id', updateProduct);
router.delete('/:id', deleteProduct);
router.get('/search/:empresaId', searchProducts);

export default router;
