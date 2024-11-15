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
  bar_code: string;
  modifications?: {
    name: string;
    extraPrice: number;
    isExclusive?: boolean;
  }[];
}

const itemSchema = new Schema<ItemDocument>({
  name: { type: String, required: true },
  bar_code: { type: String, required: false },
  company: { type: Schema.Types.ObjectId, ref: 'Empresa', required: true },
  product: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
  price: { type: Number, required: true, min: 0 },
  stock: { type: Number, required: true, min: 0 },
  discount: { type: Number, required: true, default: 0, min: 0, max: 100 },
  receivedDate: { type: Date, required: true },
  expirationDate: { type: Date },
  modifications: [
    {
      name: {
        type: String,
        required: true,
        trim: true,
      },
      extraPrice: {
        type: Number,
        required: true,
        min: 0,
      },
      isExclusive: {
        type: Boolean,
        required: false,
        default: false,
      },
    },
  ],
});

export default mongoose.model<ItemDocument>('Item', itemSchema);
