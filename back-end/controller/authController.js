import User from "../models/User.js";
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'


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


       
        const user = await User.findOne({
            email
        }).select("+password");

        if(!user || !password === user.password){
            return res.status(401).json({
                success:false,
                message: "Invalid email or password"
            })
        }

        const token  = jwt.sign(
            {
                id: user._id,
                role: user.role
            },
            process.env.JWT_SECRET , 
            {
                expiresIn : "1d"
            }
        );

        res.cookie("access_token", token,{
            httpOnly: true,
            sameSite: "strict",
            maxAge:24 *60*60*1000
        });

        return res.status(200).json({
            success:true,
            message: "Login successfull",
            user:{
                id:user._id,
               // name: user.name,
                email:user.email,
                role:user.role
            }
        })




    }catch(error){
        res.status(500).json({
            success: false,
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
