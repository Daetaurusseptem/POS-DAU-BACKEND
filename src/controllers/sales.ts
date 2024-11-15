// src/controllers/saleController.ts

import { Request, Response } from 'express';
import Sale from '../models-mongoose/Sales';
import CashRegister from '../models-mongoose/CashRegister';
import Item from '../models-mongoose/Item';
import recipes from '../models-mongoose/recipes';
import Ingredient from '../models-mongoose/Ingredient';
import User from '../models-mongoose/User';
import Product from '../models-mongoose/Products'; // Importar el modelo Product para acceder a sus campos
import { Types } from 'mongoose';

// Obtener todas las ventas
export const getAllSales = async (req: Request, res: Response) => {
  try {
      const sales = await Sale.find().populate('user').populate('productsSold.product');
      res.status(200).json(sales);
  } catch (error) {
      res.status(500).json({ message: error });
  } 
};


// Obtener una venta por ID
export const getSaleById = async (req: Request, res: Response) => {
  try {
      const sale = await Sale.findById(req.params.id).populate('user').populate('productsSold.product');
      if (!sale) return res.status(404).json({ message: 'Venta no encontrada' });
      res.status(200).json({ ok: true, sale });
  } catch (error) {
      res.status(500).json({ message: error });
  }
};

// Función para deducir el stock de un ítem simple
const deductStockForSimpleItem = async (itemId: string, quantity: number) => {
  const item = await Item.findById(itemId);
  if (!item) throw new Error('Item not found aca');
  item.stock -= quantity;
  if (item.stock < 0) throw new Error(`Not enough stock for item ${item.name}`);
  await item.save();
};  

// Función para deducir ingredientes para un ítem compuesto

// Función para deducir ingredientes para un ítem compuesto
const deductIngredientsForCompositeItem = async (recipeId: any, quantity: number) => {
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


// Procesar la venta y actualizar el inventario
const processSale = async (productsSold: any[]) => {
  for (const productSold of productsSold) {
    // Utilizar el ID del producto que ahora se garantiza que estará presente
    const item = await Item.findOne({product:productSold.product}).populate('product');
    if (!item) throw new Error('Item not found qui');
    
    
    // Buscar el producto para verificar si es compuesto
    const product = await Product.findById(item.product._id);
    if (!product) throw new Error('Product not found');

    // Verificar si el producto es compuesto y deducir los ingredientes si es necesario
    if (product.isComposite) { 
      if (!product.recipe) throw new Error('Composite product does not have a recipe');
      await deductIngredientsForCompositeItem(product.recipe, productSold.quantity);
    } else {
      // Deducir el stock del ítem simple 
      await deductStockForSimpleItem(item._id.toString(), productSold.quantity);
    }
  }
};
 

// Crear una venta
export const createSale = async (req: Request, res: Response) => {
  try {
    const { user, total, discount, productsSold, paymentMethod, receivedAmount, change, paymentReference } = req.body;

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

    // Procesar la venta y actualizar el inventario
    await processSale(productsSold);

    // Crear una nueva venta con los datos proporcionados
    const newSaleData: any = {
      user,
      total,
      discount,
      productsSold: productsSold.map((product: any) => {
        // Calcular el subtotal del producto considerando las modificaciones
        let subtotal = product.unitPrice * product.quantity;

        if (product.modifications && product.modifications.length > 0) {
          product.modifications.forEach((mod: any) => {
            subtotal += mod.extraPrice * product.quantity;
          });
        }

        return {
          product: product.product,
          quantity: product.quantity,
          unitPrice: product.unitPrice,
          subtotal,
          modifications: product.modifications.map((mod: any) => ({
            name: mod.name,
            extraPrice: mod.extraPrice
          }))
        };
      }),
      date: new Date(),
      paymentMethod,
      company: companyId
    };

    // Añadir información adicional según el método de pago
    if (paymentMethod === 'cash') {
      newSaleData.receivedAmount = receivedAmount;
      newSaleData.change = change;
    } else if (paymentMethod === 'credit') {
      newSaleData.paymentReference = paymentReference;
    }

    // Guardar la nueva venta en la base de datos
    const newSale = new Sale(newSaleData);
    const savedSale = await newSale.save();

    // Actualizar los pagos en la caja
    let cashTotal = 0;
    let creditTotal = 0;
    let debitTotal = 0;

    productsSold.forEach((product: any) => {
      let subtotal = product.unitPrice * product.quantity;
      if (product.modifications && product.modifications.length > 0) {
        product.modifications.forEach((mod: any) => {
          subtotal += mod.extraPrice * product.quantity;
        });
      }

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

    cashRegister.payments.cash += cashTotal;
    cashRegister.payments.credit += creditTotal;
    cashRegister.payments.debit += debitTotal;

    // Agregar la venta a la caja
    cashRegister.sales.push(savedSale._id);

    // Guardar los cambios en la caja
    await cashRegister.save();

    return res.status(201).json(savedSale);
  } catch (error) {
     
    return res.status(500).json({ message: 'Error creating sale', error });
  }
};