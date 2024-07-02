// src/models/product.model.ts
import mongoose, { Schema, Document } from 'mongoose';
import { SaleDocument } from './Sales'; // Importa el modelo de ventas

// Definición de la interfaz para el documento de producto
export interface ProductDocument extends Document {


  img: string;
  name: string;
  description?: string;
  marca: string;
  supplier: Schema.Types.ObjectId;
  company: Schema.Types.ObjectId;
  recipe: Schema.Types.ObjectId;
  categories: Schema.Types.ObjectId[];
  
}


// Esquema del modelo de producto
const productSchema = new Schema<ProductDocument>({

  img: {
    type: String,
    default: ''
  },
  name: {
    type: String,
    required: true,
    index: true
  },

  marca: {
    type: String
  },
  description: String,
  company: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Empresa',
    required: true,
  },
  supplier: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Supplier',
    required: true,
  },
  categories: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category'
  }],
  recipe:[{
    type:mongoose.Schema.Types.ObjectId,
    ref:'Recipe'
  }]
});
// Esquema del modelo de lote (si decides implementarlo)


// Modelo de producto
const Product = mongoose.model<ProductDocument>('Product', productSchema);

export default Product;
