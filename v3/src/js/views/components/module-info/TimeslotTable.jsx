// @flow

import React from 'react';
import { clone } from 'lodash';
import { DaysOfWeek, TimesOfDay } from 'types/modules';
import type { Day, Time } from 'types/modules';

export type TimeslotChildrenSupplier = (Day, Time) => ?React.Component;

type Props = {
  children: (props: { day: Day, time: Time }) => ?React.Component,
};

const timeLabels: { [Time]: string } = {
  Morning: 'A.M.',
  Afternoon: 'P.M.',
  Evening: 'Night',
};

export default function TimeslotTable(props: Props) {
  const times = clone(TimesOfDay);
  const days = clone(DaysOfWeek);

  const hasChildren = (day, time) => {
    const children = props.children({ day, time });
    return React.Children.count(children) > 0;
  };

  // Remove Saturday if there are no children on Sat
  if (times.every(time => !hasChildren('Saturday', time))) {
    days.pop();
  }

  if (days.every(day => !hasChildren(day, 'Evening'))) {
    times.pop();
  }

  return (
    <table className="module-timeslot-table">
      <thead>
        <tr className="module-timeslot-row">
          <th />
          {days.map(day => (
            <th key={`heading-${day}`} className="module-timeslot-day-label">{ day[0] }</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {times.map(time => (
          <tr className="module-timeslot-row" key={`row-${time}`}>
            <th className="module-timeslot-time-label">{ timeLabels[time] }</th>
            {days.map(day => (
              <td key={`cell-${day}-${time}`}>{ props.children({ day, time }) }</td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}
