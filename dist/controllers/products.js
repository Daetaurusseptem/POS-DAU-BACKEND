"use strict";
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
exports.searchProducts = exports.deleteProduct = exports.updateProduct = exports.getProductById = exports.getAllCompanyProducts = exports.getAllProductsOfCompanyForSysadmin = exports.getAllProducts = exports.createProduct = void 0;
const Products_1 = __importDefault(require("../models-mongoose/Products"));
const Company_1 = __importDefault(require("../models-mongoose/Company"));
// Crear un nuevo producto
const createProduct = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { companyId } = req.params;
    try {
        const companyDb = yield Company_1.default.findById(companyId);
        if (!companyDb) {
            return res.status(404).json({
                ok: false,
                msg: "No existe la empresa seleccionada"
            });
        }
        req.body.company = companyId;
        const newProduct = new Products_1.default(req.body);
        const savedProduct = yield newProduct.save();
        // subirImg
        req.params.id = newProduct._id;
        req.params.tipo = 'productos';
        return res.status(201).json({ ok: true, savedProduct });
    }
    catch (error) {
        return res.status(400).json({ message: error });
    }
});
exports.createProduct = createProduct;
// Obtener todos los productos
const getAllProducts = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const products = yield Products_1.default.find().populate('supplier');
        res.status(200).json({ ok: true, products });
    }
    catch (error) {
        res.status(500).json({ message: error });
    }
});
exports.getAllProducts = getAllProducts;
// Obtener todos los productos de una empresa para sysadmin
const getAllProductsOfCompanyForSysadmin = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { companyId } = req.params;
        const companyDb = yield Company_1.default.findById(companyId);
        if (!companyDb) {
            return res.status(404).json({
                ok: false,
                msg: "No existe la empresa seleccionada"
            });
        }
        const products = yield Products_1.default.find({ company: companyId }).populate('supplier');
        res.status(200).json({ ok: true, products });
    }
    catch (error) {
        res.status(500).json({ message: error });
    }
});
exports.getAllProductsOfCompanyForSysadmin = getAllProductsOfCompanyForSysadmin;
// Obtener todos los productos de una empresa
const getAllCompanyProducts = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const products = yield Products_1.default.find({ company: id }).populate('supplier');
        res.status(200).json({ ok: true, products });
    }
    catch (error) {
        res.status(500).json({ message: error });
    }
});
exports.getAllCompanyProducts = getAllCompanyProducts;
// Obtener un producto por ID
const getProductById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const product = yield Products_1.default.findById(req.params.id).populate('supplier');
        if (!product)
            return res.status(404).json({ message: 'Producto no encontrado' });
        res.status(200).json({ ok: true, product });
    }
    catch (error) {
        res.status(500).json({ message: error });
    }
});
exports.getProductById = getProductById;
// Actualizar un producto
const updateProduct = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const updatedProduct = yield Products_1.default.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!updatedProduct)
            return res.status(404).json({ message: 'Producto no encontrado' });
        res.status(200).json(updatedProduct);
    }
    catch (error) {
        res.status(400).json({ message: error });
    }
});
exports.updateProduct = updateProduct;
// Eliminar un producto
const deleteProduct = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const deletedProduct = yield Products_1.default.findByIdAndDelete(req.params.id);
        if (!deletedProduct)
            return res.status(404).json({ message: 'Producto no encontrado' });
        res.status(200).json({ message: 'Producto eliminado' });
    }
    catch (error) {
        res.status(500).json({ message: error });
    }
});
exports.deleteProduct = deleteProduct;
// Buscar productos
const searchProducts = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { page = 1, limit = 5, search = '', companyId } = req.query;
        if (!companyId) {
            return res.status(400).json({ message: 'Company ID is required' });
        }
        const query = Object.assign({ company: companyId }, (search && { name: { $regex: new RegExp(search, 'i') } }));
        const products = yield Products_1.default.find(query)
            .limit(Number(limit))
            .skip((Number(page) - 1) * Number(limit));
        const total = yield Products_1.default.countDocuments(query);
        res.status(200).json({
            products,
            totalPages: Math.ceil(total / Number(limit)),
            currentPage: Number(page),
            totalItems: total
        });
    }
    catch (error) {
        res.status(500).json({ message: 'Error fetching products', error });
    }
});
exports.searchProducts = searchProducts;
