import mongoose from "mongoose";

const evidenceSchema =  new mongoose.Schema({
    testCaseId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'testCase'
    },
    fileUrl:{
        type:String
    },
    uploadedBy:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'user'
    }
},{
    timestamps:true
})

export const evidenceModel=mongoose.model('evidence' , evidenceSchema)
