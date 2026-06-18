import express from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import authMiddleware from "../middleware/authMiddleware.js";
import {
  createSchoolProfile,
  getSchoolProfile,
  updateSchoolProfile,
  deleteSchoolProfile,
} from "../controllers/schoolProfileController.js";

const router = express.Router();

// Ensure uploads directory exists
const uploadDir = "./uploads";
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Multer storage configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(
      null,
      file.fieldname +
        "-" +
        uniqueSuffix +
        path.extname(file.originalname)
    );
  },
});

// Multer file filter to validate JPEG, JPG, PNG, WEBP and reject others (PDF, DOC, ZIP, RAR, etc.)
const fileFilter = (req, file, cb) => {
  const allowedExtensions = [".jpg", ".jpeg", ".png", ".webp"];
  const ext = path.extname(file.originalname).toLowerCase();

  if (!allowedExtensions.includes(ext)) {
    return cb(new Error("Invalid file format"), false);
  }
  cb(null, true);
};

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
  fileFilter: fileFilter,
});

// Mount Routes

// GET /api/school-profile
router.get("/", authMiddleware, getSchoolProfile);

// POST /api/school-profile
router.post("/", authMiddleware, createSchoolProfile);

// PUT /api/school-profile/:id
router.put("/:id", authMiddleware, updateSchoolProfile);

// DELETE /api/school-profile/:id
router.delete("/:id", authMiddleware, deleteSchoolProfile);

// POST /api/school-profile/upload
router.post(
  "/upload",
  authMiddleware,
  (req, res, next) => {
    // Perform Admin Role check early before upload parses body if possible, or inside multer callback
    if (req.user?.role !== "Admin") {
      return res.status(403).json({
        success: false,
        message: "Only Admin Can Access This Resource",
      });
    }

    upload.single("image")(req, res, (err) => {
      // If auth payload wasn't Admin, return 403
      if (req.user?.role !== "Admin") {
        return res.status(403).json({
          success: false,
          message: "Only Admin Can Access This Resource",
        });
      }

      if (err) {
        if (err.code === "LIMIT_FILE_SIZE") {
          return res.status(400).json({
            success: false,
            message: "File size must be less than 5MB",
          });
        }
        return res.status(400).json({
          success: false,
          message: err.message || "Invalid file format",
        });
      }
      next();
    });
  },
  (req, res) => {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No file uploaded",
      });
    }

    // Construct URL path
    const fileUrl = `/uploads/${req.file.filename}`;

    // Return message based on upload type (logo, banner, favicon)
    const type = req.body.type || "file";
    let message = "Logo Uploaded Successfully";
    if (type === "banner") {
      message = "Banner Uploaded Successfully";
    } else if (type === "favicon") {
      message = "Favicon Uploaded Successfully";
    } else if (type === "logo") {
      message = "Logo Uploaded Successfully";
    }

    res.status(200).json({
      success: true,
      message,
      data: {
        url: fileUrl,
      },
    });
  }
);

export default router;
