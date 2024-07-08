import { Router } from 'express';
import { subirArchivo } from '../controllers/fileupload';

const router = Router();

router.put('/:tipo/:id', subirArchivo);

export default router;
