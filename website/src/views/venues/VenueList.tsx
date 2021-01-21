import { FC, memo, useMemo } from 'react';
import classnames from 'classnames';
import { groupBy, toPairs, sortBy } from 'lodash';
import { Link, LinkProps, useHistory } from 'react-router-dom';

import { Venue } from 'types/venues';
import { venuePage } from 'views/routes/paths';

import styles from './VenueList.scss';

type Props = {
  venues: Venue[];
  selectedVenue?: Venue;
  linkProps?: Omit<LinkProps, 'to'>;
};

const VenueList: FC<Props> = ({ venues, selectedVenue, linkProps }) => {
  const sortedVenueList = useMemo(() => {
    // Added during the horrible COVID-19 times to hide E-Learning venues
    const physicalVenues = venues.filter((venue) => !venue.startsWith('E-Learn'));
    const venueList = groupBy(physicalVenues, (venue) => venue.charAt(0).toUpperCase());
    return sortBy(toPairs(venueList), ([key]) => key);
  }, [venues]);

  const history = useHistory();

  return (
    <ul className={styles.venueList}>
      {sortedVenueList.map(([heading, sortedVenue]) => (
        <li key={heading}>
          <h3 className={styles.heading}>{heading}</h3>
          <ul className={styles.subList}>
            {sortedVenue.map((venue) => (
              <li key={venue}>
                <Link
                  to={{
                    ...history.location,
                    pathname: venuePage(venue),
                  }}
                  className={classnames(
                    'btn',
                    venue === selectedVenue ? 'btn-primary' : 'btn-outline-primary',
                  )}
                  {...linkProps}
                >
                  {venue}
                </Link>
              </li>
            ))}
          </ul>
        </li>
      ))}
    </ul>
  );
};

export default memo(VenueList);
