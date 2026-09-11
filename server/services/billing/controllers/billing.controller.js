import { PLANS } from "../config/plans.js"
import razorpayInstance from "../config/razorpay.js"
import paymentModel from "../models/payment.model.js"
import crypto from "crypto"
import axios from "axios"

export const createOrder = async (req, res) => {
    try {
        const { plan } = req.body
        const userId = req.headers["x-user-id"]
        const selectedPlan = PLANS[plan]
        if (!selectedPlan) {
            return res.status(400).json({ message: "Invalid plan" })
        }
        const order = await razorpayInstance.orders.create({
            amount: selectedPlan.amount * 100,
            currency: "INR",
            receipt: `${userId}_${selectedPlan.plan}_${Date.now()}`
        })

        await paymentModel.create({
            userId,
            plan: selectedPlan.plan,
            amount: selectedPlan.amount,
            credits: selectedPlan.credits,
            currency: order.currency,
            receipt: order.receipt,
            orderId: order.id,
            status: "pending"
        })
        res.status(200).json({ message: "Order created successfully", order })
    } catch (error) {
        console.error("Error creating order:", error)
        res.status(500).json(`Error creating order: ${error.message}`)
    }
}

export const verifyPayment = async (req, res) => {
    try {
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body

        if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
            return res.status(400).json({ message: "Missing required fields" })
        }

        const generateSignature = crypto.createHmac("sha256", process.env.RAZORPAY_KEY_SECRET).update(razorpay_order_id + "|" + razorpay_payment_id).digest("hex")

        if (generateSignature !== razorpay_signature) {
            return res.status(400).json({ message: "Payment verification failed" })
        }

        const payment = await paymentModel.findOne({ orderId: razorpay_order_id })
        if (!payment) {
            return res.status(404).json({ message: "Payment not found" })
        }
        payment.status = "paid"
        payment.paymentId = razorpay_payment_id
        await payment.save()

        await axios.post(`${process.env.AUTH_SERVICE_URL}/payment/update-user-payment`, {
            plan: payment.plan,
            credits: payment.credits,
            userId: payment.userId,
        })

        return res.status(200).json({ message: "Payment verified successfully" })
    } catch (error) {
        console.error("Error verifying payment:", error)
        res.status(500).json(`Error verifying payment: ${error.message}`)
    }
}