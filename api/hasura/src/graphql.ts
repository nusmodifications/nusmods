import axios from 'axios';
import config from './config';

// TODO: remove axios and use http to reduce surface area
function obtainUser({ email }: { email: string }) {
  axios
    .post(
      config.hasuraUrl,
      `mutation {
  insert_account(objects: {email: "${email}"}) {
    returning {
      account_id
      email
    }
  }
}`,
      {
        headers: {
          'X-Hasura-Admin-Secret': 'development',
        },
      },
    )
    .then((value) => {
      const results = value.data.data.insert_account.returning[0];
      return {
        accountId: results.account_id as string,
        email: results.email as string,
      };
    });
}

export default {
  obtainUser,
};
