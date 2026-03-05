import mongoose, { mongo } from "mongoose";


const projectSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    },
    name:{
        type:String
    },
    description:{
        type:String
    },
    developers:{
        type:[String]
    },
    testers:{
        type:[String]
    },
    status:{
        type:String,
        enum:['active' , 'inReview' , 'completed' , 'pending' , 'blocked'],
        default:'pending'
    },
    createdBy:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'user'
    },
    updatedBy:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'user'
    }
},{
    timestamps:true
})

export const projectModel =mongoose.model('project' , projectSchema)
