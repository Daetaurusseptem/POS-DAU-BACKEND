// backend/config/database.ts
import mongoose, { Connection } from 'mongoose';

// URL de conexión a la base de datos MongoDB

const dbURL = `mongodb+srv://${process.env.USUARIO}:${process.env.PASSWORD}@cluster0.dly0m.mongodb.net/POS-CCONOR?retryWrites=true&w=majority&appName=Cluster0` ;
// Configuración de conexión

// Conexión a la base de datos MongoDB 
const connection = mongoose.connect(dbURL)
.then(r=>{
    console.log("Mongo database connection established");
})
.catch(err =>{
    console.log("Mongo database connection error");
})

export default connection;
  