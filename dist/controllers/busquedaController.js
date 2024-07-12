"use strict";
// src/controllers/busquedaController.ts
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.search = void 0;
const models = {
    users: require('../models-mongoose/User').default,
    companies: require('../models-mongoose/Company').default,
    suppliers: require('../models-mongoose/Supplier').default,
    categories: require('../models-mongoose/Category').default,
    products: require('../models-mongoose/Products').default,
    items: require('../models-mongoose/Item').default
};
const search = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const collection = req.params.collection;
    const query = req.params.query;
    const companyId = req.params.companyId;
    const model = models[collection];
    if (!model) {
        return res.status(400).json({
            message: `No existe búsqueda para la colección ${collection}`
        });
    }
    let regex = new RegExp(query, 'i'); // Expresión regular para búsqueda insensible a mayúsculas
    try {
        let results;
        if (collection === 'products' || collection === 'items') {
            const additionalFilter = collection === 'products' ? { categories: req.body.categories } : { product: req.body.product };
            results = yield model.find(Object.assign(Object.assign({}, additionalFilter), { companyId, name: regex }));
        }
        else {
            results = yield model.find({ companyId, name: regex });
        }
        res.status(200).json(results);
    }
    catch (error) {
        res.status(500).json({ message: error });
    }
});
exports.search = search;
