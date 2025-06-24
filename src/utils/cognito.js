require('dotenv').config();
const crypto = require("crypto");

const {
  CognitoIdentityProviderClient,
  SignUpCommand,
  ConfirmSignUpCommand,
  ResendConfirmationCodeCommand,
  GlobalSignOutCommand,
} = require("@aws-sdk/client-cognito-identity-provider");

const client_id = process.env.COGNITO_CLIENT_ID;
const client_secret = process.env.COGNITO_CLIENT_SECRET;
const region = process.env.AWS_REGION;

const cognitoClient = new CognitoIdentityProviderClient({ region });

function getSecretHash(username, clientId, clientSecret) {
  return crypto
    .createHmac("SHA256", clientSecret)
    .update(username + clientId)
    .digest("base64");
}

const signUpWithPhone = async (phoneNumber) => {
  const params = {
    ClientId: client_id,
    Username: phoneNumber,
    Password: Math.random().toString(36).slice(-8) + "Aa1!",
    UserAttributes: [{ Name: "phone_number", Value: phoneNumber }],
    SecretHash: getSecretHash(phoneNumber, client_id, client_secret),
  };

  const command = new SignUpCommand(params);
  return cognitoClient.send(command);
};

const resendOTP = async (phoneNumber) => {
  const params = {
    ClientId: client_id,
    Username: phoneNumber,
    SecretHash: getSecretHash(phoneNumber, client_id, client_secret),
  };

  const command = new ResendConfirmationCodeCommand(params);
  return cognitoClient.send(command);
};

const confirmOTP = async (phoneNumber, code) => {
  const params = {
    ClientId: client_id,
    Username: phoneNumber,
    ConfirmationCode: code,
    SecretHash: getSecretHash(phoneNumber, client_id, client_secret),
  };

  const command = new ConfirmSignUpCommand(params);
  return cognitoClient.send(command);
};

const logoutUser = async (accessToken) => {
  const params = {
    AccessToken: accessToken,
  };

  const command = new GlobalSignOutCommand(params);
  return cognitoClient.send(command);
};

module.exports = {
  signUpWithPhone,
  confirmOTP,
  resendOTP,
  logoutUser,
};
