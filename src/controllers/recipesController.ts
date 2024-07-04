import { Request, Response } from 'express';
import Product from '../models-mongoose/Products';

import { subirArchivo } from '../controllers/fileupload';
import Recipe from '../models-mongoose/recipes';
import Empresa from '../models-mongoose/Company';

//crear nueva receta
export const createRecipe = async (req: Request, res: Response) => {
    const {companyId} = req.params;
    try {

        req.body.recipe = companyId;

        const newRecipe= new Recipe(req.body);
        
        const savedRecipe = await newRecipe.save();
        


        return res.status(201).json(
            {
                ok:true,
                Recipe: savedRecipe
            });
    } catch (error) {
        return res.status(400).json({ message: error });
    }
};

export const getAllRecipes = async (req: Request, res: Response) => {
    try {
        const recipes = await Recipe.find()
        res.status(200).json({ok:true, recipes: recipes});
    } catch (error) {
        res.status(500).json({ message:error });
    }
    
};

export const getCompanyRecipes =async (req: Request, res: Response) => {
    try{
        const companyId = req.params.companyId;
        const company = await Empresa.findById(companyId);
        if(!company){
            return res.status(404).json ({ok:false, message: 'Esa compañia no existe'});
        }
        const recipes = await Recipe.find({company:companyId});
        res.status(200).json({ok:true, recipes: recipes});

    }catch (error) {
        res.status(500).json({ message:error });
    }
};

export const getByIdRecipes =async (req: Request, res: Response) => {
    try{
        const recipe = await Recipe.findById(req.params.recipeId);
        if (!recipe) {
            return res.status(200).json({ ok:false, message: 'Receta inexistente' });
        }

        return res.status(200).json({ ok:true, recipe: recipe});

    }catch (error) {
        res.status(500).json({ message:error });
    }
};

// Eliminar una Receta
export const deleteRecipe = async (req: Request, res: Response) => {
    try {
        const RecipeDb = await Recipe.findById(req.params.recipeId);
        
        if (!RecipeDb) {
            return res.status(404).json({ ok:false,message: 'Receta no encontrada' });
        }

        const deletedRecipe = await Recipe.findByIdAndDelete(req.params.recipeId);

        res.status(200).json({ message: 'Receta eliminada', deletedRecipe });
    } catch (error) {
        res.status(500).json({ message: error });
    }
};

// Actualizar una receta
export const updateRecipe = async (req: Request, res: Response) => {
    try {
        console.log(req.body);
        const updatedRecipe = await Recipe.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!updateRecipe) return res.status(404).json({ message: 'Receta no encontrada' });
        res.status(200).json(updateRecipe);
    } catch (error) {
        res.status(400).json({ message: error });
    }
};