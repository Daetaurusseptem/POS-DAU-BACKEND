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
exports.renewToken = exports.login = void 0;
const User_1 = __importDefault(require("../models-mongoose/User"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const jwt_helper_1 = require("../helpers/jwt-helper");
const menu_1 = require("../helpers/menu");
const Company_1 = __importDefault(require("../models-mongoose/Company"));
const login = (req, resp) => __awaiter(void 0, void 0, void 0, function* () {
    const { username, password } = req.body;
    try {
        const usuarioDB = yield User_1.default.findOne({ username }).select('+password');
        if (!usuarioDB) {
            return resp.status(404).json({
                ok: false,
                msg: 'Datos no validos'
            });
        }
        const validPassword = bcrypt_1.default.compareSync(password, usuarioDB.password);
        if (!validPassword) {
            return resp.status(400).json({
                ok: false,
                msg: 'password invalido'
            });
        }
        const token = yield (0, jwt_helper_1.generarJWT)(usuarioDB._id);
        return resp.status(200).json({
            ok: true,
            token,
            menu: (0, menu_1.getMenuFrontEnd)(usuarioDB.role)
        });
    }
    catch (error) {
        return resp.status(500).json({
            okay: false,
            msg: 'Porfavor hable con el administrador' + error
        });
    }
});
exports.login = login;
const renewToken = (req, resp) => __awaiter(void 0, void 0, void 0, function* () {
    const uid = req.uid;
    const token = yield (0, jwt_helper_1.generarJWT)(uid);
    //return user
    const usuario = yield User_1.default.findById(uid).select('+password');
    if (!usuario) {
        return resp.status(404).json({
            ok: false,
            msg: 'No se encontro el usuario'
        });
    }
    const company = yield Company_1.default.findOne({ adminId: uid });
    return resp.status(200).json({
        ok: true,
        token,
        uid,
        usuario,
        company,
        menu: (0, menu_1.getMenuFrontEnd)(usuario === null || usuario === void 0 ? void 0 : usuario.role)
    });
});
exports.renewToken = renewToken;
