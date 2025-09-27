// frontend/src/services/cognito.js
import {
  CognitoUserPool,
  CognitoUser,
  AuthenticationDetails,
} from 'amazon-cognito-identity-js';

const poolData = {
  UserPoolId: 'ap-southeast-2_LB7ZrgcGZ', // Your User Pool ID
  ClientId: '3fm7qdn8bakjjeotmq7hqmgdj2',   // Your App Client ID
};

const userPool = new CognitoUserPool(poolData);

// The 'username' parameter here will be the user's email
export const signUp = (email, password) => {
  return new Promise((resolve, reject) => {
    const attributeList = [
      {
        Name: 'email',
        Value: email,
      },
    ];

    userPool.signUp(email, password, attributeList, null, (err, result) => {
      if (err) {
        reject(err);
        return;
      }
      resolve(result.user);
    });
  });
};

// The 'username' parameter here will be the user's email
export const confirmSignUp = (email, code) => {
  return new Promise((resolve, reject) => {
    const cognitoUser = new CognitoUser({ Username: email, Pool: userPool });
    cognitoUser.confirmRegistration(code, true, (err, result) => {
      if (err) {
        reject(err);
        return;
      }
      resolve(result);
    });
  });
};

// The 'username' parameter here will be the user's email
export const authenticate = (email, password) => {
  return new Promise((resolve, reject) => {
    const authenticationData = { Username: email, Password: password };
    const authenticationDetails = new AuthenticationDetails(authenticationData);
    const cognitoUser = new CognitoUser({ Username: email, Pool: userPool });

    cognitoUser.authenticateUser(authenticationDetails, {
      onSuccess: (result) => {
        resolve(result);
      },
      onFailure: (err) => {
        reject(err);
      },
    });
  });
};