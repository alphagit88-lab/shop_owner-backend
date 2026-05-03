import { Router } from "express";
import * as receiptController from "../controllers/receiptController";
import { authMiddleware } from "../middleware/authMiddleware";

const router = Router();

// router.use(authMiddleware);

router.get("/",          receiptController.getAllReceipts);
router.get("/:no",       receiptController.getReceipt);
router.get("/:no/pdf",   receiptController.downloadReceiptPdf);
router.post("/:no/email", receiptController.sendReceiptEmail);

export default router;
