
import User from "../models/User.js";
import bcrypt from "bcrypt";

// CREATE FACULTY
export const createFaculty = async (req, res) => {
    try {
        const { name, email, password } = req.body;

        // Validate input
        if ( !email || !password) {
            return res.status(400).json({
                success: false,
                message: "All fields are required"
            });
        }

        const normalizedEmail = email.trim().toLowerCase();

        // Check existing user
        const existingUser = await User.findOne({
            email: normalizedEmail
        });

        if (existingUser) {
            return res.status(409).json({
                success: false,
                message: "Email already registered"
            });
        }

        // Hash password
       // const hashedPassword = await bcrypt.hash(password, 12);

        // Create faculty
        const faculty = await User.create({
            name,
            email: normalizedEmail,
            password,
            role: "faculty"
        });

        return res.status(201).json({
            success: true,
            message: "Faculty account created successfully",
            faculty: {
                id: faculty._id,
                name: faculty.name,
                email: faculty.email,
                role: faculty.role
            }
        });

    } catch (error) {
        console.error("Create faculty error:", error.message);

        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};



export const getAllFaculty = async(req,res)=>{
    try{


        const facultyList  = await User.find({
            role:'faculty'
        }).select("name email role isActive createdAt")
          .sort({createdAt: -1});

        return res.status(200).json({
            success:true,
            count: facultyList.length,
            faculty:facultyList
        });
    }catch(error){
        console.error('Get faculty error', error.message);
          return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }

}


