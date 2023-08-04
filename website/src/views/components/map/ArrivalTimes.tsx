import { memo } from 'react';
import classnames from 'classnames';
import { entries, sortBy } from 'lodash';

import { BusTiming, NextBus, NextBusTime } from 'types/venues';
import { RefreshCw as Refresh } from 'react-feather';
import styles from './BusStops.scss';

type Props = BusTiming & {
  name: string;
  code: string;
  reload: (code: string) => void;
};

/**
 * Extract the route name from the start of a string
 */
const routes = ['A1', 'A2', 'B1', 'B2', 'C', 'D1', 'D2', 'BTC1', 'BTC2'];
export function extractRoute(route: string): string | null {
  for (const cur of routes) {
    if (route.startsWith(cur)) return cur;
  }
  return null;
}

/**
 * Adds 'min' to numeric timings and highlight any buses that are arriving
 * soon with a <strong> tag
 */
function renderTiming(time: NextBusTime) {
  if (typeof time === 'number') {
    if (time <= 3) return <strong>{time} min</strong>;
    return `${time} min`;
  }

  if (time === 'Arr') return <strong>{time}</strong>;
  return time;
}

/**
 * Route names with parenthesis in them don't have a space in front of the
 * opening bracket, causing the text to wrap weirdly. This forces the opening
 * paren to always have a space in front of it.
 */
function fixRouteName(name: string) {
  return name.replace(/\s?\(/, ' (');
}

export const ArrivalTimes = memo<Props>((props: Props) => {
  if (props.error) {
    return (
      <>
        <h3 className={styles.heading}>{props.name}</h3>
        <p>Error loading arrival times</p>
        <button
          type="button"
          className="btn btn-sm btn-primary"
          onClick={() => props.reload(props.code)}
        >
          Retry
        </button>
      </>
    );
  }

  // Make sure the routes are sorted
  const timings = props.timings ? sortBy(entries(props.timings), ([route]) => route) : [];

  return (
    <>
      <h3 className={styles.heading}>{props.name}</h3>
      {props.timings && (
        <table className={classnames(styles.timings, 'table table-sm')}>
          <tbody>
            {timings.map(([routeName, timing]: [string, NextBus]) => {
              const route = extractRoute(routeName);
              const className = route
                ? classnames(styles.routeHeading, styles[`route${route}`])
                : '';

              return (
                <tr key={routeName}>
                  <th className={className}>{fixRouteName(routeName)}</th>
                  <td>{renderTiming(timing.arrivalTime)}</td>
                  <td>{renderTiming(timing.nextArrivalTime)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}

      <button
        type="button"
        className={classnames('btn btn-sm btn-link btn-svg', styles.refreshBtn, {
          [styles.isLoading!]: props.isLoading,
        })}
        disabled={props.isLoading}
        onClick={() => props.reload(props.code)}
      >
        <Refresh size={14} className={styles.refreshIcon} />
        {props.isLoading ? 'Loading...' : 'Refresh'}
      </button>
    </>
  );
});
