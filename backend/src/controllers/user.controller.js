import httpStatus from "http-status";
import { User } from "../models/user.model.js";
import bcrypt from "bcrypt";
import crypto from "crypto";
import { Meeting } from "../models/meeting.model.js"
import { sendOtpEmail } from "../utils/mailer.js";

// Step 1 — Send OTP
export const sendResetOtp = async (req, res) => {
    const { username } = req.body;

    if (!username || typeof username !== "string") {
        return res.status(400).json({ message: "Email is required." });
    }

    try {
        const user = await User.findOne({ username });
        if (!user) {
            // Don't reveal if user exists — send generic response
            return res.status(200).json({ message: "If this email exists, an OTP has been sent." });
        }

        // Generate 6-digit OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const expiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

        user.resetOtp = await bcrypt.hash(otp, 10); // hash before storing
        user.resetOtpExpiry = expiry;
        user.resetOtpVerified = false;
        await user.save();

        await sendOtpEmail(username, otp);

        return res.status(200).json({ message: "OTP has been sent to your email. Check your inbox." });
    } catch (e) {
        console.error("Send OTP Error:", e);

        // Check if it's an email configuration error
        if (e.message && e.message.includes("not configured")) {
            return res.status(500).json({ message: "Email service is not configured. Please contact admin." });
        }

        // Check for Gmail auth errors
        if (e.code === 'EAUTH' || e.responseCode === 535) {
            return res.status(500).json({ message: "Email authentication failed. Please contact admin." });
        }

        return res.status(500).json({ message: "Failed to send email. Please try again later." });
    }
};

// Step 2 — Verify OTP
export const verifyResetOtp = async (req, res) => {
    const { username, otp } = req.body;

    if (!username || !otp) {
        return res.status(400).json({ message: "Email and OTP are required." });
    }

    try {
        const user = await User.findOne({ username });
        if (!user || !user.resetOtp || !user.resetOtpExpiry) {
            return res.status(400).json({ message: "Invalid or expired OTP." });
        }

        if (user.resetOtpExpiry < new Date()) {
            return res.status(400).json({ message: "OTP has expired. Please request a new one." });
        }

        const isMatch = await bcrypt.compare(otp, user.resetOtp);
        if (!isMatch) {
            return res.status(400).json({ message: "Incorrect OTP." });
        }

        // Mark OTP as verified — allow password reset
        user.resetOtpVerified = true;
        await user.save();

        return res.status(200).json({ message: "OTP verified successfully." });
    } catch (e) {
        return res.status(500).json({ message: "Something went wrong." });
    }
};

// Step 3 — Reset Password
export const resetPassword = async (req, res) => {
    const { username, newPassword } = req.body;

    if (!username || !newPassword) {
        return res.status(400).json({ message: "Email and new password are required." });
    }
    if (typeof newPassword !== "string" || newPassword.length < 6 || newPassword.length > 128) {
        return res.status(400).json({ message: "Password must be between 6 and 128 characters." });
    }

    try {
        const user = await User.findOne({ username });

        if (!user || !user.resetOtpVerified) {
            return res.status(403).json({ message: "OTP not verified. Please complete verification first." });
        }

        if (user.resetOtpExpiry < new Date()) {
            return res.status(400).json({ message: "Session expired. Please restart the process." });
        }

        user.password = await bcrypt.hash(newPassword, 10);

        // Clear all OTP fields
        user.resetOtp = undefined;
        user.resetOtpExpiry = undefined;
        user.resetOtpVerified = false;

        await user.save();

        return res.status(200).json({ message: "Password reset successfully." });
    } catch (e) {
        return res.status(500).json({ message: "Something went wrong." });
    }
};

// Meeting codes: exactly 10 lowercase alphanumeric characters
const MEETING_CODE_REGEX = /^[a-z0-9]{10}$/;

const login = async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ message: "Email and password are required." });
    }
    if (typeof username !== 'string' || username.length > 50) {
        return res.status(400).json({ message: "Invalid email." });
    }
    if (typeof password !== 'string' || password.length > 128) {
        return res.status(400).json({ message: "Invalid password." });
    }

    try {
        const user = await User.findOne({ username });
        if (!user) {
            return res.status(httpStatus.NOT_FOUND).json({ message: "User not found." });
        }
        const isPasswordCorrect = await bcrypt.compare(password, user.password);
        if (!isPasswordCorrect) {
            return res.status(httpStatus.UNAUTHORIZED).json({ message: "Invalid email or password." });
        }
        const token = crypto.randomBytes(20).toString("hex");
        user.token = token;
        await user.save();
        return res.status(httpStatus.OK).json({ token });
    } catch (e) {
        return res.status(500).json({ message: "Something went wrong." });
    }
};

const register = async (req, res) => {
    const { name, username, password } = req.body;

    if (!name || !username || !password) {
        return res.status(400).json({ message: "Name, email, and password are required." });
    }
    if (typeof name !== 'string' || name.length > 50) {
        return res.status(400).json({ message: "Name must be 50 characters or fewer." });
    }
    if (typeof username !== 'string' || username.length > 50) {
        return res.status(400).json({ message: "Email must be 50 characters or fewer." });
    }
    if (typeof password !== 'string' || password.length < 6 || password.length > 128) {
        return res.status(400).json({ message: "Password must be between 6 and 128 characters." });
    }

    try {
        const existingUser = await User.findOne({ username });
        if (existingUser) {
            return res.status(httpStatus.FOUND).json({ message: "Email already registered." });
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new User({ name, username, password: hashedPassword });
        await newUser.save();
        return res.status(httpStatus.CREATED).json({ message: "User registered successfully." });
    } catch (e) {
        return res.status(500).json({ message: "Something went wrong." });
    }
};

const getUserHistory = async (req, res) => {
    const {token} = req.query;
    try{
        const user = await User.findOne({token: token});
        const meetings = await Meeting.find({user_id: user.username});
        res.json(meetings)
    } catch (e) {
        res.json({message: `Something went wrong ${e}`})
    }
}

const addToHistory = async (req, res) => {
    const { token, meetingCode } = req.body;

    if (!token || !meetingCode) {
        return res.status(400).json({ message: "Token and meeting code are required." });
    }
    if (!MEETING_CODE_REGEX.test(meetingCode)) {
        return res.status(400).json({ message: "Invalid meeting code format." });
    }

    try {
        const user = await User.findOne({ token });
        if (!user) return res.status(httpStatus.UNAUTHORIZED).json({ message: "Invalid session." });

        const newMeeting = new Meeting({ user_id: user.username, meetingCode });
        await newMeeting.save();
        return res.status(httpStatus.CREATED).json({ message: "Added to history." });
    } catch (e) {
        return res.status(500).json({ message: "Something went wrong." });
    }
};

const getProfile = async (req, res) => {
    const { token } = req.query;
    try {
        const user = await User.findOne({ token });
        if (!user) {
            return res.status(httpStatus.NOT_FOUND).json({ message: "User not found" });
        }
        res.status(httpStatus.OK).json({ name: user.name, username: user.username });
    } catch (e) {
        res.status(500).json({ message: `Something went wrong ${e}` });
    }
};

export {login, register, getUserHistory, addToHistory, getProfile};