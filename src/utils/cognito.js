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
  AdminSetUserPasswordCommand,
} from "@aws-sdk/client-cognito-identity-provider";

const client_id = process.env.COGNITO_CLIENT_ID;
console.log("client_id: ", client_id);
const client_secret = process.env.COGNITO_CLIENT_SECRET;
const region = process.env.AWS_REGION;
const user_pool_id = process.env.COGNITO_USER_POOL_ID;
const client_id_admin = process.env.COGNITO_CLIENT_ID_ADMIN;
const client_secret_admin = process.env.COGNITO_CLIENT_SECRET_ADMIN;

const cognitoClient = new CognitoIdentityProviderClient({ region });

function getSecretHash(username, clientId, clientSecret) {
  return crypto
    .createHmac("SHA256", clientSecret)
    .update(username + clientId)
    .digest("base64");
}

const loginUserWithEmailPassword = async (email, password) => {
console.log('password: ', password);
console.log('email: ', email);
  try {
    const secretHash = getSecretHash(email, client_id, client_secret);

    const params = {
      AuthFlow: "USER_PASSWORD_AUTH",
      ClientId: client_id,
      AuthParameters: {
        USERNAME: email,
        PASSWORD: password,
        SECRET_HASH: secretHash,
      },
    };

    const command = new InitiateAuthCommand(params);
    const response = await cognitoClient.send(command);
    console.log('response: ', response);
    
    return response.AuthenticationResult;
  } catch (err) {
    console.error("❌ Login failed:", err);
  }
};


const setPermanentPassword = async (email, password) => {
  const command = new AdminSetUserPasswordCommand({
    UserPoolId: user_pool_id,
    Username: email,
    Password: password,
    Permanent: true,
  });
  return cognitoClient.send(command);
};



// const registerUsersToCognito = async (user) => {
//   const phoneNumber = user.empMobileNo;
//   const email = user.emailId;
//   const empName = user.empName || "N/A";
//   let username, userAttributes, tempPassword;

//   // Get roles for the user from the UserRole table
//   const roles = await prisma.UserRole.findMany({
//     where: {
//       userId: user.empId,
//     },
//     include: {
//       role: true,  // Fetch the role data (name, id)
//     },
//   });
//   console.log(`roles for user ${empName}: --->> `, roles);
 
//   for (const userRole of roles) {
//     const roleName = userRole.role.name;

//     if (roleName === "Admin") {
//       // Admin login via email/password
//       username = email;
//       tempPassword = "Admin@123"; // Temporary password, generate securely in real app

//       userAttributes = [
//         { Name: "email", Value: email },
//         { Name: "email_verified", Value: "true" },
//         { Name: "phone_number", Value: phoneNumber },
//         { Name: "phone_number_verified", Value: "true" },
//         { Name: "name", Value: empName },
//       ];
//     } else {
//       // Employee login via mobile OTP
//       username = phoneNumber;
//       userAttributes = [
//         { Name: "phone_number", Value: phoneNumber },
//         { Name: "phone_number_verified", Value: "true" },
//         { Name: "email", Value: email },
//         { Name: "name", Value: empName },
//       ];
//     }

//     try {
//       // Check if already registered in Cognito
//       await cognitoClient.send(
//         new AdminGetUserCommand({
//           UserPoolId: user_pool_id,
//           Username: username,
//         })
//       );
//       console.log(`⚠️ User already exists: ${username}`);
//     } catch (err) {
//       if (err.name === "UserNotFoundException") {
//         const params = {
//           UserPoolId: user_pool_id,
//           Username: username,
//           UserAttributes: userAttributes,
//           DesiredDeliveryMediums: ["EMAIL"],
//           MessageAction: "SUPPRESS",
//         };

//         if (roleName === "Admin") {
//           params.TemporaryPassword = tempPassword;
//         }

//         await cognitoClient.send(new AdminCreateUserCommand(params));
//         console.log(`✅ User registered: ${username}`);

//         if (roleName === "Admin") {
//           console.log("==== The password set permanent is --->>>");
//           await setPermanentPassword(username, tempPassword);
//         }

//         await cognitoClient.send(
//           new AdminAddUserToGroupCommand({
//             UserPoolId: user_pool_id,
//             Username: username,
//             GroupName: roleName, // Add user to corresponding Cognito group
//           })
//         );
//         console.log(`✅ Added to group: ${roleName}`);
//       } else {
//         console.error(`❌ Registration error: ${err.message}`);
//       }
//     }
//   }
// };

