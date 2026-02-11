import mongoose from "mongoose"
import logger from "../config/logger.js"
import { featureModel } from "../model/feature.js"


export const createFeature = async(req,res)=>{
    try {
        const{projectId , title , description , priority , type , status}=req.body
        const newFeature = new featureModel({
            projectId,
            title,
            description,
            status,
            type,
            priority
        })
        await newFeature.save()
        return res.status(202).json({
            success:true,
            message:"Feature created",
            data:newFeature
        })
        
    } catch (error) {
        console.log("error" , error);
        logger.error("Error" , error)
        return res.status(500).json({success:false , message:"Internal server error"})
        
    }
}

export const updateFeature = async(req,res) => {
    try {
        const{id}=req.params
        const exist = await featureModel.findById(id)
        console.log("Feature" , exist);
        if (!exist) {
            return res.status(404).json({success:false , message:"Feature not found"})
        }

        const newFeature = await featureModel.findByIdAndUpdate(id , {$set:req.body} , {new:true  , runValidators:true})
        return res.status(201).json({
            success:true,
            message:"Feature updated",
            data:newFeature
        })        
        
    } catch (error) {
        console.log("Error" , error);
        logger.error("Error" , error);
        return res.statsu(500).json({success:false , message:"Internal server error"}) 
    }
}

export const getFeaturesByProjectId  =async(req,res)=>{
    try {
        const{id}=req.params
        const exist = await featureModel.find({projectId:id})
        console.log("Get Project Features" , exist);
        if (!exist) {
            return res.status(404).json({success:false , message:"Features not found against this project"})
        }

        return res.status(200).json({
            success:true,
            nessage:"Features get successfully",
            data:{length:exist.length , Features:exist}
        })
        

    } catch (error) {
        console.log("Error" , error);
        logger.error("Error" , error);
        return res.status(500).json({success:false , message:"Internal server error"})
    }
}

export const deleteFeature =async(req,res)=>
    {
        const session = await mongoose.startSession()
        const transaction = session.startTransaction()
    try {
        
    } catch (error) {
        
    }
}
