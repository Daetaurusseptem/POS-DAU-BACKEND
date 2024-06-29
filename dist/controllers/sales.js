"use strict";
// src/controllers/saleController.ts
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createSale = exports.getSaleById = exports.getAllSales = void 0;
const Sales_1 = __importDefault(require("../models-mongoose/Sales"));
const CashRegister_1 = __importDefault(require("../models-mongoose/CashRegister"));
// Obtener todas las ventas
const getAllSales = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const sales = yield Sales_1.default.find().populate('user').populate('productsSold.productId');
        res.status(200).json(sales);
    }
    catch (error) {
        res.status(500).json({ message: error });
    }
});
exports.getAllSales = getAllSales;
// Obtener una venta por ID
const getSaleById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const sale = yield Sales_1.default.findById(req.params.id).populate('user').populate('productsSold.productId');
        if (!sale)
            return res.status(404).json({ message: 'Venta no encontrada' });
        res.status(200).json(sale);
    }
    catch (error) {
        res.status(500).json({ message: error });
    }
});
exports.getSaleById = getSaleById;
const createSale = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { user, total, discount, productsSold, paymentMethod } = req.body;
        // Obtener la caja abierta del usuario
        const cashRegister = yield CashRegister_1.default.findOne({ user, closed: false });
        if (!cashRegister) {
            return res.status(400).json({ message: 'No open cash register found for this user' });
        }
        // Crear una nueva venta
        const newSale = new Sales_1.default({
            user,
            total,
            discount,
            productsSold,
            date: new Date(),
            paymentMethod
        });
        const savedSale = yield newSale.save();
        // Actualizar los pagos en la caja
        let cashTotal = 0;
        let creditTotal = 0;
        let debitTotal = 0;
        productsSold.forEach((product) => {
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
        cashRegister.payments.cash = cashRegister.payments.cash + cashTotal;
        cashRegister.payments.credit = cashRegister.payments.credit + creditTotal;
        cashRegister.payments.debit = cashRegister.payments.debit + debitTotal;
        // Agregar la venta a la caja
        cashRegister.sales.push(savedSale._id);
        yield cashRegister.save();
        return res.status(201).json(savedSale);
    }
    catch (error) {
        return res.status(500).json({ message: 'Error creating sale', error });
    }
});
exports.createSale = createSale;
