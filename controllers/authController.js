import logger from "../config/logger.js"
import { userModel } from "../model/user.js"
import bcrypt from 'bcrypt'
import { accessToken } from "./authService.js"
import { setCookies } from "../utils/cookie.js"


export const signUpUser = async(req,res) => {
    try {
        const {name , email , password , role} = req.body
        const userExist = await userModel.findOne({email})
        if (userExist) {
            return res.status(400).json({success:false , message:"Email already exist"})
        }
        const hash = await bcrypt.hash(password , 10)
        
        const newUser = new userModel({
            name,
            email,
            password:hash,
            role
        })
        await newUser.save()

        return res.status(201).json({
            success:true,
            message:{data:{
                name:newUser.name,
                email:newUser.email,
                role:newUser.role
            }}
        })

    } catch (error) {
        console.log("Error" , error);        
        logger.error("SignUp Error" , error)
        return res.status(500).json({success:false , message:"Internal server error"})
    }
}

export const signInUser = async(req,res)=>{
    try {
        const{email , password } = req.body
        const userExist= await userModel.findOne({email})
        if(!userExist){
            return res.status(404),json({success:false , message:"Invalid credentials"})
        }        

        const pass = bcrypt.compare(password , userExist.password)
        if (!pass || pass === false) {
            return res.status(404).json({success:false , message:"Invalid credentials"})
        }
        console.log(userExist._id , userExist.role , userExist.email);
        
        const token=accessToken(userExist)
        console.log("Token" , token);
        const cookie= setCookies(res , token)
        console.log("Cookies" , cookie);

        const {password: _, ...userData} = userExist.toObject()
        return res.status(200).json({
            success:true,
            message:"Login successfully",
            data:{ userData , token:token }
        })


    } catch (error) {
        console.log("Error" , error);        
        logger.error("Login Error" , error)
        return res.status(500).json({
            success:false,
            messge:"Internal server error"
        })
    }
}

