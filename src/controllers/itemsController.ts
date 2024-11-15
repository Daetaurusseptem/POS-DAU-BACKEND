// src/controllers/ItemController.ts

import { Request, Response } from 'express';
import Empresa from '../models-mongoose/Company';
import Product from '../models-mongoose/Products';
import Item from '../models-mongoose/Item';
import recipes from '../models-mongoose/recipes';
import Ingredient from '../models-mongoose/Ingredient';


// Crear un nuevo Item
export const createItem = async (req: Request, res: Response) => {
    try {
        
        const product = req.body.product
        const {empresaId} = req.params
        const producto=await Product.findById(product)
        const empresa=await Empresa.findById(empresaId)


        
        
        if(!producto){
            return res.status(404).json({
                ok:false,
                msg:"Producto No Existe"
            });
        }
        if(!empresa){
            return res.status(404).json({
                ok:false,
                msg:"Empresa No Existe"
            });
        }
        
        req.body.company = empresaId
        
        const newItem = new Item(req.body);

        const savedItem = await newItem.save();

        return res.status(201).json({
          ok:true, 
          item:savedItem
        });
    } catch (error) {
         
        return res.status(400).json(error);
    }
};

// Obtener todos los Items
export const getAllItems = async (req: Request, res: Response) => {
    try {
        const Items = await Item.find();
        res.status(200).json(Items);
    } catch (error) {
        res.status(500).json({ message: error });
    }
};
// Obtener todos los Items
export const getAllCompanyItems = async (req: Request, res: Response) => {
    try {
        const {id}=req.params
        const company = await Empresa.findById(id);
        if (!company) return res.status(404).json({ message: 'Compañia no encontrada' });

        const items = await Item.find({company:id});
        res.status(200).json({ok:true, items});
    } catch (error) {
        res.status(500).json({ message: error });
    }
};

// Obtener todos los ítems de una compañía para el sysadmin
export const getAllItemsOfCompanyForSysadmin = async (req: Request, res: Response) => {
  try {
    const { companyId } = req.params;
    
    const company = await Empresa.findById(companyId);
    if (!company) {
      return res.status(404).json({ message: 'Empresa no encontrada' });
    }

    const items = await Item.find({ company: companyId });
    res.status(200).json({ ok: true, items });
  } catch (error) {
    res.status(500).json({ message: error });
  }
};

export const getAllCompanyItemsPagination = async (req: Request, res: Response): Promise<Response> => {
  try {
      // Parámetros de paginación con valores por defecto
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 5;

      // Calcular el desplazamiento
      const skip = (page - 1) * limit;

      // Obtener el companyId desde los parámetros de la solicitud
      const { companyId } = req.params;

      // Verificar si la empresa existe
      const company = await Empresa.findById(companyId);
      if (!company) {
          return res.status(404).json({ message: 'Empresa no existe' });
      }

      // Obtener los items de la empresa con paginación
      const items = await Item.find({ company: companyId })
          .populate('product')
          .skip(skip)
          .limit(limit);

      // Contar el total de documentos para la empresa específica
      const total = await Item.countDocuments({ company: companyId });
      const totalPages = Math.ceil(total / limit);

      // Devolver resultados paginados
      return res.status(200).json({
          totalItems: total,
          totalPages,
          currentPage: page,
          itemsPerPage: limit,
          items,
      });
  } catch (error) {
      console.error('Error al obtener los items de la empresa:', error);
      return res.status(500).json({ error: 'Error al obtener los items de la empresa' });
  }
};


// Obtener un Item por ID
export const getItemById = async (req: Request, res: Response) => {
    try {
        const item = await Item.findById(req.params.id);
        if (!item) {return res.status(404).json({ message: 'Item no encontrado' })};
        
        return res.status(200).json({ok:true, item});
    } catch (error) {
       
        return res.status(500).json({ message: error });
    }
};

// Actualizar un Item
export const updateItem = async (req: Request, res: Response) => {
    try {
        const updatedItem = await Item.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!updatedItem) return res.status(404).json({ message: 'Item no encontrado' });
        res.status(200).json(updatedItem);
    } catch (error) {
        res.status(400).json({ message: error });
    }
};

// Eliminar un Item
export const deleteItem = async (req: Request, res: Response) => {
    try {
        const deletedItem = await Item.findByIdAndDelete(req.params.id);
        if (!deletedItem) return res.status(404).json({ message: 'Item no encontrado' });
        res.status(200).json({ ok:true, message: 'Item eliminado' });
    } catch (error) {
        res.status(500).json({ ok:false,message: error });
    }
};
  

