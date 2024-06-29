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
const aws_sdk_1 = __importDefault(require("aws-sdk"));
const client_s3_1 = require("@aws-sdk/client-s3");
const multer_1 = __importDefault(require("multer"));
const multer_s3_1 = __importDefault(require("multer-s3"));
const User_1 = __importDefault(require("../models-mongoose/User"));
const Company_1 = __importDefault(require("../models-mongoose/Company"));
const Products_1 = __importDefault(require("../models-mongoose/Products"));
// Configuración de AWS
aws_sdk_1.default.config.update({
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    region: 'us-east-2'
});
const s3 = new client_s3_1.S3Client({
    region: 'us-east-2',
    credentials: {
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    }
});
// Configuración de multer-s3
const upload = (0, multer_1.default)({
    storage: (0, multer_s3_1.default)({
        s3: s3,
        bucket: 'poscconor',
        key: function (req, file, cb) {
            const tipo = req.params.tipo; // Tipo de archivo (usuario, producto, empresa)
            const id = req.params.id; // ID de MongoDB
            const nombreArchivo = `${Date.now().toString()}-${file.originalname}`;
            const rutaArchivo = `img/${tipo}/${id}/${nombreArchivo}`;
            cb(null, rutaArchivo);
        }
    })
});
// Controlador de carga
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
                const url = req.file.location;
                const { tipo, id } = req.params;
                let urlImagenActual;
                switch (tipo) {
                    case 'usuarios':
                        const user = yield User_1.default.findById(id);
                        urlImagenActual = user ? user.img : null;
                        if (!user) {
                            return res.status(404).json({ error: 'Usuario no encontrado' });
                        }
                        user.img = url;
                        yield user.save();
                        break;
                    case 'empresas':
                        const empresa = yield Company_1.default.findById(id);
                        urlImagenActual = empresa ? empresa.img : null;
                        if (!empresa) {
                            return res.status(404).json({ error: 'Empresa no encontrada' });
                        }
                        empresa.img = url;
                        yield empresa.save();
                        break;
                    case 'productos':
                        const producto = yield Products_1.default.findById(id);
                        urlImagenActual = producto ? producto.img : null;
                        if (!producto) {
                            return res.status(404).json({ error: 'Producto no encontrado' });
                        }
                        producto.img = url;
                        yield producto.save();
                        break;
                    default:
                        return res.status(400).json({ error: 'Tipo no válido' });
                }
                const bucketUrl = "https://poscconor.s3.us-east-2.amazonaws.com/";
                const keyImagenActual = urlImagenActual ? urlImagenActual.replace(bucketUrl, '') : null;
                // Después de cargar la nueva imagen y actualizar la base de datos
                if (keyImagenActual) {
                    yield eliminarImagenS3('poscconor', keyImagenActual);
                }
                return res.status(200).json({
                    mensaje: 'Archivo subido y URL actualizada con éxito',
                    url: url
                });
            }
            catch (dbError) {
                return res.status(500).json({ error: 'Error al actualizar la base de datos', dbError });
            }
        });
    });
};
exports.subirArchivo = subirArchivo;
const eliminarImagenS3 = (bucket, key) => __awaiter(void 0, void 0, void 0, function* () {
    const deleteParams = {
        Bucket: bucket,
        Key: key,
    };
    try {
        yield s3.send(new client_s3_1.DeleteObjectCommand(deleteParams));
        console.log(`Archivo ${key} eliminado con éxito`);
    }
    catch (err) {
        console.error("Error al eliminar archivo:", err);
    }
});
