import { Request, Response } from 'express';
import CashRegister from '../models-mongoose/CashRegister';
import Sale from '../models-mongoose/Sales';
import User from '../models-mongoose/User';

// Registrar el dinero inicial y abrir caja
export const openCashRegister = async (req: Request, res: Response) => {
  try {
    const { user, initialAmount } = req.body;
    console.log(user);
    console.log(initialAmount);
    const newCashRegister = new CashRegister({
      user,
      initialAmount,
      finalAmount: 0, // Se actualizará al cerrar la caja
      payments: { cash: 0, credit: 0, debit: 0 },
      startDate: new Date(),
      endDate: new Date(),
      notes: '',
      closed: false
    }); 

    const savedCashRegister = await newCashRegister.save();
    res.status(201).json(savedCashRegister);
  } catch (error) {
    res.status(500).json({ message: 'Error opening cash register', error });
  }
};

// Obtener la caja abierta del usuario y las ventas asociadas
export const getOpenCashRegisterWithSales = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;

    // Buscar una caja abierta del usuario especificado
    const openCashRegister = await CashRegister.findOne({ user: userId, closed: false }).populate('sales');

    if (!openCashRegister) {
      return res.status(404).json({ message: 'No open cash register found for this user' });
    }

    // Devolver la caja abierta con las ventas asociadas
    res.status(200).json(openCashRegister);
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving open cash register with sales', error });
  }
};
  
// Cerrar caja
export const closeCashRegister = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { finalAmount, notes } = req.body;

    const cashRegister = await CashRegister.findById(id).populate('sales');
    if (!cashRegister) {
      return res.status(404).json({ 
        message: 'Cash register not found' 
      });
    }

    const sales = await Sale.find({ 
      user: cashRegister.user, 
      date: { $gte: cashRegister.startDate, $lte: new Date()
        
       } });

    let totalCash = 0, totalCredit = 0, totalDebit = 0;

    sales.forEach(sale => {
      sale.productsSold.forEach(product => {
        switch (product.paymentMethod) {
          case 'cash':
            totalCash += product.subtotal;
            break;
          case 'credit':
            totalCredit += product.subtotal;
            break;
          case 'debit':
            totalDebit += product.subtotal;
            break;
        }
      });
    });

    cashRegister.finalAmount = finalAmount;
    cashRegister.payments.cash = totalCash;
    cashRegister.payments.credit = totalCredit;
    cashRegister.payments.debit = totalDebit;
    cashRegister.notes = notes;
    cashRegister.endDate = new Date();
    cashRegister.closed = true;

    const savedCashRegister = await cashRegister.save();
    res.status(200).json(savedCashRegister);
  } catch (error) {
    res.status(500).json({ message: 'Error closing cash register', error});
  }
};

export const hasOpenCashRegister = async (req: Request, res: Response) => {
  try {

    const { userId } = req.params;
    const openCashRegister = await CashRegister.findOne({ user: userId, closed: false });
    
    res
    .status(200)
    .json(!!openCashRegister);
  } catch (error) {
    res.status(500).json({ message: 'Error checking open cash register', error });
  }
};


// Obtener todos los cortes de caja
export const getCashRegisters = async (req: Request, res: Response) => {
  try {
    const cashRegisters = await CashRegister.find().populate('user').populate('sales');
    res.status(200).json(cashRegisters);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching cash registers', error });
  }
};


export const getOpenCashRegister = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;

    const openCashRegister = await CashRegister.findOne({ user: userId, closed: false });

    if (!openCashRegister) {
      return res.status(404).json({ message: 'No open cash register found for this user' });
    }

    res.status(200).json(openCashRegister);
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving open cash register', error });
  }
};

export const getUserCashRegistersByStartDate = async (req: Request, res: Response) => {
  try {
      const { userId } = req.params;
      const { startDate } = req.query;

      const userDb = await User.findById(userId);
      if(!userDb) {
        return res.status(404).json({ message: 'Usuario no encontrado' });
      }

      if (!startDate) {
          return res.status(400).json({ message: 'startDate es requerido' });
      }

      const start = new Date(startDate as string);
      start.setHours(0, 0, 0, 0);
      const end = new Date(startDate as string);
      end.setHours(23, 59, 59, 999);

      const cashRegisters = await CashRegister.find({
          user: userId,
          startDate: { $gte: start, $lte: end }
      })
      .populate('user')
      .populate('sales');

      res.status(200).json(cashRegisters);
  } catch (error) {
      res.status(500).json({ message: 'Error al obtener las cajas', error });
  }
};
export const getSalesByCashRegister = async (req: Request, res: Response) => {
  try {
      const { cashRegisterId } = req.params;

      const cashRegister = await CashRegister.findById(cashRegisterId);
      if (!cashRegister) {
          return res.status(404).json({ message: 'Caja no encontrada' });
      }

      const sales = await Sale.find({ _id: { $in: cashRegister.sales } }).populate('user').populate('productsSold.product');

      res.status(200).json(sales);
  } catch (error) {
      res.status(500).json({ message: 'Error al obtener las ventas', error });
  }
};