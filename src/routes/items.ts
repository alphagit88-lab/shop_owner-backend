import { Router } from "express";
import * as itemController from "../controllers/itemController";
import { authMiddleware } from "../middleware/authMiddleware";

const router = Router();

router.use(authMiddleware);

router.get("/",    itemController.getAllItems);
router.post("/",   itemController.createItem);
router.put("/:id", itemController.updateItem);
router.delete("/:id", itemController.deleteItem);

export default router;
