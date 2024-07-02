"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
// src/models/product.model.ts
const mongoose_1 = __importStar(require("mongoose"));
// Esquema del modelo de producto
const productSchema = new mongoose_1.Schema({
    img: {
        type: String,
        default: ''
    },
    name: {
        type: String,
        required: true,
        index: true
    },
    marca: {
        type: String
    },
    description: String,
    company: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: 'Empresa',
        required: true,
    },
    supplier: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: 'Supplier',
        required: true,
    },
    categories: [{
            type: mongoose_1.default.Schema.Types.ObjectId,
            ref: 'Category'
        }],
    recipe: [{
            type: mongoose_1.default.Schema.Types.ObjectId,
            ref: 'Recipe'
        }]
});
// Esquema del modelo de lote (si decides implementarlo)
// Modelo de producto
const Product = mongoose_1.default.model('Product', productSchema);
exports.default = Product;
