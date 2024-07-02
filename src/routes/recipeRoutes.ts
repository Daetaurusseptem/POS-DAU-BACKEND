import express from 'express';
import { createRecipe, getRecipes, consumeIngredients } from '../controllers/recipeController';

const router = express.Router();

router.post('/', createRecipe);
router.get('/', getRecipes);
router.post('/consume', consumeIngredients);

export default router;