const registerUsersToCognito = async (user) => {
  const phoneNumber = user.empMobileNo;
  const email = user.emailId;
  const empName = user.empName || "N/A";
  let username = email; // Default username as email
  let userAttributes, tempPassword;

  // Get roles for the user from the UserRole table (many-to-many relationship)
  const roles = await prisma.UserRole.findMany({
    where: {
      userId: user.empId,
    },
    include: {
      role: true,  // Fetch the role data (name, id)
    },
  });

  // Create the attributes based on the primary login method (email or phone)
  userAttributes = [
    { Name: "email", Value: email },
    { Name: "email_verified", Value: "true" },
    { Name: "phone_number", Value: phoneNumber },
    { Name: "phone_number_verified", Value: "true" },
    { Name: "name", Value: empName },
  ];

  // Check if user already exists in Cognito (by email)
  try {
    await cognitoClient.send(
      new AdminGetUserCommand({
        UserPoolId: user_pool_id,
        Username: username, // First try with email as the username
      })
    );
    console.log(`⚠️ User already exists: ${username}`);
  } catch (err) {
    if (err.name === "UserNotFoundException") {
      // If the user doesn't exist, create the user
      tempPassword = "Admin@123"; // Temporary password for admin

      const params = {
        UserPoolId: user_pool_id,
        Username: username,
        UserAttributes: userAttributes,
        DesiredDeliveryMediums: ["EMAIL"],
        MessageAction: "SUPPRESS",  // Prevent sending email automatically
        TemporaryPassword :tempPassword
      };

      // if (roles.some(role => role.role.name === "Admin")) {
      //   params.TemporaryPassword = tempPassword;
      // }

      await cognitoClient.send(new AdminCreateUserCommand(params));
      console.log(`✅ User registered: ${username}`);

      if (roles.some(role => role.role.name === "Admin")) {
        console.log("==== The password set permanent is --->>>");
        await setPermanentPassword(username, tempPassword);
      }
      for (const userRole of roles) {
        const roleName = userRole.role.name;
    
        await cognitoClient.send(
          new AdminAddUserToGroupCommand({
            UserPoolId: user_pool_id,
            Username: username,
            GroupName: roleName, // Add user to the appropriate Cognito group
          })
        );
        console.log(`✅ Added to group: ${roleName}`);
      }
    } else {
      console.error(`❌ Registration error: ${err.message}`);
    }
  }

  // Now add the user to the corresponding groups (roles) in Cognito
 
};

const getUser = async (phoneNumber) => {
  try{
    const user = await prisma.User.findFirst({
      where: { empMobileNo: phoneNumber },
    });
    
    if (!user) {
      throw new Error("User not found in database");
    }
   console.log("-----The user is ----->>>",user)
   return user;
  }catch(error) {
    console.error("Error getting the user :",error)
  }
 
}

const sendOTP = async (phoneNumber) => {
 const user = await getUser(phoneNumber);
  console.log(
    "==== The secret hash for sendOTP ====>>",
    getSecretHash(phoneNumber, client_id, client_secret)
  );
  try {
    const params = {
      AuthFlow: "CUSTOM_AUTH",
      ClientId: client_id,
      AuthParameters: {
        USERNAME: user.emailId,
        // USERNAME: phoneNumber,
        SECRET_HASH: getSecretHash(user.emailId, client_id, client_secret),
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
  const user = await getUser(phoneNumber);
  console.log(
    "==== The secret hash for verifyOTP ====>>",
    getSecretHash(phoneNumber, client_id, client_secret)
  );
  const params = {
    ClientId: client_id,
    ChallengeName: "CUSTOM_CHALLENGE",
    Session: session,
    ChallengeResponses: {
      USERNAME: user.emailId,
      ANSWER: otp,
      SECRET_HASH: getSecretHash(user.emailId, client_id, client_secret),
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

const adminRefreshAccessToken = async (refreshToken, email) => {
  try {
    const sub = await getUserSub(email);
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
}

const refreshAccessToken = async (refreshToken, phoneNumber) => {
  const user = await getUser(phoneNumber)
  try {
    const sub = await getUserSub(user.emailId);
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
  getUserGroupFromIdToken,
  loginUserWithEmailPassword,
  adminRefreshAccessToken
};
