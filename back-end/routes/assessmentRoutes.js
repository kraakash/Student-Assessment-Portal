import express from "express";
import { 
    createAssessment,
    getMyAssessments,
    getAssessmentById,
    publishAssessment,
    getAvailableAssessments,
    getStudentAssessmentById,
    submitAssesment,
    getStudentResult,
    getAssessmentAttempts,
    getStudentAttemptDetails,
    updateDraftAssessment,
    deleteDraftAssessment,
    getFacultyDashboard
        } from "../controller/assessmentController.js";
import authMiddleware from "../middleware/authMiddleware.js";
import authorizeRoles from "../middleware/roleMiddleware.js";

const router = express.Router();

router.post(
    "/",
    authMiddleware,
    authorizeRoles("faculty"),
    createAssessment
);

router.get(
    '/my-assessments',
    authMiddleware,
    authorizeRoles("faculty"),
    getMyAssessments
)
router.get(
    "/available",
    authMiddleware,
    authorizeRoles("student"),
    getAvailableAssessments
);

router.get(
    "/:id",
    authMiddleware,
    authorizeRoles("faculty"),
    getAssessmentById
);

router.patch(
    "/:id/publish",
    authMiddleware,
    authorizeRoles("faculty"),
    publishAssessment
)
router.get(
    "/student/:id",
    authMiddleware,
    authorizeRoles("student"),
    getStudentAssessmentById
);


router.post(
    "/:id/submit",
    authMiddleware,
    authorizeRoles("student"),
    submitAssesment
);

router.get(
    "/:id/result",
    authMiddleware,
    authorizeRoles("student"),
    getStudentResult
);


router.get(
  "/:id/attempts/:attemptId",
  authMiddleware,
  authorizeRoles("faculty"),
  getStudentAttemptDetails
);
router.get(
  "/:id/attempts",
  authMiddleware,
  authorizeRoles("faculty"),
  getAssessmentAttempts
);


router.patch(
  "/:id",
  authMiddleware,
  authorizeRoles("faculty"),
  updateDraftAssessment
);

router.delete(
  "/:id",
  authMiddleware,
  authorizeRoles("faculty"),
  deleteDraftAssessment
);

router.get(
  "/faculty/dashboard",
  authMiddleware,
  authorizeRoles("faculty"),
  getFacultyDashboard
);


export default router;