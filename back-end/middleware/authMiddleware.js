import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const authMiddleware = async(req,res,next)=>{
    try{
        const token = req.cookies?.access_token;
        console.log("Cookies received:", req.cookies);
        console.log('Token recceived ',!!token);
        if(!token){
            return  res.status(401).json({
                success: false,
                message: "Authentication required"
            })
        }


        const decoded  = jwt.verify(
            token,

            process.env.JWT_SECRET
        )
        console.log("Decoded token:", decoded);


        const user = await User.findById(decoded.id);
        if(!user){
            return res.status(401).json({
                success:false,
                message: "User account not found"
            })
        }

        req.user = {
            id:user._id,
            role:user.role
        }
        next();
    }catch(error){
        console.error("Auth middleware error ",error)
         return res.status(401).json({
            success: false,
            message: "Invalid or expired token."
           
        });
    }
}

export default authMiddleware;