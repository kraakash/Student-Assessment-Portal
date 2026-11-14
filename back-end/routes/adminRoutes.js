import express from "express";
import { createFaculty,getAllFaculty } from "../controller/adminController.js";
import authMiddleware from "../middleware/authMiddleware.js";
import authorizeRoles from "../middleware/roleMiddleware.js";


const router = express.Router();

router.post(
    "/create-faculty",
    authMiddleware,
    authorizeRoles("admin"),
    createFaculty
);

router.get(
    "/faculty",
    authMiddleware,
    authorizeRoles("admin"),
    getAllFaculty
);


export default router;