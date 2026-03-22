import { Schema, mongoose } from "mongoose";

const userSchema = new Schema(
    {
        name: {
            type: String,
            required: true,
        },
        username: {
            type: String,
            required: true,
            unique: true
        },
        password: {
            type: String,
            required: true
        },
        token: {
            type: String
        },
        googleId: { 
            type: String, 
            sparse: true 
        },
        resetOtp: {
            type: String
        },
        resetOtpExpiry: {
            type: Date
        },
        resetOtpVerified: {
            type: Boolean,
            default: false
        }
    }
)

const User = mongoose.model("User", userSchema);
export {User};