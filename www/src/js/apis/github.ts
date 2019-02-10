// @flow
import axios from 'axios';
import qs from 'query-string';
import type { Contributor } from 'types/contributor';

// We proxy https://api.github.com/repos/nusmodifications/nusmods -> https://github.nusmods.com/repo
// This allows us to cache the response to stop 403 rate limit error caused by the
// school sharing a single IP address
const baseUrl = 'https://github.nusmods.com/repo';

const contributorBlacklist = new Set([
  // Renovate used to report outdated dependencies as a user via the GitHub API,
  // hence we need to filter it out by its GitHub user ID.
  25180681,
]);

// eslint-disable-next-line import/prefer-default-export
export function getContributors(): Promise<Contributor[]> {
  const query = qs.stringify({
    per_page: 100,
  });

  const url = `${baseUrl}/contributors?${query}`;
  return axios
    .get(url)
    .then((response) =>
      response.data.filter(
        (contributor) => contributor.type === 'User' && !contributorBlacklist.has(contributor.id),
      ),
    );
}
