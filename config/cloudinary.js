import {v2 as cloudinary} from 'Cloudinary'

// console.log("Cloud" , process.env.Cloudinary_Key_Name_456);


cloudinary.config({
    cloud_name:process.env.Cloudinary_Key_Name_456,
    api_key:process.env.Cloudinary_API_Key_Name_456,
    api_secret:process.env.Cloudinary_Secret_Key_Name_456
})

export const Cloud = cloudinary
