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
// src/models/user.model.ts
const mongoose_1 = __importStar(require("mongoose"));
// Esquema del modelo de usuario
const userSchema = new mongoose_1.Schema({
    username: {
        type: String,
        required: true,
        unique: true,
    },
    companyId: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: 'Empresa',
        required: false,
    },
    password: {
        type: String,
        required: true,
        select: false
    },
    name: String,
    email: {
        type: String,
        required: true
    },
    role: {
        type: String,
        enum: ['admin', 'user', 'sysadmin'],
        default: 'user',
        required: true,
    },
    img: {
        type: String
    },
    lastLogin: {
        type: Date,
        default: Date.now
    }
    // Define otros campos de usuario según tus necesidades
});
// Modelo de usuario
const User = mongoose_1.default.model('User', userSchema);
exports.default = User;
