import mongoose from 'mongoose'

const userSchema = new mongoose.Schema({
    name:{
        type:String
    },
    email:{
        type:String
    },
    password:{
        type:String
    },
    role:{
        type:String,
        enum:['developer' , 'tester']
    }
},
{
    timestamps:true
})

userSchema.index({email:1} , {unique:true});

export const userModel = mongoose.model('User' , userSchema)
