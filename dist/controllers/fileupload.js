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
exports.subirArchivo = void 0;
const firebase_1 = require("../config/firebase");
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const User_1 = __importDefault(require("../models-mongoose/User"));
const Company_1 = __importDefault(require("../models-mongoose/Company"));
const Products_1 = __importDefault(require("../models-mongoose/Products"));
// Configurar multer para manejar la subida en memoria
const storage = multer_1.default.memoryStorage();
const upload = (0, multer_1.default)({ storage });
// Controlador para subir archivos
const subirArchivo = (req, res) => {
    const singleUpload = upload.single('img');
    singleUpload(req, res, function (error) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                if (error) {
                    return res.status(500).json({ error: error.message });
                }
                if (!req.file) {
                    return res.status(400).json({ error: 'Archivo no encontrado' });
                }
                const { tipo, id } = req.params;
                const nombreArchivo = `${Date.now()}-${path_1.default.basename(req.file.originalname)}`;
                const file = firebase_1.bucket.file(`img/${tipo}/${id}/${nombreArchivo}`);
                const stream = file.createWriteStream({
                    metadata: {
                        contentType: req.file.mimetype,
                    },
                });
                stream.on('error', (err) => {
                    console.error('Error subiendo archivo a Firebase', err);
                    return res.status(500).json({ error: 'Error subiendo archivo a Firebase', err });
                });
                stream.on('finish', () => __awaiter(this, void 0, void 0, function* () {
                    const url = yield file.getSignedUrl({
                        action: 'read',
                        expires: '03-01-2500'
                    });
                    let urlImagenActual;
                    // Aquí se actualiza la base de datos
                    switch (tipo) {
                        case 'usuarios':
                            const user = yield User_1.default.findById(id);
                            urlImagenActual = user ? user.img : null;
                            if (!user) {
                                return res.status(404).json({ error: 'Usuario no encontrado' });
                            }
                            user.img = url[0];
                            yield user.save();
                            break;
                        case 'empresas':
                            const empresa = yield Company_1.default.findById(id);
                            urlImagenActual = empresa ? empresa.img : null;
                            if (!empresa) {
                                return res.status(404).json({ error: 'Empresa no encontrada' });
                            }
                            empresa.img = url[0];
                            yield empresa.save();
                            break;
                        case 'productos':
                            const producto = yield Products_1.default.findById(id);
                            urlImagenActual = producto ? producto.img : null;
                            if (!producto) {
                                return res.status(404).json({ error: 'Producto no encontrado' });
                            }
                            if (producto.isComposite === undefined) {
                                producto.isComposite = false;
                            }
                            producto.img = url[0];
                            yield producto.save();
                            break;
                        default:
                            return res.status(400).json({ error: 'Tipo no válido' });
                    }
                    if (urlImagenActual) {
                        const keyImagenActual = urlImagenActual.split('/').pop();
                        yield eliminarImagenFirebase(`img/${tipo}/${id}/${keyImagenActual}`);
                    }
                    return res.status(200).json({
                        mensaje: 'Archivo subido y URL actualizada con éxito',
                        url: url[0]
                    });
                }));
                stream.end(req.file.buffer);
            }
            catch (dbError) {
                return res.status(500).json({ error: 'Error al actualizar la base de datos', dbError });
            }
        });
    });
};
exports.subirArchivo = subirArchivo;
const eliminarImagenFirebase = (key) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const file = firebase_1.bucket.file(key);
        yield file.delete();
    }
    catch (err) {
        console.error("Error al eliminar archivo:", err);
    }
});
