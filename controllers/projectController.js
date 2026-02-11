import { success } from "zod";
import logger from "../config/logger.js";
import { projectModel } from "../model/project.js";


export const  createProject =async(req , res)=>{
    try {
        const {name , description } = req.body
        const newData = new projectModel({
            name,
            description
        })
        await newData.save()
        return res.status(202).json({
            success:true,
            message:"Project created",
            data:newData
        })
        
    } catch (error) {
        console.log("Error" , error);
        logger.error("Error" , error)
        return res.status(500).json({success:false , message:'Internal server error'})
    }
}
 
export const updateProject = async(req,res) => {
    try {
        // const {name , description } = req.body
        const {id} = req.params
        const exist = await projectModel.findById(id)
        console.log("Project" , exist);
        if (!exist) {
            return res.status(404).json({success:false , message:"Project not found"})
        }

        const newProject =await projectModel.findByIdAndUpdate(id , {$set: req.body} , {new:true , runValidators:true})

        return res.status(201).json({
            success:true,
            message:"Project updated",
            data:newProject
        })

    } catch (error) {
        console.log("Error" , error);
        logger.error("Error" , error)
        return res.status(500).json({success:false  , message:"Internal server error"})
    }
}
