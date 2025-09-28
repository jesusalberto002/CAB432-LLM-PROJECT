// frontend/src/services/cognito.js
import {
  CognitoUserPool,
  CognitoUser,
  AuthenticationDetails,
  CognitoUserAttribute,
} from 'amazon-cognito-identity-js';

const poolData = {
  UserPoolId: 'ap-southeast-2_LB7ZrgcGZ',
  ClientId: '5pij8s6i58k50ilq3ms8qppgp8',
};

const userPool = new CognitoUserPool(poolData);

// Debugging helper
const log = (message, ...args) => {
  console.log('[Cognito DEBUG]', message, ...args);
};

// Signup
export const signUp = (email, password) => {
  return new Promise((resolve, reject) => {
    log('Signing up user:', email);
    const attributeList = [
      new CognitoUserAttribute({ Name: 'email', Value: email }),
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
    const authenticationDetails = new AuthenticationDetails({
      Username: email,
      Password: password,
    });
    const cognitoUser = new CognitoUser({ Username: email, Pool: userPool });

    cognitoUser.setAuthenticationFlowType('USER_PASSWORD_AUTH');

    cognitoUser.authenticateUser(authenticationDetails, {
      onSuccess: (result) => {
        const safeResult = {
          idToken: result.getIdToken().getJwtToken(),
          accessToken: result.getAccessToken().getJwtToken(),
          refreshToken: result.getRefreshToken().getToken(),
        };
        log('Authentication success:', safeResult);
        resolve({ session: safeResult });
      },
      onFailure: (err) => {
        log('Authentication failure:', err);
        reject(err);
      },
    //   mfaRequired: (challengeName, challengeParameters) => {
    //     log('MFA required:', challengeName, challengeParameters);
    //     resolve({
    //       mfaUser: cognitoUser,
    //       challenge: 'EMAIL_MFA',
    //       parameters: challengeParameters,
    //     });
    //   },
    //   newPasswordRequired: (userAttributes, requiredAttributes) => {
    //     log('New password required:', userAttributes, requiredAttributes);
    //     reject(new Error('New password required for this user.'));
    //   },
    });
  });
};

// Confirm MFA
export const confirmMfa = (mfaUser, mfaCode) => {
  return new Promise((resolve, reject) => {
    log('Confirming MFA code for user:', mfaUser.getUsername());
    mfaUser.sendMFACode(
      mfaCode,
      {
        onSuccess: (result) => {
          const safeResult = {
            idToken: result.getIdToken().getJwtToken(),
            accessToken: result.getAccessToken().getJwtToken(),
            refreshToken: result.getRefreshToken().getToken(),
          };
          log('MFA confirmation success:', safeResult);
          resolve({ session: safeResult });
        },
        onFailure: (err) => {
          log('MFA confirmation failure:', err);
          reject(err);
        },
      },
      'EMAIL'
    );
  });
};
