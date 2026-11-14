import express from "express";
import authRoutes from './routes/authRoutes.js';
import connectDB from "./config/db.js";
import dotenv from 'dotenv'
import cookieParser from "cookie-parser";
import adminRoutes from './routes/adminRoutes.js'
import assessmentRoutes from './routes/assessmentRoutes.js'




const app = express();




dotenv.config();
app.use(express.json());
app.use(cookieParser());
app.use("/api/auth",authRoutes);
app.use('/api/admin', adminRoutes);
app.use("/api/assessments",assessmentRoutes);

app.get("/", (req,res)=>{
    res.send("server is running");
})


const startServer = async()=>{
    try{
        await connectDB();
        app.listen(process.env.PORT, ()=>{
            console.log(`Server running on PORT ${process.env.PORT}`)
        })
    }catch(error){
        console.error('Server startup failed ', error.messaage);
        process.exit(1);
    }
}

startServer();