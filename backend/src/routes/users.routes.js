import {Router} from "express";
import { addToHistory, getUserHistory, login, register, getProfile } from "../controllers/user.controller.js";
import passport from "../config/passport.js";
import { sendResetOtp, verifyResetOtp, resetPassword } from "../controllers/user.controller.js";


const router = Router();

router.route("/login").post(login);
router.route("/register").post(register);
router.route("/add_to_activity").post(addToHistory);
router.route("/get_all_activity").get(getUserHistory);
router.route("/profile").get(getProfile);
router.route("/forgot-password/send-otp").post(sendResetOtp);
router.route("/forgot-password/verify-otp").post(verifyResetOtp);
router.route("/forgot-password/reset").post(resetPassword);


// Add these routes
router.get("/auth/google",
  passport.authenticate("google", { scope: ["profile", "email"], session: false })
);

router.get("/auth/google/callback",
  passport.authenticate("google", { session: false, failureRedirect: "/auth?error=google_failed" }),
  (req, res) => {
    // Redirect to frontend with token
    res.redirect(`http://localhost:5173/auth/google/success?token=${req.user.token}`);
  }
);

export default router;
