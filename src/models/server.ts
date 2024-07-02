import express, { Application } from 'express';
import mongoose from 'mongoose';
import bodyParser from 'body-parser';
import cors from 'cors';

import productRoutes from '../routes/productRoutes';
import saleRoutes from '../routes/saleRoutes';
import itemRoutes from '../routes/itemRoutes';
import userRoutes from '../routes/userRoutes';
import authRoutes from '../routes/authRoutes';
import companyRoutes from '../routes/companyRoutes';
import fileUploadRoutes from '../routes/fileUploadRoutes';
import subscriptionRoutes from '../routes/subscriptionRoutes';
import suppliersRoutes from '../routes/suppliersRoutes';
import categoriesRoutes from '../routes/categoryRoutes';
import cashRegisterRoutes from '../routes/cashRegister';
import dailySalesRoutes from '../routes/dailySaleRoutes';
import ingredientRoutes from '../routes/ingredientRoutes';
import recipeRoutes from '../routes/recipeRoutes';

export class Server {
  private app: Application;
  private port: string;

  constructor() {
    this.app = express();
    this.connectToDatabase();
    this.connectToAwsS3();
    this.port = process.env.PORT || '3000';

    this.config();
    this.routes();
    this.start();
  }

  private config(): void {
    // Configuración de middlewares
    this.app.use(bodyParser.json());
    this.app.use(cors());
  }

  private routes(): void {
    this.app.use('/api/auth', authRoutes); // Autenticación
    this.app.use('/api/products', productRoutes); // Rutas para productos
    this.app.use('/api/categories', categoriesRoutes); // Rutas para categorias
    this.app.use('/api/sales', saleRoutes); // Rutas para ventas
    this.app.use('/api/users', userRoutes); // Rutas para usuarios
    this.app.use('/api/companies', companyRoutes); // Rutas para compañias
    this.app.use('/api/uploads', fileUploadRoutes); // Rutas para fileUploads
    this.app.use('/api/subs', subscriptionRoutes); // Rutas para stripe subscriptions
    this.app.use('/api/items', itemRoutes); // Rutas para lotes
    this.app.use('/api/suppliers', suppliersRoutes); // Rutas para proveedores
    this.app.use('/api/cash-registers', cashRegisterRoutes); // Rutas para caja
    this.app.use('/api', dailySalesRoutes); // Añade la nueva ruta
    this.app.use('/api/ingredients', ingredientRoutes);
    this.app.use('/api/recipes', recipeRoutes);
  }

  private async connectToAwsS3(): Promise<void> {
    try {
      require("../config/AwsFileUploas.config"); 
    } catch (error) {
      console.error('Unable to connect to the database:', error); 
    }
  }

  private async connectToDatabase(): Promise<void> {
    try { 
      require('../config/db');
      console.log('Connection has been established successfully.');
    } catch (error) {
      console.error('Unable to connect to the database:', error); 
    }
  }

  private start(): void {
    this.app.listen(this.port, () => {
      console.log(`Servidor escuchando en el puerto ${this.port}`);
    });
  }
}
