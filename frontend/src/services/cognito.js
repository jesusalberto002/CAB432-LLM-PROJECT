// frontend/src/services/cognito.js
import {
  CognitoUserPool,
  CognitoUser,
  AuthenticationDetails,
  CognitoUserAttribute,
} from 'amazon-cognito-identity-js';

const poolData = {
  UserPoolId: 'ap-southeast-2_LB7ZrgcGZ', // Your User Pool ID
  ClientId: '5pij8s6i58k50ilq3ms8qppgp8',   // Your App Client ID
};

const userPool = new CognitoUserPool(poolData);

// The 'username' parameter here will be the user's email
export const signUp = (email, password) => {
  return new Promise((resolve, reject) => {
    const attributeList = [
      new CognitoUserAttribute({
        Name: 'email',
        Value: email,
      }),
    ];

    userPool.signUp(email, password, attributeList, null, (err, result) => {
      if (err) return reject(err);
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
        resolve({ session: result });
      },
      onFailure: (err) => {
        reject(err);
      },
      mfaRequired: () => {
        // If MFA is required, we resolve with the user object so the UI
        // can prompt for the MFA code.
        resolve({ mfaUser: cognitoUser });
      },
    });
  });
};

// Add this new function to handle the MFA code submission
export const confirmMfa = (mfaUser, mfaCode) => {
    return new Promise((resolve, reject) => {
        mfaUser.sendMFACode(mfaCode, {
            onSuccess: (result) => {
                resolve(result);
            },
            onFailure: (err) => {
                reject(err);
            }
        });
    });
};