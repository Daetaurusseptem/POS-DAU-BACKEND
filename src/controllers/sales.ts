// src/controllers/saleController.ts

import { Request, Response } from 'express';
import Sale from '../models-mongoose/Sales';
import CashRegister from '../models-mongoose/CashRegister';
import Item from '../models-mongoose/Item';
import recipes from '../models-mongoose/recipes';
import Ingredient from '../models-mongoose/Ingredient';
import User from '../models-mongoose/User';



// Obtener todas las ventas
export const getAllSales = async (req: Request, res: Response) => {
    try {
        const sales = await Sale.find().populate('user').populate('productsSold.productId');
        res.status(200).json(sales);
    } catch (error) {
        res.status(500).json({ message: error });
    }
};

// Obtener una venta por ID
export const getSaleById = async (req: Request, res: Response) => {
    try {
        const sale = await Sale.findById(req.params.id).populate('user').populate('productsSold.productId');
        if (!sale) return res.status(404).json({ message: 'Venta no encontrada' });
        res.status(200).json(sale);
    } catch (error) {
        res.status(500).json({ message: error });
    }
};


const deductStockForSimpleItem = async (itemId: string, quantity: number) => {
  console.log(itemId, quantity);
  const item = await Item.findById(itemId);
  if (!item) throw new Error('Item not found');

  item.stock -= quantity;
  if (item.stock < 0) throw new Error(`Not enough stock for item ${item.name}`);
  await item.save();
};

const deductIngredientsForCompositeItem = async (recipeId: string, quantity: number) => {
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

const processSale = async (productsSold: any[]) => {
  console.log(productsSold);
  for (const productSold of productsSold) {
    const item = await Item.findById(productSold._id).populate('product');
    if (!item) throw new Error('Item not found');

    if (item.product.isComposite) {
      if (!item.product.recipe) throw new Error('Composite product does not have a recipe');
      await deductIngredientsForCompositeItem(item.product.recipe, productSold.quantity);
    } else {
      await deductStockForSimpleItem(item._id, productSold.quantity);
    }
  }
};

export const createSale = async (req: Request, res: Response) => {
  try {
    const { user, total, discount, productsSold, paymentMethod } = req.body;
    console.log(user, total, discount, productsSold, paymentMethod);
    // Obtener la caja abierta del usuario
    const cashRegister = await CashRegister.findOne({ user, closed: false });
    if (!cashRegister) {
      return res.status(400).json({ message: 'No open cash register found for this user' });
    }

    // Obtener el usuario y la compañía
    const userDoc = await User.findById(user).populate('companyId');
    if (!userDoc) {
      return res.status(404).json({ message: 'User not found' });
    }

    const companyId = userDoc.companyId;
    if (!companyId) {
      return res.status(400).json({ message: 'User does not belong to any company' });
    }
    console.log(companyId);

    // Procesar la venta y actualizar el inventario
    await processSale(productsSold);

    // Crear una nueva venta
    const newSale = new Sale({
      user,
      total,
      discount,
      productsSold,
      date: new Date(),
      paymentMethod,
      company: companyId
    });

    const savedSale = await newSale.save();

    // Actualizar los pagos en la caja
    let cashTotal = 0;
    let creditTotal = 0;
    let debitTotal = 0;

    productsSold.forEach((product: any) => {
      const subtotal = parseFloat(product.subtotal); // Asegurar que subtotal es un número
      switch (paymentMethod) {
        case 'cash':
          cashTotal += subtotal;
          break;
        case 'credit':
          creditTotal += subtotal;
          break;
        case 'debit':
          debitTotal += subtotal;
          break;
        default:
          return res.status(400).json({ message: 'Invalid payment method' });
      }
    });

    // Asegurar que los valores son numéricos antes de sumarlos
    cashRegister.payments.cash += cashTotal;
    cashRegister.payments.credit += creditTotal;
    cashRegister.payments.debit += debitTotal;

    // Agregar la venta a la caja
    cashRegister.sales.push(savedSale._id);

    await cashRegister.save();

    return res.status(201).json(savedSale);
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: 'Error creating sale', error });
  }
};

