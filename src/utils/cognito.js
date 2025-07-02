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
  AdminGetUserCommand,
} = require("@aws-sdk/client-cognito-identity-provider");

const client_id = process.env.COGNITO_CLIENT_ID;
console.log('client_id: ', client_id);
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

const registerUsersToCognito = async (user) => {
  // for (const user of users) {
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
  // }
};

const sendOTP = async (phoneNumber) => {
  // 1. Check if user already in Cognito
    // const user = await prisma.user.findUnique({
  //   where: { phone: phoneNumber },
  // });

  // if (!user) {
  //   throw new Error("User not found in database");
  // }

  try {
    await cognitoClient.send(
      new AdminGetUserCommand({
        UserPoolId: user_pool_id,
        Username: phoneNumber,
      })
    );
    console.log("✅ User already exists in Cognito", phoneNumber);
  } catch (err) {
    if (err.name === "UserNotFoundException") {
      // 2. Register to Cognito
      const params = {
        UserPoolId: user_pool_id,
        Username: phoneNumber,
        UserAttributes: [
          { Name: "phone_number", Value: phoneNumber },
          { Name: "phone_number_verified", Value: "true" },
        ],
        DesiredDeliveryMediums: ["SMS"],
        MessageAction: "SUPPRESS",
      };
      await cognitoClient.send(new AdminCreateUserCommand(params));
      console.log("✅ User registered to Cognito");
    } else {
      console.error("❌ Failed to get or create user in Cognito:", err);
      throw err;
    }
  }

  // 3. Send OTP via CUSTOM_AUTH flow
  try {
    const params = {
      AuthFlow: "CUSTOM_AUTH",
      ClientId: client_id,
      AuthParameters: {
        USERNAME: phoneNumber,
        SECRET_HASH: getSecretHash(phoneNumber, client_id, client_secret),
      },
    };

    const command = new InitiateAuthCommand(params);
    return await cognitoClient.send(command);
  } catch (err) {
    // 4. Handle Lambda failure like "Phone number is missing"
    if (
      err.name === "UserLambdaValidationException" &&
      err.message.includes("Phone number is missing")
    ) {
      const customError = new Error("User not registered with phone number");
      customError.statusCode = 400;
      throw customError;
    }

    console.error("❌ Failed to initiate auth:", err);
    throw err;
  }
};

const resendOTP = async (phoneNumber) => {
  return sendOTP(phoneNumber); // Reuse the logic
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
  sendOTP,
  verifyOTP,
  logoutUser,
  resendOTP
};
