import { Router } from "express";
import * as quotationController from "../controllers/quotationController";
import { authMiddleware } from "../middleware/authMiddleware";

const router = Router();

router.use(authMiddleware);

router.get("/",            quotationController.getAllQuotations);
router.get("/:no",         quotationController.getQuotation);
router.post("/",           quotationController.createQuotation);
router.put("/:no",         quotationController.updateQuotation);
router.post("/:no/email",   quotationController.sendQuotationEmail);
router.post("/:no/convert", quotationController.convertToReceipt);

export default router;
