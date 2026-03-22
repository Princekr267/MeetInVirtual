import nodemailer from "nodemailer";

// Verify email credentials are configured
if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.warn("⚠️  EMAIL_USER or EMAIL_PASS not configured in .env file");
    console.warn("⚠️  Forgot password feature will not work until configured");
}

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS  // App password, not your Gmail password
    }
});

// Verify connection on startup (optional)
if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
    transporter.verify((error, success) => {
        if (error) {
            console.error("❌ Email configuration error:", error.message);
        } else {
            console.log("✅ Email server is ready");
        }
    });
}

export const sendOtpEmail = async (toEmail, otp) => {
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
        throw new Error("Email service not configured. Please set EMAIL_USER and EMAIL_PASS in backend/.env");
    }

    try {
        await transporter.sendMail({
            from: `"ConferenceWorld" <${process.env.EMAIL_USER}>`,
            to: toEmail,
            subject: "Your Password Reset OTP",
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 480px; margin: auto;">
                    <h2 style="color: #0088ff;">Password Reset OTP</h2>
                    <p>Use the OTP below to reset your ConferenceWorld password.</p>
                    <div style="
                        font-size: 2.5rem;
                        font-weight: 700;
                        letter-spacing: 12px;
                        color: #0088ff;
                        background: #f0f6ff;
                        padding: 20px;
                        border-radius: 10px;
                        text-align: center;
                        margin: 20px 0;
                    ">${otp}</div>
                    <p style="color: #888;">This OTP expires in <strong>10 minutes</strong>.</p>
                    <p style="color: #888;">If you didn't request this, ignore this email.</p>
                </div>
            `
        });
        console.log(`✉️  OTP email sent to ${toEmail}`);
    } catch (error) {
        console.error("Email sending error:", error.message);
        throw error;
    }
};