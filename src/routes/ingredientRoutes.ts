import express from 'express';
import { createIngredient, deleteIngredient, getIngredientByCompanyId, getIngredientById, getIngredients, updateIngredient } from '../controllers/ingredientController';
import { validarAdminCompany, verifyToken } from '../middleware/jwtMiddleware';

const router = express.Router();
// Ruta para crear un nuevo ingrediente
router.post('/', createIngredient);

// Ruta para obtener todos los ingredientes
router.get('/', getIngredients);

// Ruta para obtener un ingrediente por ID
router.get('/:id', getIngredientById);

router.get('/company/:companyId',[ verifyToken, validarAdminCompany ], getIngredientByCompanyId);

// Ruta para actualizar un ingrediente por ID
router.put('/:id', updateIngredient);

// Ruta para eliminar un ingrediente por ID
router.delete('/:id', deleteIngredient); 
 

export default router;
