import mongoose from "mongoose";

export const connectDB = async () => {
    await mongoose.connect('mongodb+srv://devjunk29:sGomYLVDOMVcTLhU@cluster0.47q8u.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0').then(()=>console.log("DataBase Connected"));
}