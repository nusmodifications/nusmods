import * as Sentry from '@sentry/node';
import type { VercelApiHandler } from '@vercel/node';
import axios from 'axios';

function setUpSentry() {
  if (process.env.NODE_ENV !== 'production') {
    return;
  }
  Sentry.init({
    dsn: 'https://aeaf014322354a968c647725895bb458@o97653.ingest.sentry.io/5611949',
  });
}

/**
 * Serverless function that shortens a provided URL with the modsn.us URL
 * shortener. This cannot be implemented into the main /website as it requires
 * a YOURLS secret.
 */
const handler: VercelApiHandler = async (request, response) => {
  setUpSentry();

  const shortenResponse = await axios.get('https://modsn.us/yourls-api.php', {
    params: {
      action: 'shorturl',
      format: 'json',
      url: request.query.url,
      // Obtain the signature from https://modsn.us/admin/tools.php (internal-only)
      signature: process.env.YOURLS_SIGNATURE,
    },
  });

  response.status(shortenResponse.status).json(shortenResponse.data);
};

export default handler;
