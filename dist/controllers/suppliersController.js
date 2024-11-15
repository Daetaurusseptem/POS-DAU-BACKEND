"use strict";
// src/controllers/supplierController.ts
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteSupplier = exports.updateSupplier = exports.getCompanySuppliers = exports.getSupplierById = exports.getAllSuppliers = exports.createSupplier = void 0;
const Supplier_1 = __importDefault(require("../models-mongoose/Supplier"));
const Company_1 = __importDefault(require("../models-mongoose/Company"));
// Crear un nuevo proveedor
const createSupplier = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { companyId } = req.params;
        const supplierData = __rest(req.body, []);
        // Verificar si la empresa existe
        const company = yield Company_1.default.findById(companyId);
        if (!company) {
            return res.status(404).json({ message: 'Empresa no encontrada' });
        }
        const newSupplier = new Supplier_1.default(Object.assign(Object.assign({}, supplierData), { company: companyId }));
        const savedSupplier = yield newSupplier.save();
        return res.status(201).json(savedSupplier);
    }
    catch (error) {
        return res.status(400).json({ message: error });
    }
});
exports.createSupplier = createSupplier;
// Obtener todos los proveedores
const getAllSuppliers = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const suppliers = yield Supplier_1.default.find();
        res.status(200).json(suppliers);
    }
    catch (error) {
        res.status(500).json({ message: error });
    }
});
exports.getAllSuppliers = getAllSuppliers;
// Obtener un proveedor por ID
const getSupplierById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const supplier = yield Supplier_1.default.findById(req.params.id);
        if (!supplier)
            return res.status(404).json({ message: 'Proveedor no encontrado' });
        res.status(200).json({
            ok: true,
            supplier
        });
    }
    catch (error) {
        res.status(500).json({ message: error });
    }
});
exports.getSupplierById = getSupplierById;
const getCompanySuppliers = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const companyId = req.params.companyId;
        // Verificar si la empresa existe
        const company = yield Company_1.default.findById(companyId);
        if (!company) {
            return res.status(404).json({ message: 'Empresa no encontrada' });
        }
        const suppliers = yield Supplier_1.default.find({ company: companyId });
        res.status(200).json({ ok: true, suppliers });
    }
    catch (error) {
        res.status(500).json({ ok: false, error });
    }
});
exports.getCompanySuppliers = getCompanySuppliers;
// Actualizar un proveedor
const updateSupplier = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const updatedSupplier = yield Supplier_1.default.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!updatedSupplier)
            return res.status(404).json({ message: 'Proveedor no encontrado' });
        res.status(200).json(updatedSupplier);
    }
    catch (error) {
        res.status(400).json({ message: error });
    }
});
exports.updateSupplier = updateSupplier;
// Eliminar un proveedor
const deleteSupplier = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const deletedSupplier = yield Supplier_1.default.findByIdAndDelete(req.params.id);
        if (!deletedSupplier)
            return res.status(404).json({ message: 'Proveedor no encontrado' });
        res.status(200).json({ message: 'Proveedor eliminado' });
    }
    catch (error) {
        res.status(500).json({ message: error });
    }
});
exports.deleteSupplier = deleteSupplier;
exports.default = {
    createSupplier: exports.createSupplier,
    getAllSuppliers: exports.getAllSuppliers,
    getSupplierById: exports.getSupplierById,
    updateSupplier: exports.updateSupplier,
    deleteSupplier: exports.deleteSupplier
};
