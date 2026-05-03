import { Router } from "express";
import * as customerController from "../controllers/customerController";
import { authMiddleware } from "../middleware/authMiddleware";

const router = Router();

router.use(authMiddleware);

router.get("/",  customerController.getAllCustomers);
router.post("/", customerController.createCustomer);
router.get("/:id", customerController.getCustomerById);
router.put("/:id", customerController.updateCustomer);
router.delete("/:id", customerController.deleteCustomer);

export default router;
