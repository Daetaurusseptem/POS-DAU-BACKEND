import { admin, bucket } from '../config/firebase';
import { Request, Response } from 'express';
import multer from 'multer';
import path from 'path';
import User from "../models-mongoose/User";
import Empresa from "../models-mongoose/Company";
import Product from "../models-mongoose/Products";

// Configurar multer para manejar la subida en memoria
const storage = multer.memoryStorage();
const upload = multer({ storage });

// Controlador para subir archivos
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

      const { tipo, id } = req.params;
      const nombreArchivo = `${Date.now()}-${path.basename(req.file.originalname)}`;
      const file = bucket.file(`img/${tipo}/${id}/${nombreArchivo}`);

      const stream = file.createWriteStream({
        metadata: {
          contentType: req.file.mimetype,
        },
      });

      stream.on('error', (err) => {
        console.error('Error subiendo archivo a Firebase', err);
        return res.status(500).json({ error: 'Error subiendo archivo a Firebase', err });
      });
 
      stream.on('finish', async () => {
        const url = await file.getSignedUrl({
          action: 'read',
          expires: '03-01-2500'
        });

        let urlImagenActual;

        // Aquí se actualiza la base de datos
        switch (tipo) {
          case 'usuarios':
            const user = await User.findById(id);
            urlImagenActual = user ? user.img : null;
            if (!user) {
              return res.status(404).json({ error: 'Usuario no encontrado' });
            }
            user.img = url[0];
            await user.save();
            break;
          case 'empresas':
            const empresa = await Empresa.findById(id);
            urlImagenActual = empresa ? empresa.img : null;
            if (!empresa) {
              return res.status(404).json({ error: 'Empresa no encontrada' });
            }
            empresa.img = url[0];
            await empresa.save();
            break;
          case 'productos':
            const producto = await Product.findById(id);
            urlImagenActual = producto ? producto.img : null;
            if (!producto) {
              return res.status(404).json({ error: 'Producto no encontrado' });
            }

            if (producto.isComposite === undefined) {
              producto.isComposite = false;
            }

            producto.img = url[0];
            await producto.save();
            break;
          default:
            return res.status(400).json({ error: 'Tipo no válido' });
        }

        if (urlImagenActual) {
          const keyImagenActual = urlImagenActual.split('/').pop();
          await eliminarImagenFirebase(`img/${tipo}/${id}/${keyImagenActual}`);
        }

        return res.status(200).json({
          mensaje: 'Archivo subido y URL actualizada con éxito',
          url: url[0]
        });
      });

      stream.end(req.file.buffer);

    } catch (dbError) {
      return res.status(500).json({ error: 'Error al actualizar la base de datos', dbError });
    }
  });
};

const eliminarImagenFirebase = async (key: string) => {
    try {
        const file = bucket.file(key);
        await file.delete();
        console.log(`Archivo ${key} eliminado con éxito`);
    } catch (err) {
        console.error("Error al eliminar archivo:", err);
    }
};