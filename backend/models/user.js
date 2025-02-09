import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    email:{
        type:String,
        required:true,
        unique:true
    },
    name:{
        type:String,
        required:true
    },
    password:{
        type:String,
        required:true,
        minlength:8
    },
    address:{
        type:String
    },
    phone:{
        type:Number,
        unique:true,
        minlength:10,
        maxlength:10
    }

});

const User = new mongoose.model("userSchema",userSchema);
export default User;