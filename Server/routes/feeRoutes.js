import express from "express";
import {
  createFeeStructure,
  deleteFeeStructure,
  downloadReceipt,
  exportCollectionsExcel,
  exportCollectionsPdf,
  exportStructuresExcel,
  exportStructuresPdf,
  getFeeCollections,
  getFeeStructureById,
  getFeeStructures,
  getPaymentById,
  getReceiptById,
  getStudentFeeSummary,
  recordFeePayment,
  updateFeeStructure,
} from "../controllers/feeController.js";
import authMiddleware from "../middleware/authMiddleware.js";
import {
  feeReadAccess,
  feeWriteAccess,
} from "../middleware/feeAuthorizationMiddleware.js";

const router = express.Router();

router.use(authMiddleware, feeReadAccess);

router.get("/structures/export/pdf", feeWriteAccess, exportStructuresPdf);
router.get("/structures/export/excel", feeWriteAccess, exportStructuresExcel);
router.get("/collections/export/pdf", feeWriteAccess, exportCollectionsPdf);
router.get("/collections/export/excel", feeWriteAccess, exportCollectionsExcel);

router.get("/structures", getFeeStructures);
router.get("/structures/:id", getFeeStructureById);
router.post("/structures", feeWriteAccess, createFeeStructure);
router.put("/structures/:id", feeWriteAccess, updateFeeStructure);
router.delete("/structures/:id", feeWriteAccess, deleteFeeStructure);

router.get("/collections", getFeeCollections);
router.get("/students/:studentId/summary", getStudentFeeSummary);
router.post("/payments", feeWriteAccess, recordFeePayment);
router.get("/payments/:id", getPaymentById);

router.get("/receipts/:id", getReceiptById);
router.get("/receipts/:id/download", feeWriteAccess, downloadReceipt);

export default router;
