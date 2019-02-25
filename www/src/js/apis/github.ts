import axios from 'axios';
import qs from 'query-string';
import { Contributor } from 'types/contributor';
import { VenueLocationMap } from 'types/venues';

// We proxy https://api.github.com/repos/nusmodifications/nusmods -> https://github.nusmods.com/repo
// This allows us to cache the response to stop 403 rate limit error caused by the
// school sharing a single IP address
const baseUrl = 'https://github.nusmods.com';

const contributorBlacklist = new Set([
  // Renovate used to report outdated dependencies as a user via the GitHub API,
  // hence we need to filter it out by its GitHub user ID.
  25180681,
]);

/**
 * Get the contributors to the NUSMods repo
 */
export function getContributors(): Promise<Contributor[]> {
  const query = qs.stringify({
    per_page: 100,
  });

  const url = `${baseUrl}/repo/contributors?${query}`;
  return axios
    .get<Contributor[]>(url)
    .then((response) =>
      response.data.filter(
        (contributor) => contributor.type === 'User' && !contributorBlacklist.has(contributor.id),
      ),
    );
}

let memoizedVenuePromise: Promise<VenueLocationMap> | null = null;

/**
 * Download venue locations from the copy of data/venues.json hosted on GitHub
 */
export function getVenueLocations(): Promise<VenueLocationMap> {
  if (memoizedVenuePromise) return memoizedVenuePromise;
  const url = `${baseUrl}/venues`;
  const promise = axios
    .get<VenueLocationMap>(url)
    .then((response) => response.data)
    .catch(() =>
      // Fall back to loading the bundled version if the venues cannot be fetched
      import('data/venues').then((module) => module.default),
    );

  memoizedVenuePromise = promise;
  return promise;
}

/**
 * Clear the memoized value on getVenueLocations
 */
getVenueLocations.clear = () => {
  memoizedVenuePromise = null;
};
