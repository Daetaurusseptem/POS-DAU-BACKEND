"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// backend/config/database.ts
const mongoose_1 = __importDefault(require("mongoose"));
// URL de conexión a la base de datos MongoDB
const dbURL = `mongodb+srv://${process.env.USUARIO}:${process.env.PASSWORD}@cluster0.dly0m.mongodb.net/POS-CCONOR?retryWrites=true&w=majority&appName=Cluster0`;
// Configuración de conexión
// Conexión a la base de datos MongoDB 
const connection = mongoose_1.default.connect(dbURL)
    .then(r => {
    console.log("Mongo database connection established");
})
    .catch(err => {
    console.log("Mongo database connection error");
});
exports.default = connection;
