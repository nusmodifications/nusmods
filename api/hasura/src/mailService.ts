import sendgrid from '@sendgrid/mail';
import config from './config';

sendgrid.setApiKey(config.mailApiKey);

function sendToken(recipientEmail: string, token: string) {
  return sendgrid.send({
    from: config.mailAddress,
    to: recipientEmail,
    subject: 'Your NUSMods auth token',
    html: `<h1>Token</h1><p>Your token is: ${token}</p>`,
  });
}

export default {
  sendToken,
};
