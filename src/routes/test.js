// src/utils/cognito.js
require("dotenv").config();
const crypto = require("crypto");
const {
  CognitoIdentityProviderClient,
  AdminCreateUserCommand,
  InitiateAuthCommand,
  RespondToAuthChallengeCommand,
  GlobalSignOutCommand,
  GetUserCommand,
} = require("@aws-sdk/client-cognito-identity-provider");

const client_id = process.env.COGNITO_CLIENT_ID;
const client_secret = process.env.COGNITO_CLIENT_SECRET;
const region = process.env.AWS_REGION;
const user_pool_id = process.env.COGNITO_USER_POOL_ID;

const cognitoClient = new CognitoIdentityProviderClient({ region });

function getSecretHash(username, clientId, clientSecret) {
  return crypto
    .createHmac("SHA256", clientSecret)
    .update(username + clientId)
    .digest("base64");
}

const registerUsersToCognito = async (users) => {
  for (const user of users) {
    const phoneNumber = user.phoneNumber;

    const params = {
      UserPoolId: user_pool_id,
      Username: phoneNumber,
      UserAttributes: [
        { Name: "phone_number", Value: phoneNumber },
        { Name: "phone_number_verified", Value: "true" },
      ],
      DesiredDeliveryMediums: ["SMS"],
    };

    try {
      const command = new AdminCreateUserCommand(params);
      await cognitoClient.send(command);
      console.log(`✅ Registered: ${phoneNumber}`);
    } catch (err) {
      if (err.name === "UsernameExistsException") {
        console.log(`⚠️ Already exists: ${phoneNumber}`);
      } else {
        console.error(`❌ Failed for ${phoneNumber}:`, err.message);
      }
    }
  }
};

const sendOTP = async (phoneNumber) => {
  const params = {
    AuthFlow: "CUSTOM_AUTH",
    ClientId: client_id,
    AuthParameters: {
      USERNAME: phoneNumber,
      SECRET_HASH: getSecretHash(phoneNumber, client_id, client_secret),
    },
  };
  const command = new InitiateAuthCommand(params);
  return cognitoClient.send(command);
};

const verifyOTP = async (phoneNumber, otp, session) => {
  const params = {
    ClientId: client_id,
    ChallengeName: "CUSTOM_CHALLENGE",
    Session: session,
    ChallengeResponses: {
      USERNAME: phoneNumber,
      ANSWER: otp,
      SECRET_HASH: getSecretHash(phoneNumber, client_id, client_secret),
    },
  };
  const command = new RespondToAuthChallengeCommand(params);
  return cognitoClient.send(command);
};

const logoutUser = async (accessToken) => {
  const command = new GlobalSignOutCommand({ AccessToken: accessToken });
  return cognitoClient.send(command);
};

const verifyAccessToken = async (accessToken) => {
  const command = new GetUserCommand({ AccessToken: accessToken });
  return cognitoClient.send(command);
};

module.exports = {
  registerUsersToCognito,
  sendOTP,
  verifyOTP,
  logoutUser,
  verifyAccessToken,
};
