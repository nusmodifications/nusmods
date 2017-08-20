// @flow

import React from 'react';
import { shallow } from 'enzyme';

import TimeslotTable from './TimeslotTable';

test('should show children', () => {
  const table = shallow(
    <TimeslotTable>{ ({ day, time }) => `${day} ${time}` }</TimeslotTable>,
  );
  const tr = table.find('tr');

  // Four rows - one heading and three time of day
  expect(tr).toHaveLength(4);

  // Each row should have 1 th + 6 td
  tr.forEach(row => expect(row.children()).toHaveLength(7));

  // Six day of the week headings + three time of day
  expect(table.find('th').filterWhere(th => !!th.text())).toHaveLength(9);
});

test('should not show Saturday column if it has no content', () => {
  const children = ({ day }) => {
    if (day !== 'Saturday') return day;
    return null;
  };

  const table = shallow(
    <TimeslotTable>{ children }</TimeslotTable>,
  );

  // Each row should have 1 th + 6 td (no Saturday)
  table.find('tr').forEach(tr => expect(tr.children()).toHaveLength(6));
});

test('should not show Evening row if it has no content', () => {
  const children = ({ time }) => {
    if (time !== 'Evening') return time;
    return null;
  };

  const table = shallow(
    <TimeslotTable>{ children }</TimeslotTable>,
  );

  // Table should have 3 rows (no Evening)
  expect(table.find('tr')).toHaveLength(3);
});
