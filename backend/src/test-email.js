/**
 * Email Configuration Test Script
 * Run this to verify your EMAIL_USER and EMAIL_PASS are configured correctly
 *
 * Usage: node src/test-email.js
 */

import 'dotenv/config';
import nodemailer from "nodemailer";

console.log("\n🔍 Testing Email Configuration...\n");

// Check if environment variables are set
console.log("📧 EMAIL_USER:", process.env.EMAIL_USER ? `${process.env.EMAIL_USER} ✅` : "❌ NOT SET");
console.log("🔑 EMAIL_PASS:", process.env.EMAIL_PASS ? "********** ✅" : "❌ NOT SET");

if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.log("\n❌ ERROR: Email credentials not configured!");
    console.log("\nTo fix this:");
    console.log("1. Go to https://myaccount.google.com/apppasswords");
    console.log("2. Generate a new app password for 'Mail'");
    console.log("3. Update backend/.env with:");
    console.log("   EMAIL_USER=your-email@gmail.com");
    console.log("   EMAIL_PASS=xxxx xxxx xxxx xxxx");
    process.exit(1);
}

console.log("\n📨 Creating email transporter...");

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

console.log("✅ Transporter created");
console.log("\n🔌 Verifying connection to Gmail...");

transporter.verify((error, success) => {
    if (error) {
        console.log("\n❌ Connection FAILED!");
        console.error("Error:", error.message);

        if (error.code === 'EAUTH') {
            console.log("\n💡 This means your email or app password is incorrect.");
            console.log("\nSteps to fix:");
            console.log("1. Make sure EMAIL_USER is your full Gmail address");
            console.log("2. Make sure EMAIL_PASS is a Gmail App Password (NOT your Gmail password)");
            console.log("3. Generate a new app password at: https://myaccount.google.com/apppasswords");
        }

        process.exit(1);
    } else {
        console.log("✅ Connection successful!");
        console.log("\n📧 Sending test email...");

        // Send test email
        transporter.sendMail({
            from: `"Test" <${process.env.EMAIL_USER}>`,
            to: process.env.EMAIL_USER, // Send to yourself
            subject: "Test Email from ConferenceWorld",
            html: `
                <h2>✅ Email Configuration Successful!</h2>
                <p>Your email service is working correctly.</p>
                <p>Sent at: ${new Date().toLocaleString()}</p>
            `
        }, (err, info) => {
            if (err) {
                console.log("❌ Failed to send test email");
                console.error("Error:", err.message);
                process.exit(1);
            } else {
                console.log("✅ Test email sent successfully!");
                console.log("📬 Check your inbox at:", process.env.EMAIL_USER);
                console.log("\n🎉 Email configuration is working perfectly!");
                console.log("You can now use the forgot password feature.\n");
                process.exit(0);
            }
        });
    }
});
