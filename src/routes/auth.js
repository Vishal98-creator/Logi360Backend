const express = require("express");
const { signUpWithPhone, confirmOTP,resendOTP,logoutUser } = require("../utils/cognito");

const auth = express.Router();
const {
  generateAccessToken,
  generateRefreshToken,
} = require("../utils/jwt");

auth.post("/send-otp", async (req, res) => {
  const { phoneNumber } = req.body;

  try {
    const response = await signUpWithPhone(phoneNumber);
    console.log("----The response of the signin is :---->>>",response)
    res.json({ message: "OTP sent successfully" });
  } catch (err) {
    if (err.code === "UsernameExistsException") {
      res.status(409).json({ message: "User already exists" });
    } else {
      console.error(err);
      res.status(500).json({ message: "Failed to send OTP" });
    }
  }
});

auth.post("/verify-otp", async (req, res) => {
  const { phoneNumber, otp } = req.body;

  try {
    const res = await confirmOTP(phoneNumber, otp);
    console.log("-----The response of confirmOTP is :---->>",res);
    const payload = { phoneNumber }; // this will be encoded in token
    const accessToken = generateAccessToken(payload);
    const refreshToken = generateRefreshToken(payload);
   
    res.json({
      message: "OTP verified successfully",
      accessToken: accessToken,
      refreshToken : refreshToken,
    });
  } catch (err) {
    console.error(err);
    res.status(400).json({ message: "Invalid OTP" });
  }
});

auth.post("/resend-otp", async (req, res) => {
  const { phoneNumber } = req.body;

  try {
    await resendOTP(phoneNumber);
    res.json({ message: "OTP resent successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to resend OTP" });
  }
});

auth.post("/logout", async (req, res) => {
  const { accessToken } = req.body;

  if (!accessToken) {
    return res.status(400).json({ message: "Access token is required" });
  }

  try {
    await logoutUser(accessToken);
    res.json({ message: "User logged out successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Logout failed" });
  }
});

auth.post("/refresh-token", async (req, res) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    return res.status(401).json({ message: "Refresh token is required" });
  }

  try {
    const decoded = verifyRefreshToken(refreshToken);
    const newAccessToken = generateAccessToken({ phoneNumber: decoded.phoneNumber });

    res.json({ accessToken: newAccessToken });
  } catch (err) {
    console.error(err);
    res.status(403).json({ message: "Invalid refresh token" });
  }
});

module.exports = auth;
