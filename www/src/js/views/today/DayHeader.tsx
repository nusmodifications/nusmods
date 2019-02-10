import * as React from 'react';
import { castArray, last } from 'lodash';
import { format } from 'date-fns';

import getWeatherIcon from 'views/components/icons/weather';
import Tooltip from 'views/components/Tooltip';
import styles from './DayHeader.scss';

type Props = {
  readonly date: Date | Date[];
  readonly forecast?: string | null | undefined;
  readonly offset: number; // number of days from today
};

export function HeaderDate({
  children,
  offset,
}: {
  readonly children: Date;
  readonly offset: number;
}) {
  let title;
  let subtitle;

  if (offset < 2) {
    title = offset === 0 ? 'Today' : 'Tomorrow';
    subtitle = format(children, 'iiii, do MMMM');
  } else {
    title = format(children, 'iiii');
    subtitle = format(children, 'do MMMM');
  }

  return (
    <time dateTime={children.toISOString()}>
      <span className={styles.date}>{subtitle}</span> {title}
    </time>
  );
}

export default function(props: Props) {
  const Icon = props.forecast ? getWeatherIcon(props.forecast) : null;

  const dates = castArray(props.date);

  return (
    <header className={styles.header}>
      <h2>
        <div>
          <HeaderDate offset={props.offset}>{dates[0]}</HeaderDate>
        </div>
        {dates.length > 1 && (
          <>
            <div className={styles.to}> to </div>
            <div>
              <HeaderDate offset={props.offset + dates.length - 1}>{last(dates)}</HeaderDate>
            </div>
          </>
        )}
      </h2>

      {Icon && (
        <Tooltip content={props.forecast} placement="bottom" offset={0}>
          <div className={styles.weather} aria-label={props.forecast}>
            <Icon />
          </div>
        </Tooltip>
      )}
    </header>
  );
}
