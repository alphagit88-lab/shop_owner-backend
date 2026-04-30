import { Router } from "express";
import { getSettings, updateSetting } from "../controllers/settingController";
import { authMiddleware } from "../middleware/authMiddleware";

const router = Router();

router.get("/", authMiddleware, getSettings);
router.post("/", authMiddleware, updateSetting);
router.get("", authMiddleware, getSettings);
router.post("", authMiddleware, updateSetting);

export default router;
