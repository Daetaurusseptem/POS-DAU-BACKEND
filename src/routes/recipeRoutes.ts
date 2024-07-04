import express from 'express';
import { createRecipe, getRecipes, consumeIngredients } from '../controllers/recipeController';
import { deleteRecipe, getByIdRecipes, getCompanyRecipes } from '../controllers/recipesController';

const router = express.Router();

router.post('/:companyId', createRecipe);
router.delete('/:recipeId', deleteRecipe);
router.get('/:companyId', getCompanyRecipes);
router.get('/recipe/:recipeId', getByIdRecipes);
router.get('/', getRecipes);
router.post('/consume', consumeIngredients);

export default router;
