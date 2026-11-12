import User from "../models/User.js";
import bcrypt from 'bcrypt'


//login demo
export const loginUser = async(req , res)=>{
    try{
        const {email, password} = req.body;

        if(!email ||!password){
            return res.status(400).json({
                success:false,
                message: "Email and password are required"
            });
        }


        res.status(200).json({
            success:true,
            message: "Login controller working"
        })
    }catch(erroe){
        res.status(500).json({
            sucess: false,
            message: "Internal server error"
        });
    }
}

//registration of new user
export const registerUser = async(req,res) =>{
    try{
        const { email , password} = req.body;

        if(!email  || !password){
            return res.status(400).json({
                success: false,
                message: "All field are required"
            });
        }

    //check for exixting user
        const existingUser = await User.findOne({email});

        if(existingUser){
            return res.status(400).json({
                success:false,
                message: "User already exists"
            });
        }

        //hash  password
        //const hashedPassword = await bcrypt.hash(password,12);

        //create user
        const user = await User.create({
            email,
            password,
            role:"student"
        });

        //send final success response
        res.status(201).json({
            success:true,
            message: "Registration successfull"
        })
    }catch(error){
        console.error("Registration error", error.message);
        res.status(500).json({
            success:false,
            message:"Internal  server error"
        })
    }
}
