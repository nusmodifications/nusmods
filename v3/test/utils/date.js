import test from 'ava';

import { dateForDisplay } from 'utils/date';

test('dateForDisplay should remove timezone from date', (t) => {
  const date = '2016-11-23T09:00+0800';
  const result = dateForDisplay(date);
  const expected = '2016-11-23 09:00';
  t.is(result, expected);
});
