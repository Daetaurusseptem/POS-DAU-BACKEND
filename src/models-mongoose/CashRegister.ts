
import mongoose, { Document, Schema } from 'mongoose';

export interface CashRegisterDocument extends Document {
  user: mongoose.Types.ObjectId;
  startDate: Date;
  endDate: Date;
  initialAmount: number;
  finalAmount: number;
  payments: {
    cash: number;
    credit: number;
    debit: number;
  };
  sales: mongoose.Types.ObjectId[];
  notes: string;
  closed: boolean;
}

const cashRegisterSchema: Schema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  startDate: {
    type: Date,
    required: true,
    default: Date.now,
  },
  endDate: {
    type: Date,
    required: true,
    default: Date.now, 
  },
  initialAmount: {
    min:0,
    type: Number,
    required: true,
  },
  finalAmount: {
    min:0,
    type: Number,
    required: true,
  },
  payments: {
    cash: {
      type: Number,
      required: true,
      default: 0,
      min:0
    },
    credit: {
      type: Number,
      required: true,
      default: 0,
      min:0
    },
    debit: {
      type: Number,
      required: true,
      default: 0,
      min:0,
    },
  },
  sales: [{
    type: Schema.Types.ObjectId,
    ref: 'Sale',
  }],
  notes: {
    type: String,
    default: ''
  },
  closed: {
    type: Boolean,
    default: false
  }
});

export default mongoose.model<CashRegisterDocument>('CashRegister', cashRegisterSchema);
