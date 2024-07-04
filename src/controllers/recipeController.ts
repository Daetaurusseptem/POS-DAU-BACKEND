import { Request, Response } from 'express';
import Recipe from '../models-mongoose/recipes';
import Ingredient from '../models-mongoose/Ingredient';

export const createRecipe = async (req: Request, res: Response) => {
  try {
    const {companyId} = req.params;
    req.body.company = companyId;
    const recipe = new Recipe(req.body);
    await recipe.save();
    res.status(201).json(recipe);
  } catch (error) {
    res.status(500).json({ message: 'Error creating recipe', error });
  }
};

export const getRecipes = async (req: Request, res: Response) => {
  try {
    const recipes = await Recipe.find().populate('ingredients.ingredient');
    res.status(200).json(recipes);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching recipes', error });
  }
};

export const consumeIngredients = async (req: Request, res: Response) => {
  try {
    const { recipeId, quantity } = req.body;

    const recipe = await Recipe.findById(recipeId).populate('ingredients.ingredient');
    if (!recipe) {
      return res.status(404).json({ message: 'Recipe not found' });
    }

    for (const recipeIngredient of recipe.ingredients) {
      const ingredient = await Ingredient.findById(recipeIngredient.ingredient._id);
      if (ingredient) {
        ingredient.quantity -= recipeIngredient.quantity * quantity;
        if (ingredient.quantity < 0) {
          return res.status(400).json({ message: `Not enough ${ingredient.name} in stock` });
        }
        await ingredient.save();
      }
    }

    res.status(200).json({ message: 'Ingredients consumed successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error consuming ingredients', error });
  }
};
