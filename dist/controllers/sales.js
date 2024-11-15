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
const Item_1 = __importDefault(require("../models-mongoose/Item"));
const recipes_1 = __importDefault(require("../models-mongoose/recipes"));
const Ingredient_1 = __importDefault(require("../models-mongoose/Ingredient"));
const User_1 = __importDefault(require("../models-mongoose/User"));
const Products_1 = __importDefault(require("../models-mongoose/Products")); // Importar el modelo Product para acceder a sus campos
// Obtener todas las ventas
const getAllSales = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const sales = yield Sales_1.default.find().populate('user').populate('productsSold.product');
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
        const sale = yield Sales_1.default.findById(req.params.id).populate('user').populate('productsSold.product');
        if (!sale)
            return res.status(404).json({ message: 'Venta no encontrada' });
        res.status(200).json({ ok: true, sale });
    }
    catch (error) {
        res.status(500).json({ message: error });
    }
});
exports.getSaleById = getSaleById;
// Función para deducir el stock de un ítem simple
const deductStockForSimpleItem = (itemId, quantity) => __awaiter(void 0, void 0, void 0, function* () {
    const item = yield Item_1.default.findById(itemId);
    if (!item)
        throw new Error('Item not found aca');
    item.stock -= quantity;
    if (item.stock < 0)
        throw new Error(`Not enough stock for item ${item.name}`);
    yield item.save();
});
// Función para deducir ingredientes para un ítem compuesto
// Función para deducir ingredientes para un ítem compuesto
const deductIngredientsForCompositeItem = (recipeId, quantity) => __awaiter(void 0, void 0, void 0, function* () {
    const recipe = yield recipes_1.default.findById(recipeId).populate('ingredients.ingredient');
    if (!recipe)
        throw new Error('Recipe not found');
    for (const recipeIngredient of recipe.ingredients) {
        const ingredient = yield Ingredient_1.default.findById(recipeIngredient.ingredient._id);
        if (!ingredient)
            throw new Error('Ingredient not found');
        ingredient.quantity -= recipeIngredient.quantity * quantity;
        if (ingredient.quantity < 0)
            throw new Error(`Not enough ${ingredient.name} in stock`);
        yield ingredient.save();
    }
});
// Procesar la venta y actualizar el inventario
const processSale = (productsSold) => __awaiter(void 0, void 0, void 0, function* () {
    for (const productSold of productsSold) {
        // Utilizar el ID del producto que ahora se garantiza que estará presente
        const item = yield Item_1.default.findOne({ product: productSold.product }).populate('product');
        if (!item)
            throw new Error('Item not found qui');
        // Buscar el producto para verificar si es compuesto
        const product = yield Products_1.default.findById(item.product._id);
        if (!product)
            throw new Error('Product not found');
        // Verificar si el producto es compuesto y deducir los ingredientes si es necesario
        if (product.isComposite) {
            if (!product.recipe)
                throw new Error('Composite product does not have a recipe');
            yield deductIngredientsForCompositeItem(product.recipe, productSold.quantity);
        }
        else {
            // Deducir el stock del ítem simple 
            yield deductStockForSimpleItem(item._id.toString(), productSold.quantity);
        }
    }
});
// Crear una venta
const createSale = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { user, total, discount, productsSold, paymentMethod, receivedAmount, change, paymentReference } = req.body;
        // Obtener la caja abierta del usuario
        const cashRegister = yield CashRegister_1.default.findOne({ user, closed: false });
        if (!cashRegister) {
            return res.status(400).json({ message: 'No open cash register found for this user' });
        }
        // Obtener el usuario y la compañía
        const userDoc = yield User_1.default.findById(user).populate('companyId');
        if (!userDoc) {
            return res.status(404).json({ message: 'User not found' });
        }
        const companyId = userDoc.companyId;
        if (!companyId) {
            return res.status(400).json({ message: 'User does not belong to any company' });
        }
        // Procesar la venta y actualizar el inventario
        yield processSale(productsSold);
        // Crear una nueva venta con los datos proporcionados
        const newSaleData = {
            user,
            total,
            discount,
            productsSold: productsSold.map((product) => {
                // Calcular el subtotal del producto considerando las modificaciones
                let subtotal = product.unitPrice * product.quantity;
                if (product.modifications && product.modifications.length > 0) {
                    product.modifications.forEach((mod) => {
                        subtotal += mod.extraPrice * product.quantity;
                    });
                }
                return {
                    product: product.product,
                    quantity: product.quantity,
                    unitPrice: product.unitPrice,
                    subtotal,
                    modifications: product.modifications.map((mod) => ({
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
        }
        else if (paymentMethod === 'credit') {
            newSaleData.paymentReference = paymentReference;
        }
        // Guardar la nueva venta en la base de datos
        const newSale = new Sales_1.default(newSaleData);
        const savedSale = yield newSale.save();
        // Actualizar los pagos en la caja
        let cashTotal = 0;
        let creditTotal = 0;
        let debitTotal = 0;
        productsSold.forEach((product) => {
            let subtotal = product.unitPrice * product.quantity;
            if (product.modifications && product.modifications.length > 0) {
                product.modifications.forEach((mod) => {
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
        yield cashRegister.save();
        return res.status(201).json(savedSale);
    }
    catch (error) {
        return res.status(500).json({ message: 'Error creating sale', error });
    }
});
exports.createSale = createSale;
