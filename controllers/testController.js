import { featureModel } from "../model/feature.js";
import { testCaseModel } from "../model/testCase.js";



export const createTestCase = async(req,res)=>{
    try {
        const{ featureId , testId , description , status , actualResult , expectedResult , testType}=req.body
        const id= await featureModel.findById(featureId)
        console.log("ProjectId" , id.projectId);
        
        const newTest = new testCaseModel({
            projectId:id.projectId,
            featureId,
            testId,
            description,
            status,
            actualResult,
            expectedResult,
            testType
        })

        await newTest.save()
        return res.status(200).json({
            success:true,
            message:"Test Case created",
            data:newTest
        })


    } catch (error) {
        console.log("Error" , error);
        logger.error("Error" , error)
        return res.status(500).json({success:false , message:"Internal server error"})
    }
} 

export const updateTestCase = async(req,res)=>{
    try {
        const{id}=req.params
        const exist= await testCaseModel.findById(id)
        console.log("Test Case" , exist);
        if (!exist) {
            return res.status(404).json({success:false , message:"Test Case not found"})
        }

        const updatedTestCase = await testCaseModel.findByIdAndUpdate(id , {$set:req.body} , {new:true , runValidators:true})
        return res.status(201).json({
            success:true,
            message:"Test Case updated",
            data:updatedTestCase
        })
        
    } catch (error) {
        console.log("Error" , error);
        logger.error("Error" , error);
        return res.status(500).json({success:false , message:"Internal server error"})
    }
}

export const getTestCasesByFeatureId = async(req,res)=>{
    try {
        const{id}=req.params
        const exist=await testCaseModel.find({featureId:id})
        if (!exist) {
            return res.status(404).json({success:false , message:"Test cases not found against this feature"})
        }
        return res.status(200).json({
            success:true,
            message:"Get test cases successfully",
            data:{Length:exist.length , testCases:exist}
        })
        
    } catch (error) {
        console.log("Error" ,error);
        logger.error("Error" ,error);
        return res.status(500).json({success:false , message:"Internal server error"})
    }
}

export const delTestCase = async(req,res)=>{
    try {
        const{id}=req.params
        const exist = await testCaseModel.findById(id)
        if (!exist) {
            return res.status(404).json({success:false , message:"Test case not found"})
        }
        await testCaseModel.findByIdAndDelete(id)
        return res.status(200).json({
            success:true,
            message:"Test case deleted successfully",
        })

    } catch (error) {
        console.log("Eroor" , error);
        logger.error("Error" , error)
        return res.status(500).json({success:false , message:"Internal server error"})
    }
}
