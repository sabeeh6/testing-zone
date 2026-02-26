import {v2 as cloudinary} from 'cloudinary'
import dotenv from "dotenv"
dotenv.config()

console.log("Cloud" , process.env.Cloudinary_Key_Name_456);
if(!process.env.Cloudinary_Key_Name_456 || !process.env.Cloudinary_API_Key_Name_456 || !process.env.Cloudinary_Secret_Key_Name_456){
    throw new Error("Cloudinary credentials are not set");
}

cloudinary.config({
    cloud_name:process.env.Cloudinary_Key_Name_456,
    api_key:process.env.Cloudinary_API_Key_Name_456,
    api_secret:process.env.Cloudinary_Secret_Key_Name_456
})

export const Cloud = cloudinary
