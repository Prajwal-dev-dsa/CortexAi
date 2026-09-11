import express from "express";
import { deductCredits, updateUserPayment } from "../controllers/payment.controller.js";

const paymentRouter = express.Router();

paymentRouter.post("/update-user-payment", updateUserPayment);
paymentRouter.post("/deduct-credits", deductCredits);

export default paymentRouter;