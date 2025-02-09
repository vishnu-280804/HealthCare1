import express from'express';
import {signin,signup,logout,check,verifyOtp,sendEmail} from "../controllers/auth.controller.js"
const router = express.Router();

router.post("/signup",signup);
router.post("/signin",signin);
router.post("/logout",logout);
router.get("/check",check);
router.post("/verify-otp", verifyOtp); // OTP verification route
router.post("/send-email",sendEmail);

export default router;