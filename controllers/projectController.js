import { success } from "zod";
import logger from "../config/logger.js";
import { projectModel } from "../model/project.js";
import mongoose from "mongoose";
import { featureModel } from "../model/feature.js";


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

export const deleteProject= async(req,res)=>{
    const session =await mongoose.startSession()
     session.startTransaction()
    try {
        const {id}=req.params
        const exist = await projectModel.findById(id).session(session)
        if (!exist) {
            await session.abortTransaction()
            await session.endSession()
            return res.status(404).json({success:false , message:"Project not found"})
        }
        const delRelatedFeatures = await featureModel.deleteMany({projectId:id}).session(session)
        const delRelatedTestCases = await testCaseModel.deleteMany({projectId:id}).session(session)
        const delProject = await projectModel.findByIdAndDelete(id).session(session)

        await session.commitTransaction()
        await session.endSession()
        return res.status(200).json({
            success:true,
            message:"Project and data related to that project deleted successfully"
        })


    } catch (error) {
        await session.abortTransaction()
        await session.endSession()
        console.log("Error" , error);
        logger.error("Error" , error);
        return res.status(500).json({success:false , message:"Internal server error"})
        
    }
}

export const getAllProjects = async(req,res)=>{
    try {
        const projects = await projectModel.find()
        console.log("All Projects" , projects);
        if (!projects) {
            return res.status(404).json({success:false , message:"Projects not found"})
        }
        return res.status(200).json({
            success:true,
            message:"Projects fetch successfully",
            data:projects
        })
        
    } catch (error) {
        console.log("Error" , error);
        logger.error("Error" , error)
        return res.status(500).json({success:false , message:"Internal server error"})
    }
}
