import * as React from 'react';
import { castArray, last } from 'lodash';
import { format } from 'date-fns';

import getWeatherIcon from 'views/components/icons/weather';
import Tooltip from 'views/components/Tooltip';
import styles from './DayHeader.scss';

type Props = {
  readonly date: Date | Date[];
  readonly forecast?: string | null;
  readonly offset: number; // number of days from today
};

export const HeaderDate: React.FC<{
  readonly children: Date;
  readonly offset: number;
}> = ({ children, offset }) => {
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
};

const DayHeader: React.FC<Props> = (props) => {
  const { forecast } = props;
  const Icon = forecast ? getWeatherIcon(forecast) : null;

  const dates = castArray(props.date);
  const lastDate = last(dates);

  return (
    <header className={styles.header}>
      <h2>
        <div>
          <HeaderDate offset={props.offset}>{dates[0]}</HeaderDate>
        </div>
        {dates.length > 1 && lastDate && (
          <>
            <div className={styles.to}> to </div>
            <div>
              <HeaderDate offset={props.offset + dates.length - 1}>{lastDate}</HeaderDate>
            </div>
          </>
        )}
      </h2>

      {Icon && forecast && (
        <Tooltip content={forecast} placement="bottom" distance={0}>
          <div className={styles.weather} aria-label={forecast}>
            <Icon />
          </div>
        </Tooltip>
      )}
    </header>
  );
};

export default DayHeader;
