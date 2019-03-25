import sendgrid from '@sendgrid/mail';
import config from './config';

sendgrid.setApiKey(config.mailApiKey);

async function sendPasscode(recipientEmail: string, passcode: string) {
  await sendgrid.send({
    from: config.mailAddress,
    to: recipientEmail,
    subject: 'Your NUSMods auth passcode',
    html: `<h1>Passcode</h1><p>Your passcode is: ${passcode}</p>`,
  });
}

export default {
  sendPasscode,
};
