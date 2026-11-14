import express from 'express';
import { loginUser, registerUser } from '../controller/authController.js';
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/login",loginUser);
router.post("/register", registerUser);


// Temporary protected route for testing
router.get("/profile", authMiddleware, (req, res) => {
    return res.status(200).json({
        success: true,
        message: "Authentication successful",
        user: req.user
    });
});


export  default router;