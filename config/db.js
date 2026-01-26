import mongoose from "mongoose";
import logger from "./logger.js";


export const Mongo_Db_Connection = async() => {
    try {
        if (!process.env.MONGO_URI) {
            throw new Error("Db string is missing")
        }
        await mongoose.connect(process.env.MONGO_URI).then(()=>{
            logger.info("Database Connected Successfully ✨")
        })
    } catch (error) {
        console.error("Mongo Db Failed to connect 😥" , error);  
        logger.error("Mongo Db Failed to connect 😥" , error);  
    }
}
