import { User } from "../models/user.model.js";
import { generateToken } from "../utils/createToken.js";
import bcrypt from "bcrypt"

const signUp = async (req, res) => {
    const { email, userName, password } = req.body;

    try {
        const existingUser = await User.findOne({ email });

        if (existingUser) {
            return res.status(400).json({ message: "User already exists" });
        }

        const user = await User.create({
            email,
            userName,
            password
        });

        generateToken(res, user._id);

        return res.status(201).json({ message: "User registered successfully", user });
    } catch (error) {
        // Handle any errors here
        console.error("Error during sign up:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};

const signIn=async (req,res)=>{
    try {
        
        const {email,password}=req.body

        if(!password || !email){
            return res.status(404).json({message: "All fields are required"})
        }

        const user= await User.findOne({email})
        if(!user){
            return res.status(404).json({message: "Incorrect email or password"})
        }

        const auth= await bcrypt.compare(password,user.password)
        
        if(!auth){
            return res.status(404).json({message: "Incorrect email or password"})
        }

        const token= generateToken(res, user._id);

        res.cookie("token", token, {
            withCredentials: true,
            httpOnly: true,
          });

        res.status(201).json({message: "User logged in successfully"})



        
    } catch (error) {
        console.log(error)
    }
}

export { signUp, signIn };
