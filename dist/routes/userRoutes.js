"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const users_1 = require("../controllers/users");
const jwtMiddleware_1 = require("../middleware/jwtMiddleware");
const router = (0, express_1.Router)();
// Rutas estáticas
router.get('/', jwtMiddleware_1.verifyToken, jwtMiddleware_1.validarSysAdmin, users_1.getAllUsers);
router.get('/number', jwtMiddleware_1.verifyToken, jwtMiddleware_1.validarSysAdmin, users_1.getNumberUsers);
router.get('/admins/available', jwtMiddleware_1.verifyToken, jwtMiddleware_1.validarSysAdmin, users_1.getAvailableAdmins);
router.get('/company/admins/all', jwtMiddleware_1.verifyToken, jwtMiddleware_1.validarSysAdmin, users_1.getAllAdmins);
router.get('/company/admins/unassigned', jwtMiddleware_1.verifyToken, jwtMiddleware_1.validarSysAdmin, users_1.getUnassignedAdmins);
router.get('/company/admin/:adminId', jwtMiddleware_1.verifyToken, jwtMiddleware_1.validarAdminOrSysAdmin, users_1.getCompanyAdmin);
// Rutas dinámicas con parámetros específicos
router.get('/admins/:companyId/:adminId', jwtMiddleware_1.verifyToken, jwtMiddleware_1.validarSysAdmin, users_1.isCompanyAdmin);
router.get('/company/:adminId', [jwtMiddleware_1.verifyToken, jwtMiddleware_1.validarAdminOrSysAdmin], users_1.getAllNonAdminUsersOfCompany);
router.get('/company/sysadmin/:companyId', [jwtMiddleware_1.verifyToken, jwtMiddleware_1.validarAdminOrSysAdmin], users_1.getAllUsersOfCompany);
// Rutas dinámicas para acciones específicas de un usuario
router.get('/:id', jwtMiddleware_1.verifyToken, jwtMiddleware_1.validarSysAdmin, users_1.getUserById);
router.get('/company/solo/:id', jwtMiddleware_1.verifyToken, jwtMiddleware_1.validarAdmin, jwtMiddleware_1.validarAdminCompany, users_1.getUserByIdSoloAdmin);
router.post('/', jwtMiddleware_1.verifyToken, users_1.createUser);
router.put('/:id', jwtMiddleware_1.verifyToken, [jwtMiddleware_1.verifyToken, jwtMiddleware_1.validarAdminCompany, jwtMiddleware_1.validarAdminOrSysAdmin], users_1.updateUser);
router.delete('/:id', jwtMiddleware_1.verifyToken, jwtMiddleware_1.validarSysAdmin, users_1.deleteUser);
exports.default = router;
