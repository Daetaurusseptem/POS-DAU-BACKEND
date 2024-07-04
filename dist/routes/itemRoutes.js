"use strict";
// src/routes/ItemRoutes.ts
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const itemsController_1 = require("../controllers/itemsController");
const jwtMiddleware_1 = require("../middleware/jwtMiddleware");
const router = express_1.default.Router();
router.post('/:empresaId', itemsController_1.createItem);
router.get('/:empresaId', jwtMiddleware_1.verifyToken, jwtMiddleware_1.validarEmpresaUsuario, itemsController_1.getItems);
router.get('/', itemsController_1.getAllItems);
router.get('/company/:companyId', itemsController_1.getAllCompanyItemsPagination);
router.get('/company/sysadmin/:companyId', [jwtMiddleware_1.verifyToken, jwtMiddleware_1.validarAdminOrSysAdmin], itemsController_1.getAllCompanyItemsPagination);
router.get('/item/:id', itemsController_1.getItemById);
router.put('/:id', itemsController_1.updateItem);
router.delete('/:id', itemsController_1.deleteItem);
router.get('/by-category/:companyId', [jwtMiddleware_1.verifyToken], itemsController_1.getItemsByCategory);
exports.default = router;
