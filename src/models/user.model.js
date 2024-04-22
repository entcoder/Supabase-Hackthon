import {mongoose, Schema} from "mongoose"
import bcrypt from "bcrypt"

const userSchema= new Schema({

    email:{
        type: String,
        required: [true, "email is required"],
        unique: true
    },
    userName:{
        type: String,
        required: true
    },
    password:{
        type: String
    }

},{timestamps: true})


userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) {
      next();
    }
  
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
  });

export const User= mongoose.model("User",userSchema)