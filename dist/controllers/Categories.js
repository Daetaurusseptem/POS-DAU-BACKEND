"use strict";
// src/controllers/categoryController.ts
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
exports.deleteCategory = exports.updateCategory = exports.getCategoryById = exports.getCategoriesCompaniesPagination = exports.getAllCategoriesCompany = exports.getAllCategories = exports.createCategory = void 0;
const Category_1 = __importDefault(require("../models-mongoose/Category"));
const Company_1 = __importDefault(require("../models-mongoose/Company"));
const createCategory = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { idEmpresa } = req.params;
        req.body.company = idEmpresa;
        const empresa = yield Company_1.default.findById(idEmpresa);
        if (!empresa) {
            res.status(404).json({
                ok: false,
                msg: "No se encontro la empresa"
            });
        }
        const category = new Category_1.default(req.body);
        yield category.save();
        res.status(201).json(category);
    }
    catch (error) {
        console.log(error);
        res.status(400).json({ message: 'La categoria ya existe o no es valida' });
    }
});
exports.createCategory = createCategory;
const getAllCategories = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const categories = yield Category_1.default.find();
        res.status(200).json(categories);
    }
    catch (error) {
        res.status(500).json({ message: error });
    }
});
exports.getAllCategories = getAllCategories;
const getAllCategoriesCompany = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { companyId } = req.params;
        const company = yield Company_1.default.findById(companyId);
        if (!company) {
            return res.status(404).json({ message: 'Empresa no existe' });
        }
        const categories = yield Category_1.default.find({ company: companyId });
        res.status(200).json({
            ok: true,
            categories
        });
    }
    catch (error) {
        res.status(500).json({ message: error });
    }
});
exports.getAllCategoriesCompany = getAllCategoriesCompany;
const getCategoriesCompaniesPagination = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Parámetros de paginación con valores por defecto
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 5;
        // Calcular el desplazamiento
        const skip = (page - 1) * limit;
        const { companyId } = req.params;
        const company = yield Company_1.default.findById(companyId);
        if (!company) {
            return res.status(404).json({ message: 'Empresa no existe' });
        }
        // Obtener datos paginados
        const categories = yield Category_1.default.find({ company: companyId }).skip(skip).limit(limit);
        // Contar el total de documentos para calcular el total de páginas
        const total = yield Company_1.default.countDocuments();
        const totalPages = Math.ceil(total / limit);
        // Devolver resultados paginados
        return res.status(200).json({
            totalPages,
            page,
            limit,
            categories
        });
    }
    catch (error) {
        console.error('Error al obtener las empresas:', error);
        return res.status(500).json({ error: 'Error al obtener las empresas' });
    }
});
exports.getCategoriesCompaniesPagination = getCategoriesCompaniesPagination;
const getCategoryById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const category = yield Category_1.default.findById(req.params.id);
        if (!category) {
            return res.status(404).json({ message: 'Category not found' });
        }
        res.status(200).json({ ok: true, category });
    }
    catch (error) {
        res.status(500).json({ message: error });
    }
});
exports.getCategoryById = getCategoryById;
const updateCategory = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        console.log('CATEGORIA: ', req.body);
        const category = yield Category_1.default.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!category) {
            return res.status(404).json({ message: 'Category not found' });
        }
        res.status(200).json({ ok: true, category });
    }
    catch (error) {
        res.status(400).json({ message: error });
    }
});
exports.updateCategory = updateCategory;
const deleteCategory = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const category = yield Category_1.default.findByIdAndDelete(req.params.id);
        if (!category) {
            return res.status(404).json({ message: 'Category not found' });
        }
        res.status(200).json({ message: 'Category deleted' });
    }
    catch (error) {
        res.status(500).json({ message: error });
    }
});
exports.deleteCategory = deleteCategory;
