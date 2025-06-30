// src/routes/auth.js
const express = require("express");
const {
  registerUsersToCognito,
  initiateAuth,
  respondToAuthChallenge,
  logoutUser,
} = require("../utils/cognito");
const { User } = require("../prisma/client"); // adjust this if you're using Prisma or another ORM

const auth = express.Router();

// Register existing DB users to Cognito
auth.post("/register-db-users", async (req, res) => {
  try {
    const users = await User.findMany(); // for Prisma
    await registerUsersToCognito(users);
    res.json({ message: "Users registered to Cognito." });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to register users." });
  }
});

// Start auth (send OTP)
auth.post("/send-otp", async (req, res) => {
  const { phoneNumber } = req.body;
  try {
    const response = await initiateAuth(phoneNumber);
    res.json({ message: "OTP sent successfully", session: response.Session });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to send OTP" });
  }
});

// Verify OTP
auth.post("/verify-otp", async (req, res) => {
  const { phoneNumber, otp, session } = req.body;
  try {
    const response = await respondToAuthChallenge(phoneNumber, otp, session);
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

module.exports = auth;
