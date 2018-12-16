// @flow
import axios from 'axios';
import type { Contributor } from 'types/contributor';

const CONTRIBUTORS_URL =
  'https://api.github.com/repos/nusmodifications/nusmods/contributors?per_page=100';
const CONTRIBUTOR_TYPE_USER = 'User';
const CONTRIBUTOR_ID_RENOVATE = 25180681;

export default function getContributors(): Promise<Contributor[]> {
  return axios.get(CONTRIBUTORS_URL).then((response) =>
    response.data.filter(
      (contributor) =>
        contributor.type === CONTRIBUTOR_TYPE_USER &&
        // Renovate used to report outdated dependencies as a user via the GitHub API,
        // hence we need to filter it out by its GitHub user ID.
        contributor.id !== CONTRIBUTOR_ID_RENOVATE,
    ),
  );
}
