import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import{
    createAcademicYear,
    deleteAcademicYear,
    getAcademicYear,
    setCurrentAcademicYear,
    updateAcademicYear,
} from "../controllers/academicYearController.js"

const router=express.Router();

router.post(
    "/create",
    authMiddleware,
    createAcademicYear
)
router.get(
    "/",
    authMiddleware,
    getAcademicYear
)
router.put(
  "/set-current/:id",
  authMiddleware,
  setCurrentAcademicYear
);
router.put(
  "/:id",
  authMiddleware,
  updateAcademicYear
);
router.delete(
    "/:id",
    authMiddleware,
    deleteAcademicYear
)


export default router