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
exports.Server = void 0;
const express_1 = __importDefault(require("express"));
const body_parser_1 = __importDefault(require("body-parser"));
const cors_1 = __importDefault(require("cors"));
const productRoutes_1 = __importDefault(require("../routes/productRoutes"));
const saleRoutes_1 = __importDefault(require("../routes/saleRoutes"));
const itemRoutes_1 = __importDefault(require("../routes/itemRoutes"));
const userRoutes_1 = __importDefault(require("../routes/userRoutes"));
const authRoutes_1 = __importDefault(require("../routes/authRoutes"));
const companyRoutes_1 = __importDefault(require("../routes/companyRoutes"));
const fileUploadRoutes_1 = __importDefault(require("../routes/fileUploadRoutes"));
const subscriptionRoutes_1 = __importDefault(require("../routes/subscriptionRoutes"));
const suppliersRoutes_1 = __importDefault(require("../routes/suppliersRoutes"));
const categoryRoutes_1 = __importDefault(require("../routes/categoryRoutes"));
const cashRegister_1 = __importDefault(require("../routes/cashRegister"));
const dailySaleRoutes_1 = __importDefault(require("../routes/dailySaleRoutes"));
const ingredientRoutes_1 = __importDefault(require("../routes/ingredientRoutes"));
const recipeRoutes_1 = __importDefault(require("../routes/recipeRoutes"));
class Server {
    constructor() {
        this.app = (0, express_1.default)();
        this.connectToDatabase();
        this.connectToAwsS3();
        this.port = parseInt(process.env.PORT || '3000', 10);
        this.config();
        this.routes();
        this.start();
    }
    config() {
        // Configuración de middlewares
        this.app.use(body_parser_1.default.json());
        this.app.use((0, cors_1.default)());
    }
    routes() {
        this.app.use('/api/auth', authRoutes_1.default); // Autenticación
        this.app.use('/api/products', productRoutes_1.default); // Rutas para productos
        this.app.use('/api/categories', categoryRoutes_1.default); // Rutas para categorias
        this.app.use('/api/sales', saleRoutes_1.default); // Rutas para ventas
        this.app.use('/api/users', userRoutes_1.default); // Rutas para usuarios
        this.app.use('/api/companies', companyRoutes_1.default); // Rutas para compañias
        this.app.use('/api/uploads', fileUploadRoutes_1.default); // Rutas para fileUploads
        this.app.use('/api/subs', subscriptionRoutes_1.default); // Rutas para stripe subscriptions
        this.app.use('/api/items', itemRoutes_1.default); // Rutas para lotes
        this.app.use('/api/suppliers', suppliersRoutes_1.default); // Rutas para proveedores
        this.app.use('/api/cash-registers', cashRegister_1.default); // Rutas para caja
        this.app.use('/api', dailySaleRoutes_1.default); // Añade la nueva ruta
        this.app.use('/api/ingredients', ingredientRoutes_1.default);
        this.app.use('/api/recipes', recipeRoutes_1.default);
    }
    connectToAwsS3() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                require("../config/AwsFileUploas.config");
            }
            catch (error) {
                console.error('Unable to connect to the database:', error);
            }
        });
    }
    connectToDatabase() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                require('../config/db');
                console.log('Connection has been established successfully.');
            }
            catch (error) {
                console.error('Unable to connect to the database:', error);
            }
        });
    }
    start() {
        this.app.listen(this.port, '0.0.0.0', () => {
            console.log(`Servidor escuchando en el puerto ${this.port}`);
        });
    }
}
exports.Server = Server;
