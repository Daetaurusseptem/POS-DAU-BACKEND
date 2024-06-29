import AWS from 'aws-sdk';
import { S3Client, DeleteObjectCommand } from '@aws-sdk/client-s3';
import multer from 'multer';
import multerS3 from 'multer-s3';
import { Request, Response } from 'express';
import User from "../models-mongoose/User";
import Empresa from "../models-mongoose/Company";
import Product from "../models-mongoose/Products";

// Configuración de AWS
AWS.config.update({
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    region: 'us-east-2'
});

const s3 = new S3Client({
    region: 'us-east-2',
    credentials: {
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
        accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    }
});

// Configuración de multer-s3
const upload = multer({
    storage: multerS3({
        s3: s3,
        bucket: 'poscconor',
        key: function (req: Request, file, cb) {
            const tipo = req.params.tipo; // Tipo de archivo (usuario, producto, empresa)
            const id = req.params.id; // ID de MongoDB
            const nombreArchivo = `${Date.now().toString()}-${file.originalname}`;
            const rutaArchivo = `img/${tipo}/${id}/${nombreArchivo}`;
            cb(null, rutaArchivo);
        }
    })
});

// Controlador de carga
export const subirArchivo = (req: Request, res: Response) => {
    const singleUpload = upload.single('img');

    singleUpload(req, res, async function (error) {
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
                    const user = await User.findById(id);
                    urlImagenActual = user ? user.img : null;
                    if (!user) {
                        return res.status(404).json({ error: 'Usuario no encontrado' });
                    }
                    user.img = url;
                    await user.save();
                    break;
                case 'empresas':
                    const empresa = await Empresa.findById(id);
                    urlImagenActual = empresa ? empresa.img : null;
                    if (!empresa) {
                        return res.status(404).json({ error: 'Empresa no encontrada' });
                    }
                    empresa.img = url;
                    await empresa.save();
                    break;
                case 'productos':
                    const producto = await Product.findById(id);
                    urlImagenActual = producto ? producto.img : null;
                    if (!producto) {
                        return res.status(404).json({ error: 'Producto no encontrado' });
                    }
                    producto.img = url;
                    await producto.save();
                    break;
                default:
                    return res.status(400).json({ error: 'Tipo no válido' });
            }

            const bucketUrl = "https://poscconor.s3.us-east-2.amazonaws.com/";
            const keyImagenActual = urlImagenActual ? urlImagenActual.replace(bucketUrl, '') : null;

            // Después de cargar la nueva imagen y actualizar la base de datos
            if (keyImagenActual) {
                await eliminarImagenS3('poscconor', keyImagenActual);
            }

            return res.status(200).json({
                mensaje: 'Archivo subido y URL actualizada con éxito',
                url: url
            });

        } catch (dbError) {
            return res.status(500).json({ error: 'Error al actualizar la base de datos', dbError });
        }
    });
};

const eliminarImagenS3 = async (bucket: string, key: string) => {
    const deleteParams = {
        Bucket: bucket,
        Key: key,
    };
    try {
        await s3.send(new DeleteObjectCommand(deleteParams));
        console.log(`Archivo ${key} eliminado con éxito`);
    } catch (err) {
        console.error("Error al eliminar archivo:", err);
    }
};