"use strict";
// src/controllers/ItemController.ts
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
exports.processSale = exports.deductIngredientsForCompositeItem = exports.deductStockForSimpleItem = exports.getItemsByCategory = exports.getItems = exports.deleteItem = exports.updateItem = exports.getItemById = exports.getAllCompanyItemsPagination = exports.getAllItemsOfCompanyForSysadmin = exports.getAllCompanyItems = exports.getAllItems = exports.createItem = void 0;
const Company_1 = __importDefault(require("../models-mongoose/Company"));
const Products_1 = __importDefault(require("../models-mongoose/Products"));
const Item_1 = __importDefault(require("../models-mongoose/Item"));
const recipes_1 = __importDefault(require("../models-mongoose/recipes"));
const Ingredient_1 = __importDefault(require("../models-mongoose/Ingredient"));
// Crear un nuevo Item
const createItem = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const product = req.body.product;
        const { empresaId } = req.params;
        const producto = yield Products_1.default.findById(product);
        const empresa = yield Company_1.default.findById(empresaId);
        if (!producto) {
            return res.status(404).json({
                ok: false,
                msg: "Producto No Existe"
            });
        }
        if (!empresa) {
            return res.status(404).json({
                ok: false,
                msg: "Empresa No Existe"
            });
        }
        req.body.company = empresaId;
        const newItem = new Item_1.default(req.body);
        const savedItem = yield newItem.save();
        return res.status(201).json({
            ok: true,
            item: savedItem
        });
    }
    catch (error) {
        return res.status(400).json(error);
    }
});
exports.createItem = createItem;
// Obtener todos los Items
const getAllItems = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const Items = yield Item_1.default.find();
        res.status(200).json(Items);
    }
    catch (error) {
        res.status(500).json({ message: error });
    }
});
exports.getAllItems = getAllItems;
// Obtener todos los Items
const getAllCompanyItems = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const company = yield Company_1.default.findById(id);
        if (!company)
            return res.status(404).json({ message: 'Compañia no encontrada' });
        const items = yield Item_1.default.find({ company: id });
        res.status(200).json({ ok: true, items });
    }
    catch (error) {
        res.status(500).json({ message: error });
    }
});
exports.getAllCompanyItems = getAllCompanyItems;
// Obtener todos los ítems de una compañía para el sysadmin
const getAllItemsOfCompanyForSysadmin = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { companyId } = req.params;
        const company = yield Company_1.default.findById(companyId);
        if (!company) {
            return res.status(404).json({ message: 'Empresa no encontrada' });
        }
        const items = yield Item_1.default.find({ company: companyId });
        res.status(200).json({ ok: true, items });
    }
    catch (error) {
        res.status(500).json({ message: error });
    }
});
exports.getAllItemsOfCompanyForSysadmin = getAllItemsOfCompanyForSysadmin;
const getAllCompanyItemsPagination = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Parámetros de paginación con valores por defecto
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 5;
        // Calcular el desplazamiento
        const skip = (page - 1) * limit;
        // Obtener el companyId desde los parámetros de la solicitud
        const { companyId } = req.params;
        // Verificar si la empresa existe
        const company = yield Company_1.default.findById(companyId);
        if (!company) {
            return res.status(404).json({ message: 'Empresa no existe' });
        }
        // Obtener los items de la empresa con paginación
        const items = yield Item_1.default.find({ company: companyId })
            .populate('product')
            .skip(skip)
            .limit(limit);
        // Contar el total de documentos para la empresa específica
        const total = yield Item_1.default.countDocuments({ company: companyId });
        const totalPages = Math.ceil(total / limit);
        // Devolver resultados paginados
        return res.status(200).json({
            totalItems: total,
            totalPages,
            currentPage: page,
            itemsPerPage: limit,
            items,
        });
    }
    catch (error) {
        console.error('Error al obtener los items de la empresa:', error);
        return res.status(500).json({ error: 'Error al obtener los items de la empresa' });
    }
});
exports.getAllCompanyItemsPagination = getAllCompanyItemsPagination;
// Obtener un Item por ID
const getItemById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const item = yield Item_1.default.findById(req.params.id);
        if (!item) {
            return res.status(404).json({ message: 'Item no encontrado' });
        }
        ;
        return res.status(200).json({ ok: true, item });
    }
    catch (error) {
        return res.status(500).json({ message: error });
    }
});
exports.getItemById = getItemById;
// Actualizar un Item
const updateItem = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const updatedItem = yield Item_1.default.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!updatedItem)
            return res.status(404).json({ message: 'Item no encontrado' });
        res.status(200).json(updatedItem);
    }
    catch (error) {
        res.status(400).json({ message: error });
    }
});
exports.updateItem = updateItem;
// Eliminar un Item
const deleteItem = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const deletedItem = yield Item_1.default.findByIdAndDelete(req.params.id);
        if (!deletedItem)
            return res.status(404).json({ message: 'Item no encontrado' });
        res.status(200).json({ ok: true, message: 'Item eliminado' });
    }
    catch (error) {
        res.status(500).json({ ok: false, message: error });
    }
});
exports.deleteItem = deleteItem;
const getItems = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { empresaId } = req.params;
        const { page = 1, size = 20, name } = req.query;
        const pageNumber = parseInt(page, 10) || 1;
        const pageSize = parseInt(size, 10) || 20;
        const searchTerm = name ? name : '';
        const query = Object.assign({ company: empresaId }, (searchTerm && { name: { $regex: new RegExp(searchTerm, 'i') } }));
        const items = yield Item_1.default.find(query)
            .populate('product')
            .skip((pageNumber - 1) * pageSize)
            .limit(pageSize)
            .exec();
        const totalItems = yield Item_1.default.countDocuments(query);
        res.json({
            totalItems,
            currentPage: pageNumber,
            totalPages: Math.ceil(totalItems / pageSize),
            items
        });
    }
    catch (error) {
        res.status(500).json({ message: 'Error retrieving items', error: error });
    }
});
exports.getItems = getItems;
const getItemsByCategory = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { companyId } = req.params;
        const { category, search = '', page = 1, limit = 10 } = req.query;
        // Validar parámetros obligatorios
        if (!category && !search) {
            return res.status(400).json({ message: 'Either category or search term must be provided' });
        }
        if (!companyId) {
            return res.status(400).json({ message: 'Company ID is required' });
        }
        // Construir la consulta para buscar productos
        const query = {
            company: companyId,
        };
        if (category) {
            query.categories = { $in: [category] };
        }
        if (search) {
            query.name = { $regex: search, $options: 'i' };
        }
        // Buscar productos por categoría, compañía y término de búsqueda
        const products = yield Products_1.default.find(query);
        // Verificar si se encontraron productos
        if (!products.length) {
            return res.status(404).json({ message: 'No products found for the provided filters' });
        }
        // Obtener los IDs de los productos encontrados
        const productIds = products.map(product => product._id);
        // Calcular el total de ítems disponibles en stock
        const totalItems = yield Item_1.default.countDocuments({ product: { $in: productIds }, stock: { $gt: 0 }, company: companyId });
        if (totalItems === 0) {
            return res.status(404).json({ message: 'No items in stock for the provided filters' });
        }
        // Buscar ítems que correspondan a los productos encontrados con paginación
        const items = yield Item_1.default.find({ product: { $in: productIds }, stock: { $gt: 0 }, company: companyId })
            .populate('product')
            .populate('company')
            .skip((Number(page) - 1) * Number(limit))
            .limit(Number(limit));
        res.status(200).json({
            items,
            totalItems,
            totalPages: Math.ceil(totalItems / Number(limit)),
            currentPage: Number(page)
        });
    }
    catch (error) {
        console.error('Error fetching items:', error);
        res.status(500).json({ message: 'Error fetching items', error });
    }
});
exports.getItemsByCategory = getItemsByCategory;
const deductStockForSimpleItem = (itemId, quantity) => __awaiter(void 0, void 0, void 0, function* () {
    const item = yield Item_1.default.findById(itemId);
    if (!item)
        throw new Error('Item not found');
    item.stock -= quantity;
    if (item.stock < 0)
        throw new Error(`Not enough stock for item ${item.name}`);
    yield item.save();
});
exports.deductStockForSimpleItem = deductStockForSimpleItem;
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
exports.deductIngredientsForCompositeItem = deductIngredientsForCompositeItem;
const processSale = (saleData) => __awaiter(void 0, void 0, void 0, function* () {
    for (const productSold of saleData.productsSold) {
        const item = yield Item_1.default.findById(productSold.itemId).populate('product');
        if (!item)
            throw new Error('Item not found');
        if (item.product.isComposite) {
            if (!item.product.recipe)
                throw new Error('Composite product does not have a recipe');
            yield (0, exports.deductIngredientsForCompositeItem)(item.product.recipe, productSold.quantity);
        }
        else {
            yield (0, exports.deductStockForSimpleItem)(item._id, productSold.quantity);
        }
    }
});
exports.processSale = processSale;
exports.default = {
    createItem: exports.createItem,
    getAllItems: exports.getAllItems,
    getItemById: exports.getItemById,
    updateItem: exports.updateItem,
    deleteItem: exports.deleteItem,
    getAllItemsOfCompanyForSysadmin: exports.getAllItemsOfCompanyForSysadmin
};
