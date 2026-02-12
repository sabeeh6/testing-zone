import mongoose from "mongoose";

const testCaseSchema = new mongoose.Schema({
    featureId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'feature'
    },
    projectId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"project"
    },
    testId:{
        type:String
    },  
    description:{
        type:String
    }, 
    status: {
        type: String,
        enum: ['notRun', 'pass', 'fail', 'blocked'],
        default: 'notRun'
    },
    actualResult:{
        type:String
    },
    expectedResult:{
        type:String
    },
    testType:{
        type:String,
        enum:['manual' , 'automation'],
        default:'manual'
    },
    createdBy:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'user'
    }
})

export const testCaseModel=mongoose.model('testCase' , testCaseSchema)
