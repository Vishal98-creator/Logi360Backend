
import express from "express";

import {  sendOTP,
  verifyOTP,
  logoutUser,
  resendOTP, 
  refreshAccessToken} from "../utils/cognito.js";

const auth = express.Router();

// Start auth (send OTP)
auth.post("/send-otp", async (req, res) => {
  const { phoneNumber } = req.body;
  try {
    const response = await sendOTP(phoneNumber);
    res.json({ message: "OTP sent successfully", session: response.Session });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to send OTP" });
  }
});

auth.post("/resend-otp", async (req, res) => {
  const { phoneNumber } = req.body;
  try {
    const response = await resendOTP(phoneNumber);
    res.json({ message: "OTP resent successfully", session: response.Session });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to resend OTP" });
  }
});

// Verify OTP
auth.post("/verify-otp", async (req, res) => {
  const { phoneNumber, otp, session } = req.body;
  try {
    const response = await verifyOTP(phoneNumber, otp, session);
    res.json({
      message: "OTP verified successfully",
      accessToken: response.AuthenticationResult.AccessToken,
      refreshToken: response.AuthenticationResult.RefreshToken,
      idToken: response.AuthenticationResult.IdToken,
    });
  } catch (err) {
    console.error(err);
    res.status(400).json({ message: "Invalid OTP or expired session" });
  }
});

// Logout
auth.post("/logout", async (req, res) => {
  const { accessToken } = req.body;
  if (!accessToken) {
    return res.status(400).json({ message: "Access token required" });
  }

  try {
    await logoutUser(accessToken);
    res.json({ message: "Logged out successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Logout failed" });
  }
});

auth.post("/refresh-token", async (req, res) => {
  const { refreshToken,phoneNumber } = req.body;
  if (!refreshToken) {
    return res.status(400).json({ message: "Refresh token required" });
  }

  try {
    const response = await refreshAccessToken(refreshToken,phoneNumber);
    res.json({
      message: "Access token refreshed successfully",
      accessToken: response.AccessToken,
      refreshToken: response.RefreshToken,  // You may get a new refresh token as well
      idToken: response.IdToken,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to refresh access token" });
  }
});

export default auth;
