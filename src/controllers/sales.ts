// src/controllers/saleController.ts

import { Request, Response } from 'express';
import Sale from '../models-mongoose/Sales';
import CashRegister from '../models-mongoose/CashRegister';



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

export const createSale = async (req: Request, res: Response) => {
  try {
    const { user, total, discount, productsSold, paymentMethod } = req.body;

    // Obtener la caja abierta del usuario
    const cashRegister = await CashRegister.findOne({ user, closed: false });
    if (!cashRegister) {
      return res.status(400).json({ message: 'No open cash register found for this user' });
    }

    // Crear una nueva venta
    const newSale = new Sale({
      user,
      total,
      discount,
      productsSold,
      date: new Date(),
      paymentMethod
    });

    const savedSale = await newSale.save();

    // Actualizar los pagos en la caja
    let cashTotal = 0;
    let creditTotal = 0;
    let debitTotal = 0;

    productsSold.forEach((product:any) => {
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
    cashRegister.payments.cash = cashRegister.payments.cash  + cashTotal;
    cashRegister.payments.credit = cashRegister.payments.credit + creditTotal;
    cashRegister.payments.debit = cashRegister.payments.debit + debitTotal;

    // Agregar la venta a la caja
    cashRegister.sales.push(savedSale._id);

    await cashRegister.save();

    return res.status(201).json(savedSale);
  } catch (error) {
    return res.status(500).json({ message: 'Error creating sale', error });
  }
};
