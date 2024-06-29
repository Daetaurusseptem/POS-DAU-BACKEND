import mongoose, { Schema, Document } from 'mongoose';


interface recipe extends Document {

    name: string;
    description: string;
    company: Schema.Types.ObjectId;

}

const recipeSchema = new Schema({
    name: { 
        type: 'string', 
        required: true },
        
    description: { 
        type: 'string', 
        required: true },

    company: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Empresa',
        required: true,
    },

});

const Recipe = mongoose.model<recipe>('Recipe', recipeSchema);

export default Recipe;
export { recipe };