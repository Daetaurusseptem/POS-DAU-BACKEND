import { Response, Request, NextFunction }  from'express';
import User from '../models-mongoose/User';
import Empresa from '../models-mongoose/Company';
const jwt  = require('jsonwebtoken');
 
export const verifyToken = (req : any, resp : Response, next:NextFunction)=>{

    const token = req.header('x-token');


    if(!token){
        return resp.status(401).json({
            ok:false,
            msg:`no hay token en la validacion`
        });
    }

    try {
        
        const {uid} = jwt.verify(token, process.env.JWT);
        
    
        req.uid = uid;

        next();
        
    } catch (error) { 
        return resp.status(401).json({
            ok:false, 
            msg:`token no valido ${error}`
        });
    }

}
export const validarAdminOrSysAdmin = async(req:any, resp:Response, next:any)  => {

    const uid = req.uid;
    
    try {
        
        const usuarioDB = await User.findById(uid );

        if ( !usuarioDB ) {
            return resp.status(404).json({
                ok: false,
                msg: 'Usuario no existe'
            });
        }
        
        if ( usuarioDB.role =='user' ) {
            return resp.status(403).json({
                ok: false,
                msg: 'No tiene privilegios para hacer eso'
            });
        }


        next();


    } catch (error) {
        
        resp.status(500).json({
            ok: false,
            msg: 'Hable con el administrador'
        })
    }

}
export const validarSysAdmin = async(req:any, resp:Response, next:any)  => {

    const uid = req.uid;
    
    try {
        
        const usuarioDB = await User.findById(uid );

        if ( !usuarioDB ) {
            return resp.status(404).json({
                ok: false,
                msg: 'Usuario no existe'
            });
        }

        if ( usuarioDB.get('role') !== 'sysadmin' ) {
            return resp.status(403).json({
                ok: false,
                msg: 'No tiene privilegios para hacer eso'
            });
        }

        next();


    } catch (error) {
        resp.status(500).json({
            ok: false,
            msg: 'Hable con el administrador'
        })
    }

}
export const validarAdmin = async(req:any, resp:Response, next:any)  => {

    const uid = req.uid;
    
    try {
        
        const usuarioDB = await User.findById(uid );

        if ( !usuarioDB ) {
            return resp.status(404).json({
                ok: false,
                msg: 'Usuario no existe'
            });
        }

        if ( usuarioDB.get('role') !== 'admin' ) {
            return resp.status(403).json({
                ok: false,
                msg: 'No tiene privilegios para hacer eso'
            });
        }

        next();


    } catch (error) {
         
        resp.status(500).json({
            ok: false,
            msg: 'Hable con el administrador'
        })
    }

}
export const validarUserCompany = async(req:any, resp:Response, next:any)  => {

    const uid = req.uid;
    const {companyId }  =  req.params
    
    try {
    
        const usuarioDB = await User.findById(uid );

        if ( !usuarioDB ) {
            return resp.status(404).json({
                ok: false, 
                msg: 'Usuario no existe'
            });
        }
        const companyAdminId = await Empresa.findById(companyId);

        if ( usuarioDB.get('role') !== 'user' ) {
            return resp.status(403).json({
                ok: false,
                msg: 'No tiene privilegios para hacer eso'
            });
        }
        if ( !usuarioDB.companyId == uid) {
            return resp.status(403).json({
                ok: false,
                msg: 'No tiene privilegios para hacer eso en esta empresa',
                
            });
        }

        next();


    } catch (error) {
         
        resp.status(500).json({
            ok: false,
            msg: 'Hable con el administrador'
        })
    }

}
export const validarAdminCompany = async(req:any, resp:Response, next:any)  => {

    const uid = req.uid;
    const {companyId }  =  req.params
    
    try {
    
        const usuarioDB = await User.findById(uid );

        if ( !usuarioDB ) {
            return resp.status(404).json({
                ok: false,
                msg: 'Usuario no existe'
            });
        }
        const companyAdminId = await Empresa.findById(companyId);

        if ( usuarioDB.get('role') === 'sysadmin' ) {

            return next();
        }
        if ( usuarioDB.get('role') !== 'admin' ) {
            return resp.status(403).json({
                ok: false,
                msg: 'No tiene privilegios para hacer eso'
            });
        }
        if ( !companyAdminId?.adminId == uid) {
            return resp.status(403).json({
                ok: false,
                msg: 'No tiene privilegios para hacer eso en esta empresa',
                
            });
        }

        next();


    } catch (error) {
         
        resp.status(500).json({
            ok: false,
            msg: 'Hable con el administrador'
        })
    }

}
export const validarEmpresaUsuario = async (req: any, res: Response, next: NextFunction) => {
    const token = req.headers['x-token'];
    
    const { empresaId } = req.params;

    if (!token) {
        return res.status(401).json({
            ok: false,
            msg: 'No token provided'
        });
    }

    try {
        const decoded: any = jwt.verify(token, process.env.JWT);  // Ajusta 'tu_secreto_jwt' según tu configuración
        req.uid = decoded.uid;

        const usuarioDB = await User.findById(req.uid);

        if (!usuarioDB) {
            return res.status(404).json({
                ok: false,
                msg: 'Usuario no existe'
            });
        }
        const empresaDB = await Empresa.findById(empresaId);
        

        if (!empresaDB || !usuarioDB.companyId==empresaId) {
            return res.status(403).json({
                ok: false,
                msg: 'No tiene privilegios para acceder a esta empresa'
            });
        }

        next();
    } catch (error) {
        console.error(error);
        res.status(500).json({
            ok: false,
            msg: 'Token inválido'
        });
    }
};
