import { Request, Response } from 'express';
import CashRegister from '../models-mongoose/CashRegister';
import Sale from '../models-mongoose/Sales';
import User from '../models-mongoose/User';
import moment from 'moment';

// Registrar el dinero inicial y abrir caja
export const openCashRegister = async (req: Request, res: Response) => {
  try {
    const { user, initialAmount } = req.body;
    
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
    const { userId, startDate } = req.params;

    if (!startDate) {
      return res.status(400).json({ message: 'fecha es requerido' });
    }

    // Verificar si el usuario existe en la base de datos
    const userDb = await User.findById(userId);
    if (!userDb) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    // Convertir la fecha recibida en formato adecuado (inicio y fin del día)
    const start = moment.utc(startDate).startOf('day').toDate(); // Inicia el día en UTC
    const end = moment.utc(startDate).endOf('day').toDate(); // Termina el día en UTC

    // Buscar las cajas abiertas en la fecha especificada
    const cashRegisters = await CashRegister.find({
      user: userId,
      startDate: { $gte: start, $lte: end }
    })
      .populate('user')
      .populate('sales');

    if (cashRegisters.length === 0) {
      return res.status(200).json({ ok: true, cajas: [] });
    }

    res.status(200).json({ ok: true, cajas: cashRegisters });
  } catch (error) {
    console.error('Error al obtener las cajas:', error);
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

export const getUserCajasByDate = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;

    const userDb = await User.findById(userId);
    if (!userDb) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    // Encontrar las cajas abiertas del usuario y obtener solo las fechas
    const cajas = await CashRegister.find({ user: userId }).select('startDate');
    const fechas = Array.from(new Set(cajas.map(caja => caja.startDate.toISOString().split('T')[0]))); // Agrupar por fechas

    return res.status(200).json({ fechas });
  } catch (error) {
    return res.status(500).json({ message: 'Error al obtener las fechas de cajas abiertas', error });
  }
};
export const getCajaDetailsById = async (req: Request, res: Response) => {
  try {
    const { cajaId } = req.params;
    console.log(cajaId);
    
    const cashRegister = await CashRegister.findById(cajaId)
      .populate('user') // Popula el usuario asociado a la caja
      .populate({
        path: 'sales', // Popula las ventas relacionadas
        populate: {
          path: 'productsSold.product', // Popula los detalles de cada producto vendido en las ventas
          model: 'Product', // Asegúrate de usar el nombre del modelo correcto aquí
        }
      });

    if (!cashRegister) {
      return res.status(404).json({ message: 'Caja no encontrada' });
    }

    return res.status(200).json({ ok: true, caja: cashRegister });
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener los detalles de la caja', error });
  }
};

