"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const products_1 = require("../controllers/products");
const jwtMiddleware_1 = require("../middleware/jwtMiddleware"); // Asegúrate de importar los middlewares necesarios
const router = express_1.default.Router();
router.post('/:companyId', jwtMiddleware_1.verifyToken, products_1.createProduct);
router.get('/', products_1.getAllProducts);
router.get('/company/:id', products_1.getAllCompanyProducts);
router.get('/company/sysadmin/:companyId', [jwtMiddleware_1.verifyToken, jwtMiddleware_1.validarSysAdmin], products_1.getAllProductsOfCompanyForSysadmin); // Nueva ruta
router.get('/:id', products_1.getProductById);
router.put('/:id', products_1.updateProduct);
router.delete('/:id', products_1.deleteProduct);
router.get('/search/:empresaId', products_1.searchProducts);
exports.default = router;
