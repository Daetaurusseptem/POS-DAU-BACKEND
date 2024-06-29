import mongoose, { Schema, Document } from 'mongoose';

export interface SaleDocument extends Document {
  user: mongoose.Types.ObjectId;
  date: Date;
  total: number;
  discount: number;
  productsSold: {
    paymentMethod: any;
    productId: mongoose.Types.ObjectId;
    quantity: number;
    unitPrice: number;
    subtotal: number;
  }[];
  paymentMethod: 'cash' | 'credit';
  paymentReference?: string;
  receivedAmount?: number;
  change?: number;
}

const saleSchema = new Schema<SaleDocument>({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User', // Referencia al modelo de usuario
    required: true,
  },
  date: {
    type: Date,
    required: true,
    default: Date.now,
  },
  total: {
    type: Number,
    required: true,
  },
  discount: {
    type: Number,
    required: true,
  },
  productsSold: [
    {
      productId: {
        type: mongoose.Types.ObjectId,
        ref: 'Product',
        required: true,
      },
      quantity: {
        type: Number,
        required: true,
        min: 1,
      },
      unitPrice: {
        type: Number,
        required: true,
      },
      subtotal: {
        type: Number,
        required: true,
      },
    },
  ],
  paymentMethod: {
    type: String,
    enum: ['cash', 'credit'],
    required: true,
  },
  paymentReference: {
    type: String,
  },
  receivedAmount: {
    type: Number,
  },
  change: {
    type: Number,
  },
});

export default mongoose.model<SaleDocument>('Sale', saleSchema);
