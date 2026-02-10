import jwt from "jsonwebtoken";
import dotenv from "dotenv"
dotenv.config()

if(!process.env.JWT_SECRET_123){
    throw new error("Key is missing")
}
console.log("key" , process.env.JWT_SECRET_123);

export const accessToken =(userExist)=>{ return jwt.sign({userId:userExist._id , role:userExist.role ,  email:userExist.email} ,process.env.JWT_SECRET_123 , {expiresIn:"50min"} )}
