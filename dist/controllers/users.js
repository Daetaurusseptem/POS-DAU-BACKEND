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
exports.deleteUser = exports.updateUser = exports.createUser = exports.getUserByIdSoloAdmin = exports.getUserById = exports.getUnassignedAdmins = exports.getAllAdmins = exports.getCompanyAdmin = exports.getAvailableAdmins = exports.getAllUsersOfCompany = exports.getAllNonAdminUsersOfCompany = exports.getNumberUsers = exports.getAllUsers = exports.isCompanyAdmin = void 0;
const User_1 = __importDefault(require("../models-mongoose/User"));
const Company_1 = __importDefault(require("../models-mongoose/Company"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const Company_2 = __importDefault(require("../models-mongoose/Company"));
const isCompanyAdmin = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { companyId, adminId } = req.body;
    const empresaAdmin = yield Company_2.default.find({ adminId });
    if (!empresaAdmin) {
        return res.status(404).json({
            ok: false,
            msg: 'El usuario no tiene permisos en esta empresa'
        });
    }
});
exports.isCompanyAdmin = isCompanyAdmin;
// Controlador para obtener todos los usuarios
const getAllUsers = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const users = yield User_1.default.find({ role: { $in: ['admin', 'user'] } });
        res.json(users);
    }
    catch (error) {
        console.error('Error al obtener usuarios:', error);
        res.status(500).json({ error: 'Error al obtener usuarios' });
    }
});
exports.getAllUsers = getAllUsers;
// Controlador para obtener todos los usuarios
const getNumberUsers = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const numberOfUsers = yield User_1.default.count();
        res.json({
            ok: true,
            numberOfUsers
        });
    }
    catch (error) {
        console.error('Error al obtener usuarios:', error);
        res.status(500).json({ error: 'Error al obtener usuarios' });
    }
});
exports.getNumberUsers = getNumberUsers;
const getAllNonAdminUsersOfCompany = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const adminId = req.params.adminId;
    try {
        // Encuentra la empresa basada en adminId
        const company = yield Company_1.default.findOne({ adminId }).exec();
        if (!company) {
            return res.status(404).send('Empresa no encontrada.');
        }
        // Encuentra todos los usuarios de la empresa, excluyendo al administrador
        const users = yield User_1.default.find({ companyId: company._id, _id: { $ne: adminId } }).exec();
        res.status(200).json({ ok: true, users });
    }
    catch (error) {
        console.error('Error al obtener usuarios de la empresa:', error);
        res.status(500).json({ ok: false, message: `error:${error}` });
    }
});
exports.getAllNonAdminUsersOfCompany = getAllNonAdminUsersOfCompany;
const getAllUsersOfCompany = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const companyId = req.params.companyId;
    //console.log(companyId);
    try {
        // Encuentra todos los usuarios de la empresa, excluyendo al administrador
        const users = yield User_1.default.find({ companyId });
        console.log(users);
        res.status(200).json({ ok: true, users });
    }
    catch (error) {
        console.error('Error al obtener usuarios de la empresa:', error);
        res.status(500).json({ ok: false, message: `error:${error}` });
    }
});
exports.getAllUsersOfCompany = getAllUsersOfCompany;
const getAvailableAdmins = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Obtener todos los IDs de administradores de empresas
        const companyAdminIds = yield Company_1.default.find().distinct('adminId');
        // Obtener todos los usuarios que son administradores y no están en la lista de adminIds
        const availableAdmins = yield User_1.default.find({
            _id: { $nin: companyAdminIds },
            role: 'admin'
        });
        res.status(200).json(availableAdmins);
    }
    catch (error) {
        res.status(500).json({ message: 'Hubo un error' });
    }
});
exports.getAvailableAdmins = getAvailableAdmins;
const getCompanyAdmin = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { adminId } = req.params;
        // Obtener todos los IDs de administradores de empresas
        const company = yield Company_1.default.findOne({ adminId: adminId });
        console.log(company);
        if (!company) {
            return res.status(404).json({
                ok: false,
                msg: 'No se encontro la empresa'
            });
        }
        // Obtener todos los usuarios que son administradores y coinciden con los IDs validados
        return res.status(200).json({
            ok: true,
            company
        });
    }
    catch (error) {
        res.status(500).json({ message: 'Hubo un error' });
    }
});
exports.getCompanyAdmin = getCompanyAdmin;
const getAllAdmins = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const admins = yield User_1.default.find({ role: 'admin' });
        res.status(200).
            json({
            ok: true,
            users: admins
        });
    }
    catch (error) {
        res.status(500).json({ message: 'Hubo un error' });
    }
});
exports.getAllAdmins = getAllAdmins;
const getUnassignedAdmins = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Obtener todos los IDs de administradores de empresas
        const companyAdminIds = yield Company_1.default.find().distinct('adminId');
        // Convertir ObjectIds a cadenas para comparación
        const companyAdminIdsString = companyAdminIds.map(id => id.toString());
        // Obtener todos los usuarios que tienen el rol de 'admin'
        const allAdmins = yield User_1.default.find({ role: 'admin' });
        // Filtrar administradores que no están asignados a ninguna empresa
        const unassignedAdmins = allAdmins.filter(admin => !companyAdminIdsString.includes(admin._id.toString()));
        res.status(200).json({ ok: true, users: unassignedAdmins });
    }
    catch (error) {
        res.status(500).json({ message: 'Hubo un error', error });
    }
});
exports.getUnassignedAdmins = getUnassignedAdmins;
// Controlador para obtener un usuario por su ID
const getUserById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const userId = req.params.id;
    try {
        const user = yield User_1.default.findById(userId);
        if (!user) {
            res.status(404).json({ error: 'Usuario no encontrado' });
            return;
        }
        res.json({ ok: true, user });
    }
    catch (error) {
        console.error('Error al obtener el usuario:', error);
        res.status(500).json({ error: 'Error al obtener el usuario' });
    }
});
exports.getUserById = getUserById;
const getUserByIdSoloAdmin = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const userId = req.params.id;
    try {
        const user = yield User_1.default.findById(userId);
        if (!user) {
            res.status(404).json({ error: 'Usuario no encontrado' });
            return;
        }
        res.json({ ok: true, user });
    }
    catch (error) {
        console.error('Error al obtener el usuario:', error);
        res.status(500).json({ error: 'Error al obtener el usuario' });
    }
});
exports.getUserByIdSoloAdmin = getUserByIdSoloAdmin;
// Controlador para crear un nuevo usuario
const createUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { username, password, name, role, email, companyId } = req.body;
    const userExistsDb = yield User_1.default.findOne({ username: username });
    if (userExistsDb) {
        return res.status(409).json({
            msg: 'Usuario ya existe'
        });
    }
    const hashedPassword = yield bcrypt_1.default.hash(password, 10);
    try {
        const newUser = new User_1.default({
            companyId,
            username,
            password: hashedPassword,
            name,
            role,
            email,
            img: 'no-image'
        });
        const savedUser = yield newUser.save();
        res.json({ savedUser });
    }
    catch (error) {
        console.error('Error al crear el usuario:', error);
        res.status(500).json({ error: `Error al crear el usuario ${error} }` });
    }
});
exports.createUser = createUser;
// Controlador para actualizar un usuario por su ID
const updateUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const userId = req.params.id;
    const { username, password, name, email } = req.body;
    try {
        const updatedUser = yield User_1.default.findByIdAndUpdate(userId, {
            username,
            name,
            email
        }, { new: true });
        if (!updatedUser) {
            res.status(404).json({ error: 'Usuario no encontrado' });
            return;
        }
        res.json(updatedUser);
    }
    catch (error) {
        console.error('Error al actualizar el usuario:', error);
        res.status(500).json({ error: 'Error al actualizar el usuario' });
    }
});
exports.updateUser = updateUser;
// Controlador para eliminar un usuario por su ID
const deleteUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const userId = req.params.id;
    const adminCompany = yield Company_2.default.find({ adminId: userId });
    if (adminCompany.length > 0) {
        return res.status(403).json({ ok: false, msg: 'El elemento tiene referencias asignadas a el, eliminalas!', adminCompany });
    }
    try {
        const deletedUser = yield User_1.default.findByIdAndDelete(userId);
        if (!deletedUser) {
            return res.status(404).json({ error: 'Usuario no encontrado' });
        }
        res.json({ message: 'Usuario eliminado con éxito' });
    }
    catch (error) {
        console.error('Error al eliminar el usuario:', error);
        res.status(500).json({ error: 'Error al eliminar el usuario' });
    }
});
exports.deleteUser = deleteUser;
