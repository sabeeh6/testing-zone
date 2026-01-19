import mongoose from "mongoose";
import logger from "./logger.js";


export const DB = async() => {
    try {
        if (!process.env.MONGO_URI) {
            throw new Error("Db string is missing")
        }
        await mongoose.connect(process.env.MONGO_URI).then(()=>{
            console.log("Database Connected Successfully ✨")
            logger.info("Database Connected")  
        })
    } catch (error) {
        console.error("Mongo Db Failed to connect 😥" , error);      
    }
}
