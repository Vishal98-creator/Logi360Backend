import dotenv from "dotenv";
import prisma from "./prisma.js";
dotenv.config();
import { jwtDecode } from "jwt-decode";
import crypto from "crypto";
import {
  CognitoIdentityProviderClient,
  AdminCreateUserCommand,
  InitiateAuthCommand,
  RespondToAuthChallengeCommand,
  GlobalSignOutCommand,
  GetUserCommand,
  AdminGetUserCommand,
  AdminAddUserToGroupCommand,
} from "@aws-sdk/client-cognito-identity-provider";

const client_id = process.env.COGNITO_CLIENT_ID;
console.log("client_id: ", client_id);
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
  const phoneNumber = user.empMobileNo;

  try {
    // Check if user already exists in Cognito
    const res = await cognitoClient.send(
      new AdminGetUserCommand({
        UserPoolId: user_pool_id,
        Username: phoneNumber,
      })
    );
    console.log(`⚠️ User already exists in Cognito: ${phoneNumber}`);
  } catch (err) {
    if (err.name === "UserNotFoundException") {
      // User doesn't exist, so create the user
      const params = {
        UserPoolId: user_pool_id,
        Username: phoneNumber,
        UserAttributes: [
          { Name: "phone_number", Value: phoneNumber },
          { Name: "phone_number_verified", Value: "true" },
          { Name: "name", Value: user.empName || "N/A" },
          { Name: "email", Value: user.emailId }, // Add the emailId attribute
          // { Name: "email_verified", Value: "true" }
          // { Name: "custom:role", Value: user.roleOfUser },  // Add role as custom attribute
        ],
        DesiredDeliveryMediums: ["SMS"],
        MessageAction: "SUPPRESS",
      };

      await cognitoClient.send(new AdminCreateUserCommand(params));
      console.log(`✅ User registered to Cognito: ${phoneNumber}`);

      const res = await cognitoClient.send(
        new AdminAddUserToGroupCommand({
          UserPoolId: user_pool_id,
          Username: phoneNumber,
          GroupName: user.roleOfUser, // Add user to the group based on their role
        })
      );
      console.log(`✅ User added to ${user.roleOfUser} group`);
    } else {
      console.error(`❌ Error registering user: ${err.message}`);
    }
  }
};

