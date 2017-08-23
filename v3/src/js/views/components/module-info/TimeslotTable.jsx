// @flow

import React from 'react';
import type { Node } from 'react';
import { clone } from 'lodash';
import { DaysOfWeek, TimesOfDay } from 'types/modules';
import type { Time } from 'types/modules';
import { getTimeslot } from 'utils/modules';

type Props = {
  children: Map<string, Node>,
};

const timeLabels: { [Time]: string } = {
  Morning: 'A.M.',
  Afternoon: 'P.M.',
  Evening: 'Night',
};

export default function TimeslotTable(props: Props) {
  const { children } = props;
  const times = clone(TimesOfDay);
  const days = clone(DaysOfWeek);

  const hasChildren = (day, time) => {
    const timeslot = getTimeslot(day, time);
    return React.Children.count(children.get(timeslot)) > 0;
  };

  // Remove Saturday if there are no children on Saturday
  if (times.every(time => !hasChildren('Saturday', time))) {
    days.pop();
  }

  // Remove evening if there are no evening children
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
              <td key={`cell-${day}-${time}`}>{ children.get(getTimeslot(day, time)) }</td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}
