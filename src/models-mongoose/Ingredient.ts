import mongoose, { Schema, Document } from 'mongoose';

export interface IngredientDocument extends Document {
  name: string;
  quantity: number;
  priceProvider: number;
  measurement: 'grms' | 'ml' | 'kg' | 'lts';
  provider: Schema.Types.ObjectId;
  expirationDate?: Date;
  receivedDate: Date;
  company: Schema.Types.ObjectId;
}

const ingredientSchema = new Schema<IngredientDocument>({
  name: { type: String, required: true },
  quantity: { type: Number, required: true, min: 0 },
  priceProvider: { min:0,type: Number, required: true },
  measurement: { type: String, enum: ['grms', 'ml', 'kg', 'lts'], required: true },
  provider: { type: Schema.Types.ObjectId, ref: 'Provider', required: true },
  receivedDate: { type: Date, required: true },
  expirationDate: { type: Date },
  company: { type: Schema.Types.ObjectId, ref: 'Company', required: true }
});

export default mongoose.model<IngredientDocument>('Ingredient', ingredientSchema);
