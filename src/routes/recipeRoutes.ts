import express from 'express';
import { createRecipe, getAllRecipes, getCompanyRecipes, getByIdRecipes, deleteRecipe, updateRecipe} from '../controllers/recipesController';
import {verifyToken } from '../middleware/jwtMiddleware';

const router = express.Router();

router.post('/',createRecipe);

router.get('/', getAllRecipes);

router.get('/:companyId', getCompanyRecipes);

router.get('/by-Id/:recipesId', getByIdRecipes);

router.delete('/:id', deleteRecipe);

router.put('/:id', updateRecipe);

export default router;