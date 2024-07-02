import express from 'express';
import { createIngredient, getIngredients } from '../controllers/ingredientController';

const router = express.Router();

router.post('/', createIngredient);
router.get('/', getIngredients);

export default router;
