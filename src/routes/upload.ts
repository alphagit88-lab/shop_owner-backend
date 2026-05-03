import { Router } from "express";
import multer from "multer";
import * as uploadController from "../controllers/uploadController";
import { authMiddleware } from "../middleware/authMiddleware";

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });

router.post("/", authMiddleware, upload.single("file"), uploadController.uploadFile);

export default router;
