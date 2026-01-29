import logger from "../config/logger"
import { userModel } from "../model/user"


export const signUpUser = async(req,res) => {
    try {
        const {name , email , password} = req.body
        const userExist = await userModel.findOne(email)
        if (userExist) {
            return res.status(402).json({success:false , message:"Email already exist"})
        }
        const hash = await bycrpt.hash(password , 10)
        const newUser = new User({
            name,
            email,
            password:hash
        })
        await userModel.save(newUser)

        return res.status(201).json({
            success:true,
            message:{data:{
                name:newUser.name,
                email:newUser.email
            }}
        })

    } catch (error) {
        logger.error("SignUp Error" , error)
        return res.status(500).json({success:false , message:"Internal server error"})
    }
}

export const signInUser = async(req,res)=>{
    try {
        const{email , password} = req.body
        const userExist= await userModel.findOne(email)
        if(!userExist){
            return res.status(404),json({success:false , message:"Invalid credentials"})
        }        

        const pass = bcrypt.compare(password , userExist.password)
        if (!pass || pass === false) {
            return res.status(404).json({success:false , message:"Invalid credentials"})
        }


        return res.status(200).json({
            success:true,
            message:"Login successfully",
            data:userExist
        })


    } catch (error) {
        logger.error("Login Error" , error)
        return res.status(500).json({
            success:false,
            messge:"Internal server error"
        })
    }
}
