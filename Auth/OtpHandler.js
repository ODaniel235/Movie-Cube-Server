import nodemailer from 'nodemailer'
import dotenv from "dotenv";
import userModel from "../Schema/UserSchema.js";
dotenv.config();
// Function to generate a random OTP
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000); // Generates a 6-digit OTP
};
let otpUsed = "None";

// Function to send OTP via email
const sendOTPByEmail = async (email, otp) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.SMTPUSER, // Your Gmail email address
      pass: process.env.SMTPPASSWORD, // Your Gmail app password
    },
  });

  const mailOptions = {
    from: "Dan <noreply@gmail.com>",
    to: email,
    subject: "One-Time Password (OTP) for Verification",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; background-color: #f4f4f4; border-radius: 10px; padding: 20px; box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);">
  <h2 style="color: #333; text-align: center; margin-bottom: 20px;">One-Time Password (OTP) for Verification</h2>
  <div style="background-color: #fff; border-radius: 5px; padding: 20px; box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);">
    <p style="color: #333; font-size: 18px;">Your OTP is: <strong style="color: #f44336;">${otp}</strong></p>
    <p style="color: #666; font-size: 16px;">This OTP will expire in 1 minute. Please use it to verify your identity.</p>
  </div>
</div>

    `,
  };

  await transporter.sendMail(mailOptions);
};

// Function to send OTP and handle expiration
const sendOTPAndExpire = async (email) => {
  try {
    const otp = generateOTP();
    console.log(otpUsed);
    otpUsed = otp;
    console.log(otpUsed);
    await sendOTPByEmail(email, otp);

    // Expire OTP after 1 minute
    setTimeout(() => {
      otpUsed = "Expired";
      console.log("OTP expired:", otp);
      console.log(otpUsed);
    }, 60000);

    return otp;
  } catch (error) {
    console.error("Error sending OTP:", error);
    throw new Error("Failed to send OTP");
  }
};

//Function to verify OTPMail
const verifyFunction = (InputtedOtp, sentOtp) => {
  //checking if inputted OTP is same as sent OTP before expiration
  const isOtpValid = InputtedOtp === sentOtp;
  const isValid = typeof sentOtp === "number";
  const isEverythingValid = isOtpValid && isValid ? true : false;
  return isEverythingValid;
};
export const CheckOtp = async (req, res) => {
  const url = req.url.split("?");
  const usedUrl = url[1];
  try {
    const { otp } = req.body;
    if (!otp) {
      res.status(400).json({ message: "Please provide the given otp" });
    } else {
      const checkIfValid = verifyFunction(otp, otpUsed);
      if (!checkIfValid) {
        res.status(400).json({ message: "Otp is invalid or expired" });
      } else {
        const user = await userModel.findOne({ email: usedUrl });
        user.verified = true;
        await user.save();
        res.status(200).json({ message: "Account verified" });
      }
    }
  } catch (error) {
    res.status(500).json({ message: error });
  }
};

export const sendOTPMail = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      res.status(400).json({ message: "Please input an email address" });
    } else {
      sendOTPAndExpire(email)
        .then((otp) => {
          res.status(200).json({ message: "otp sent successfully", otp });
        })
        .catch((err) => {
          res.status(500).json({ err });
        });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
