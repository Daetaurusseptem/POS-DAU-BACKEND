// src/routes/ItemRoutes.ts

import express from 'express';
import {
  createItem,
  deleteItem,
  getAllCompanyItems,
  getAllCompanyItemsPagination,
  getAllItems,
  getItemById,
  getItems,
  getItemsByCategory,
  updateItem,
  getAllItemsOfCompanyForSysadmin
} from '../controllers/itemsController';
import { validarEmpresaUsuario, validarUserCompany, verifyToken, validarSysAdmin, validarAdminOrSysAdmin } from '../middleware/jwtMiddleware';
import { getAllNonAdminUsersOfCompany } from '../controllers/users';

const router = express.Router();

router.post('/:empresaId', createItem);
router.get('/:empresaId', verifyToken, validarEmpresaUsuario, getItems);
router.get('/', getAllItems);
router.get('/company/:companyId', verifyToken, getAllCompanyItemsPagination);
router.get('/company/:adminId', [verifyToken, validarAdminOrSysAdmin], getAllNonAdminUsersOfCompany);
router.get('/item/:id', getItemById);
router.put('/:id', updateItem);
router.delete('/:id', deleteItem);
router.get('/by-category/:companyId', [verifyToken], getItemsByCategory);

export default router;
