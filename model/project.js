import mongoose, { mongo } from "mongoose";


const projectSchema = new mongoose.Schema({
    name:{
        type:String
    },
    description:{
        type:String
    },
    // status:{
    //     type:String,
    //     enum:['active'],
    //     default:'active'
    // },
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
