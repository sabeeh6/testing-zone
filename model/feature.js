import mongoose from "mongoose";

const featureSchema = new mongoose.Schema({
    projectId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'project'
    },
    title:{
        type:String
    },
    description:{
        type:String
    },
    priority:{
        type:String,
        enum:['low' , 'normal' , 'high'],
        default:'low'
    },
    type:{
        type:String,
        enum:['functional' , 'compliance' , 'security' , 'UI'],
        default:'functional'
    },
    status:{
        type:String,
        enum:['notDone' ,'inDiscussion' , 'pending' , 'done' ],
        default:'pending'
    },
},{
    timestamps:true
})

export const featureModel= mongoose.model('feature' , featureSchema)
