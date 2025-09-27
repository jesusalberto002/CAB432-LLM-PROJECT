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

// Debugging helper
const log = (message, ...args) => {
  console.log('[Cognito DEBUG]', message, ...args);
};

// Signup function
export const signUp = (email, password) => {
  return new Promise((resolve, reject) => {
    log('Signing up user:', email);
    const attributeList = [
      new CognitoUserAttribute({
        Name: 'email',
        Value: email,
      }),
    ];

    userPool.signUp(email, password, attributeList, null, (err, result) => {
      if (err) {
        log('SignUp error:', err);
        return reject(err);
      }
      log('SignUp success:', result.user.getUsername());
      resolve(result.user);
    });
  });
};

// Confirm signup
export const confirmSignUp = (email, code) => {
  return new Promise((resolve, reject) => {
    log('Confirming signup for:', email);
    const cognitoUser = new CognitoUser({ Username: email, Pool: userPool });

    cognitoUser.confirmRegistration(code, true, (err, result) => {
      if (err) {
        log('ConfirmSignUp error:', err);
        return reject(err);
      }
      log('ConfirmSignUp success:', result);
      resolve(result);
    });
  });
};

// Authenticate (login)
export const authenticate = (email, password) => {
  return new Promise((resolve, reject) => {
    log('Authenticating user:', email);
    const authenticationData = { Username: email, Password: password };
    const authenticationDetails = new AuthenticationDetails(authenticationData);
    const cognitoUser = new CognitoUser({ Username: email, Pool: userPool });

    cognitoUser.authenticateUser(authenticationDetails, {
      onSuccess: (result) => {
        log('Authentication success:', result);
        resolve({ session: result });
      },
      onFailure: (err) => {
        log('Authentication failure:', err);
        reject(err);
      },
      mfaRequired: (challengeName, challengeParameters) => {
        log('MFA required. Challenge:', challengeName, challengeParameters);
        resolve({ mfaUser: cognitoUser });
      },
      newPasswordRequired: (userAttributes, requiredAttributes) => {
        log('New password required:', userAttributes, requiredAttributes);
        reject(new Error('New password required for this user.'));
      },
      totpRequired: (challengeName, challengeParameters) => {
        log('TOTP MFA required. Challenge:', challengeName, challengeParameters);
        resolve({ mfaUser: cognitoUser });
      },
      mfaSetup: (challengeName, challengeParameters) => {
        log('MFA setup required. Challenge:', challengeName, challengeParameters);
        resolve({ mfaUser: cognitoUser });
      },
    });
  });
};

// Confirm MFA
export const confirmMfa = (mfaUser, mfaCode) => {
  return new Promise((resolve, reject) => {
    log('Confirming MFA code for user:', mfaUser.getUsername());
    mfaUser.sendMFACode(mfaCode, {
      onSuccess: (result) => {
        log('MFA confirmation success:', result);
        resolve(result);
      },
      onFailure: (err) => {
        log('MFA confirmation failure:', err);
        reject(err);
      },
      mfaSetup: (challengeName, challengeParameters) => {
        log('MFA setup challenge during confirmation:', challengeName, challengeParameters);
      },
    });
  });
};