const sendOTP = async (phoneNumber) => {
  // const user = await prisma.User.findUnique({
  //   where: { empMobileNo: phoneNumber },
  // });

  // if (!user) {
  //   throw new Error("User not found in database");
  // }

  console.log(
    "==== The secret hash for sendOTP ====>>",
    getSecretHash(phoneNumber, client_id, client_secret)
  );
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
  console.log(
    "==== The secret hash for verifyOTP ====>>",
    getSecretHash(phoneNumber, client_id, client_secret)
  );
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

const getUserSub = async (phoneNumber) => {
  try {
    const user = await cognitoClient.send(
      new AdminGetUserCommand({
        UserPoolId: user_pool_id,
        Username: phoneNumber,
      })
    );

    const sub = user.UserAttributes.find((attr) => attr.Name === "sub")?.Value;
    console.log("===== The userSub is =====>>>>", sub);

    return sub;
  } catch (err) {
    console.error(`❌ Error fetching user details: ${err.message}`);
    throw err;
  }
};

const refreshAccessToken = async (refreshToken, phoneNumber) => {
  try {
    const sub = await getUserSub(phoneNumber);
    if (!sub) {
      throw new Error("User sub (unique ID) not found.");
    }

    const secretHash = getSecretHash(sub, client_id, client_secret);
    console.log("==== The secret hash for refreshToken ====>>", secretHash);

    const params = {
      AuthFlow: "REFRESH_TOKEN",
      ClientId: client_id,
      AuthParameters: {
        REFRESH_TOKEN: refreshToken,
        SECRET_HASH: secretHash,
      },
    };

    const command = new InitiateAuthCommand(params);
    const response = await cognitoClient.send(command);

    return response.AuthenticationResult;
  } catch (err) {
    console.error("❌ Error refreshing access token:", err);
    throw err;
  }
};

const getUserGroupFromIdToken = (idToken) => {
  // const idToken =
  //   "eyJraWQiOiIydDNkRmZocDN4WEV6eXhvOHp3R0xJcnJISngyZHh2M2dhb04wK3JjWmE4PSIsImFsZyI6IlJTMjU2In0.eyJzdWIiOiIyMWZiODU4MC1hMGUxLTcwYzctZjQ3OC1hMWZhYTFiN2RiYmUiLCJjb2duaXRvOmdyb3VwcyI6WyJBZG1pbiJdLCJpc3MiOiJodHRwczpcL1wvY29nbml0by1pZHAudXMtZWFzdC0yLmFtYXpvbmF3cy5jb21cL3VzLWVhc3QtMl9BZmlIbjNlSDAiLCJwaG9uZV9udW1iZXJfdmVyaWZpZWQiOnRydWUsImNvZ25pdG86dXNlcm5hbWUiOiIyMWZiODU4MC1hMGUxLTcwYzctZjQ3OC1hMWZhYTFiN2RiYmUiLCJvcmlnaW5fanRpIjoiMThiOGYwOGUtMDU2Yi00MTgzLTg4MzQtZWQwOWIwYTllNmRhIiwiYXVkIjoiY2twZG1xN2Fra2x0cHMzaTkxazZsa2VocyIsImV2ZW50X2lkIjoiY2QxMTExYjgtYzk0MS00ZWYyLWFjZDYtNTk0ZWQ4OTVjMjI5IiwidG9rZW5fdXNlIjoiaWQiLCJhdXRoX3RpbWUiOjE3NTE2MjQxOTMsIm5hbWUiOiJWaXNoYWwgU2FtYW50YSIsInBob25lX251bWJlciI6Iis5MTg3MTg4ODY4NDEiLCJleHAiOjE3NTE2Mjc3OTMsImlhdCI6MTc1MTYyNDE5MywianRpIjoiYmE5OTYxYjAtMTE0ZS00ZTc4LTg4N2UtMmM4NmFlMWUyNzY2IiwiZW1haWwiOiJ2aXNoYWwudmlpb25uQGdtYWlsLmNvbSJ9.jlZymqKq9MZ9u5xpafIlgZ5Q1F2iKXc0sthd4yFntFN642N6kR0v5PZd2xVH9Rm3CCbmcN2XUuGQIH47NeLoXGS7X9heZwhrYn3qWu8wXPbXgalsdmLdu-V5WTTFoAohKePv2lQaKutQd8G_f8kgdTLRzntp6hwaK5FZfuNBCFQjIxO7yBcRBr13a-P1n2y0t6hIKC0Ci_ryZgOumWidQLtgSazk6N4AL2Gh2KRp5CjTy8wkrDqWr7RsDXBDUxLz3fQeXwsAfwcwgZbWa3W5oJU-eTvpAD9a1BfbW8SxJB0jUjxq2Z0vk9rqBJfPrgZTkkPq5KQhoWH_Om57-FZIhg";
  try {
    // Decode the ID Token to extract user information
    const decodedToken = jwtDecode(idToken);

    console.log("Decoded Token:======>>>> ", decodedToken);

    // Check the 'cognito:groups' claim to see the user's group(s)
    const groups = decodedToken["cognito:groups"];

    if (groups && groups.length > 0) {
      console.log("User's groups:", groups);
      return groups; // Return the groups (e.g., ['admin', 'employee'])
    } else {
      console.log("User is not part of any group.");
      return [];
    }
  } catch (error) {
    console.error("Error decoding ID Token: ", error);
    return [];
  }
};

export {
  sendOTP,
  verifyOTP,
  logoutUser,
  resendOTP,
  verifyAccessToken,
  registerUsersToCognito,
  refreshAccessToken,
  getUserGroupFromIdToken
};
