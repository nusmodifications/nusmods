// @flow
import { generateAuthActions } from 'redux-token-auth';
import config from 'config';

const rtaConfig = {
  authUrl: `${config.railsApiBaseUrl}/auth`,
};

const { registerUser, signInUser, signOutUser, verifyCredentials } = generateAuthActions(rtaConfig);
export { registerUser, signInUser, signOutUser, verifyCredentials };
