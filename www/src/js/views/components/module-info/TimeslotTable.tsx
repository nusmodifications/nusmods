import * as React from 'react';
import classnames from 'classnames';

import { Day, Time, WorkingDaysOfWeek, TimesOfDay } from 'types/modules';
import { getTimeslot } from 'utils/modules';
import styles from './TimeslotTable.scss';

type Props = {
  children: Map<string, Node>;
  className?: string;
};

type State = {
  hover: {
    day?: Day | null;
    time?: Time | null;
  };
};

// Null object for when no cell is being hovered over
const EMPTY_HOVER = {
  day: null,
  time: null,
};

const timeLabels: { [time: string]: string } = {
  Morning: 'A.M.',
  Afternoon: 'P.M.',
  Evening: 'Night',
};

const withoutSaturday = WorkingDaysOfWeek.slice(0, -1);
const withoutEvening = TimesOfDay.slice(0, -1);

export default class TimeslotTable extends React.Component<Props, State> {
  state: State = { hover: EMPTY_HOVER };

  onHoverEnter = (day: Day, time: Time) => {
    this.setState({ hover: { day, time } });
  };

  onHoverClear = () => {
    this.setState({ hover: EMPTY_HOVER });
  };

  render() {
    const { children, className } = this.props;
    const { hover } = this.state;

    const hasChildren = (day: Day, time: Time) => {
      const timeslot = getTimeslot(day, time);
      return React.Children.count(children.get(timeslot)) > 0;
    };

    // Remove Saturday and Evening if there is nothing in those rows / columns
    const days = TimesOfDay.some((time) => hasChildren('Saturday', time))
      ? WorkingDaysOfWeek
      : withoutSaturday;
    const times = WorkingDaysOfWeek.some((day) => hasChildren(day, 'Evening'))
      ? TimesOfDay
      : withoutEvening;

    return (
      <table className={classnames(styles.table, className)}>
        <thead>
          <tr>
            <th />

            {days.map((day) => (
              <th
                key={`heading-${day}`}
                className={classnames(styles.day, {
                  [styles.hover]: day === hover.day,
                })}
              >
                {day.slice(0, 3)}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {times.map((time) => (
            <tr key={`row-${time}`}>
              <th
                className={classnames(styles.time, {
                  [styles.hover]: time === hover.time,
                })}
              >
                {timeLabels[time]}
              </th>

              {days.map((day) => (
                <td
                  key={`cell-${day}-${time}`}
                  onMouseEnter={() => this.onHoverEnter(day, time)}
                  onMouseLeave={this.onHoverClear}
                >
                  {children.get(getTimeslot(day, time))}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    );
  }
}
