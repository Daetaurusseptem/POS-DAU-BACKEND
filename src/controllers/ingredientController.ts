import { Request, Response } from 'express';
import Ingredient from '../models-mongoose/Ingredient';

export const createIngredient = async (req: Request, res: Response) => {
  try {
    const ingredient = new Ingredient(req.body);
    await ingredient.save();
    res.status(201).json(ingredient);
  } catch (error) {
    res.status(500).json({ message: 'Error creating ingredient', error});
  }
};

export const getIngredients = async (req: Request, res: Response) => {
  try {
    const ingredients = await Ingredient.find();
    res.status(200).json(ingredients);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching ingredients', error });
  }
};
