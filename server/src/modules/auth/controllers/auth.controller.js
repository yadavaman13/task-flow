import bcrypt from 'bcrypt';

import { sendEmailUsingGmailAPI } from '../../../services/mail/gmail.mail.service.js';
import { uploadImageOnImageKit } from '../../../services/image.service.js';

import { findUserByEmail, createUser } from "../../../queries/user.queries.js";
import { getOtpHtml, issueOtp, OTP_PURPOSES } from '../../../utils/otp.utils.js';



export async function register(req, res) {
    try{
        const {name, email, password} = req.body;

        const normalizedEmail = typeof email === "string" ? email.trim().toLowerCase() : '';
        const normalizedName = typeof name === "string" ? name.trim() : '';
        const normalizedPassword = typeof password === "string" ? password.trim() : '';

        if(!normalizedEmail || !normalizedName || !normalizedPassword){
            return res.status(400).json({
                message: "Name, Email and Password are required to create account."
            })
        }

        const existingUser = await findUserByEmail({normalizedEmail});
        if(existingUser){
            return res.status(400).json({
                message: "User already exists with this email."
            })
        }

        const hashedPassword = await bcrypt.hash(normalizedPassword, 10);

        const user = await createUser({normalizedName, normalizedEmail, hashedPassword});

        return res.status(201).json({
            message: "User registered successfully",
            data:{
                name: user.name,
                email: user.email,
                avatar_url: user.avatar_url,
                isVerified: user.isVerified,
                isActive: user.isActive
            }
        })

    } catch(err){
        console.log(err);
    }
}

export async function sendVerificationOtp(req, res) {
    try{
        const {email} = req.body;

        const normalizedEmail = typeof email === 'string' ? email.trim().toLowerCase() : '';

        if(!normalizedEmail){
            return res.status(400).json({
                message: "Please enter email to send verification email"
            })
        }

        const otpResult = issueOtp({email: normalizedEmail, purpose: OTP_PURPOSES.VERIFY_EMAIL, subject: 'Email Verification OTP', buildHtml: getOtpHtml});

        if(!otpResult.ok){
            return res.status(400).json({
                message: "Unable to generate OTP"
            })
        }

        return res.status(200).json({
            message: "Email verification OTP sent successfully"
        });

    } catch(err){
        console.log(err)
    }
}

// export async function verifyOtp(req, res) {
//     const {email, otp} = req.body;

//     const normalizedEmail = typeof email === 'string' ? email.trim().toLowerCase() : '';
//     const normalizedOtp = typeof otp === 'string' ? otp.trim() : '';

//     if(!normalizedEmail || !normalizedOtp){
//         return res.status(400).json({
//             message: "Email and OTP are required to verify email"
//         })
//     }

//     const otpResult = await 
// }