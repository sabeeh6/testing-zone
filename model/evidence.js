import mongoose from "mongoose";

const evidenceSchema =  new mongoose.Schema({
    testCaseId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'testCase'
    },
    fileUrl:{
        type:[String],
        required:true
    },
    filePublicId: {   // cloudinary public_id for delete/update
      type: [String],
      required: true
    },
    fileType: {       // image, pdf, video etc
      type: [String],
      required: true
    },
    uploadedBy:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'user'
    }
},{
    timestamps:true
})

export const evidenceModel=mongoose.model('evidence' , evidenceSchema)