export const getItems = async (req: Request, res: Response) => {
    try { 
      const { empresaId } = req.params;
      const { page = 1, size = 20, name } = req.query;
      const pageNumber = parseInt(page as string, 10) || 1;
      const pageSize = parseInt(size as string, 10) || 20;
      const searchTerm = name ? (name as string) : '';
      
  
      const query = {
        company: empresaId,
        ...(searchTerm && { name: { $regex: new RegExp(searchTerm, 'i') } })
      };
  
      const items = await Item.find(query) 
        .populate('product')
        .skip((pageNumber - 1) * pageSize)
        .limit(pageSize)
        .exec();
  
      const totalItems = await Item.countDocuments(query);
  
      res.json({
        totalItems,
        currentPage: pageNumber,
        totalPages: Math.ceil(totalItems / pageSize),
        items
      });
    } catch (error) {
      res.status(500).json({ message: 'Error retrieving items', error: error });
    }
  };

  export const getItemsByCategory = async (req: Request, res: Response) => {
    try {
      const { companyId } = req.params;
      const { category, search = '', page = 1, limit = 10 } = req.query;
  
      // Validar parámetros obligatorios
      if (!category && !search) {
        return res.status(400).json({ message: 'Either category or search term must be provided' });
      }
  
      if (!companyId) {
        return res.status(400).json({ message: 'Company ID is required' });
      }
  
      // Construir la consulta para buscar productos
      const query: any = {
        company: companyId,
      };
  
      if (category) {
        query.categories = { $in: [category] };
      }
  
      if (search) {
        query.name = { $regex: search, $options: 'i' };
      }
  
      // Buscar productos por categoría, compañía y término de búsqueda
      const products = await Product.find(query);
  
      // Verificar si se encontraron productos
      if (!products.length) {
        return res.status(404).json({ message: 'No products found for the provided filters' });
      }
  
      // Obtener los IDs de los productos encontrados
      const productIds = products.map(product => product._id);
  
      // Calcular el total de ítems disponibles en stock
      const totalItems = await Item.countDocuments({ product: { $in: productIds }, stock: { $gt: 0 }, company: companyId });
  
      if (totalItems === 0) {
        return res.status(404).json({ message: 'No items in stock for the provided filters' });
      }
  
      // Buscar ítems que correspondan a los productos encontrados con paginación
      const items = await Item.find({ product: { $in: productIds }, stock: { $gt: 0 }, company: companyId })
        .populate('product')
        .populate('company')
        .skip((Number(page) - 1) * Number(limit))
        .limit(Number(limit));
  
      res.status(200).json({
        items,
        totalItems,
        totalPages: Math.ceil(totalItems / Number(limit)),
        currentPage: Number(page)
      });
    } catch (error) {
      console.error('Error fetching items:', error);
      res.status(500).json({ message: 'Error fetching items', error });
    }
  };
  
  
  


export const deductStockForSimpleItem = async (itemId: string, quantity: number) => {
  const item = await Item.findById(itemId);
  if (!item) throw new Error('Item not found');

  item.stock -= quantity;
  if (item.stock < 0) throw new Error(`Not enough stock for item ${item.name}`);
  await item.save();
};

export const deductIngredientsForCompositeItem = async (recipeId: string, quantity: number) => {
  const recipe = await recipes.findById(recipeId).populate('ingredients.ingredient');
  if (!recipe) throw new Error('Recipe not found');

  for (const recipeIngredient of recipe.ingredients) {
    const ingredient = await Ingredient.findById(recipeIngredient.ingredient._id);
    if (!ingredient) throw new Error('Ingredient not found');
    
    ingredient.quantity -= recipeIngredient.quantity * quantity;
    if (ingredient.quantity < 0) throw new Error(`Not enough ${ingredient.name} in stock`);
    await ingredient.save();
  }
};

export const processSale = async (saleData: any) => {
  for (const productSold of saleData.productsSold) {
    const item = await Item.findById(productSold.itemId).populate('product');
    if (!item) throw new Error('Item not found');

    if (item.product.isComposite) {
      if (!item.product.recipe) throw new Error('Composite product does not have a recipe');
      await deductIngredientsForCompositeItem(item.product.recipe, productSold.quantity);
    } else {
      await deductStockForSimpleItem(item._id, productSold.quantity);
    }
  }
};



  export default {
    createItem,
    getAllItems,
    getItemById,
    updateItem,
    deleteItem,
    getAllItemsOfCompanyForSysadmin
  };


