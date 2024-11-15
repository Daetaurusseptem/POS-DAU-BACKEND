import { Request, Response } from 'express';
import Ingredient from '../models-mongoose/Ingredient';
import Empresa from '../models-mongoose/Company';

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
    res.status(500).json({
         message: 'Error fetching ingredients', error
        });
  }
};

export const getIngredientByCompanyId = async (req: Request, res: Response) => {
    try {
      const { companyId } = req.params;
      const company = await Empresa.findById(companyId)

      if (!company) {
        return res.status(404).json({ message: 'Company not found' });
      }

      
      const ingredients = await Ingredient.find({ company: companyId })

      res.status(200).json({ok:true, ingredients});
    } catch (error) {
      res.status(500).json({ message: 'Error fetching ingredients', error });
    }
  };
  
  // Obtener un ingrediente por ID
  export const getIngredientById = async (req: Request, res: Response) => {
    try {
      const ingredient = await Ingredient.findById(req.params.id);
      if (!ingredient) {
        return res.status(404).json({ message: 'Ingredient not found' });
      }
      res.status(200).json({ok:true,ingredient});
    } catch (error) {
      res.status(500).json({ message: 'Error fetching ingredient', error });
    }
  };
  
  // Actualizar un ingrediente por ID
  export const updateIngredient = async (req: Request, res: Response) => {
    try {
      const ingredient = await Ingredient.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
      if (!ingredient) {
        return res.status(404).json({ message: 'Ingredient not found' });
      }
      res.status(200).json(ingredient);
    } catch (error) {
      res.status(500).json({ message: 'Error updating ingredient', error });
    }
  };
  
  // Eliminar un ingrediente por ID
  export const deleteIngredient = async (req: Request, res: Response) => {
    try {
      const ingredient = await Ingredient.findByIdAndDelete(req.params.id);
      if (!ingredient) {
        return res.status(404).json({ message: 'Ingredient not found' });
      }
      res.status(200).json({ message: 'Ingredient deleted successfully' });
    } catch (error) {
      res.status(500).json({ message: 'Error deleting ingredient', error });
    }
  };
  
