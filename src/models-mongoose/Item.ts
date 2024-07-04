import mongoose, { Schema, Document } from 'mongoose';

export interface ItemDocument extends Document {
  name: string;
  product: Schema.Types.ObjectId;
  stock: number;
  price: number;
  expirationDate?: Date;
  discount: number;
  receivedDate: Date;
  company: Schema.Types.ObjectId;
}

const itemSchema = new Schema<ItemDocument>({
  name: { type: String, required: true },
  company: { type: Schema.Types.ObjectId, ref: 'Empresa', required: true },
  product: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
  price: { type: Number, required: true, min:0 },
  stock: { type: Number, required: true, min: 0 },
  discount: { type: Number, required: true, default: 0, min: 0, max: 100 },
  receivedDate: { type: Date, required: true },
  expirationDate: { type: Date }
});

export default mongoose.model<ItemDocument>('Item', itemSchema);
