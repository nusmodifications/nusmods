import { Button } from 'components/ui/button';
import { Table, TableBody, TableRow, TableHead, TableCell } from 'components/ui/table';
import { memo, useEffect } from 'react';
import classnames from 'classnames';
import { entries, sortBy } from 'lodash-es';

import { RefreshCw as Refresh } from 'react-feather';
import { BusTiming, NextBus, NextBusTime } from 'types/venues';
import { simplifyRouteName, extractRouteStyle } from 'utils/venues';
import styles from './BusStops.scss';

type Props = BusTiming & {
  name: string;
  code: string;
  reload: (code: string) => void;
};

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

export const ArrivalTimes = memo<Props>((props: Props) => {
  const { reload, code, name, error } = props;
  useEffect(() => {
    reload(code);
  }, [reload, code]);

  if (error) {
    return (
      <>
        <h3 className={styles.heading}>{name}</h3>
        <p>Error loading arrival times</p>
        <Button variant="default" size="sm" type="button" onClick={() => reload(code)}>
          Retry
        </Button>
      </>
    );
  }

  // Make sure the routes are sorted
  const timings = props.timings ? sortBy(entries(props.timings), ([route]) => route) : [];

  return (
    <>
      <h3 className={styles.heading}>{name}</h3>
      <Table className={classnames(styles.timings, 'table table-sm')}>
        <TableBody>
          {timings.map(([route, timing]: [string, NextBus]) => {
            const className = classnames(
              styles.routeHeading,
              styles[`route${extractRouteStyle(route)}`],
            );
            return (
              <TableRow key={route}>
                <TableHead className={className}>{simplifyRouteName(route)}</TableHead>
                <TableCell>{renderTiming(timing.arrivalTime)}</TableCell>
                <TableCell>{renderTiming(timing.nextArrivalTime)}</TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>

      <Button
        variant="link"
        size="sm"
        type="button"
        className={classnames(' btn-link btn-svg', styles.refreshBtn, {
          [styles.isLoading]: props.isLoading,
        })}
        disabled={props.isLoading}
        onClick={() => props.reload(props.code)}
      >
        <Refresh size={14} className={styles.refreshIcon} />
        {props.isLoading ? 'Loading...' : 'Refresh'}
      </Button>
    </>
  );
});

export default ArrivalTimes;
