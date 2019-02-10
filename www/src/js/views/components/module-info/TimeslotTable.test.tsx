import * as React from 'react';
import { shallow } from 'enzyme';
import { cartesianProduct } from 'js-combinatorics';

import { Day, Time, WorkingDaysOfWeek, TimesOfDay } from 'types/modules';

import { getTimeslot } from 'utils/modules';
import TimeslotTable from './TimeslotTable';

function buildChildren(mapper: (day: Day, time: Time) => React.ReactNode) {
  const children = new Map();
  cartesianProduct(WorkingDaysOfWeek, TimesOfDay).forEach(([day, time]) => {
    children.set(getTimeslot(day, time), mapper(day, time));
  });
  return children;
}

test('should show children', () => {
  const table = shallow(
    <TimeslotTable>{buildChildren((day, time) => getTimeslot(day, time))}</TimeslotTable>,
  );
  const tr = table.find('tr');

  // Four rows - one heading and three time of day
  expect(tr).toHaveLength(4);

  // Each row should have 1 th + 6 td
  tr.forEach((row) => expect(row.children()).toHaveLength(7));

  // Six day of the week headings + three time of day
  expect(table.find('th').filterWhere((th) => !!th.text())).toHaveLength(9);
});

test('should not show Saturday column if it has no content', () => {
  const table = shallow(
    <TimeslotTable>{buildChildren((day) => (day === 'Saturday' ? null : day))}</TimeslotTable>,
  );

  // Each row should have 1 th + 6 td (no Saturday)
  table.find('tr').forEach((tr) => expect(tr.children()).toHaveLength(6));
});

test('should not show Evening row if it has no content', () => {
  const table = shallow(
    <TimeslotTable>
      {buildChildren((day, time) => (time === 'Evening' ? null : time))}
    </TimeslotTable>,
  );

  // Table should have 3 rows (no Evening)
  expect(table.find('tr')).toHaveLength(3);
});
