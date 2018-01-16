// @flow

import { getWeekText } from './weekText';

const defaultAWI = { year: '17/18', sem: 'Semester 2', type: 'Instructional', num: 1 };
describe('#getWeekText()', () => {
	test('week type test', () => {
		expect(getWeekText({ ...defaultAWI, type: 'Instructional' })[2]).not.toContain('Instructional');
		expect(getWeekText({ ...defaultAWI, type: 'Reading'})[2]).toContain('Reading');
		expect(getWeekText({ ...defaultAWI, type: 'Examination'})[2]).toContain('Examination');
		expect(getWeekText({ ...defaultAWI, type: 'Recess'})[2]).toContain('Recess');
		expect(getWeekText({ ...defaultAWI, type: 'Vacation'})[2]).toContain('Vacation');
		expect(getWeekText({ ...defaultAWI, type: 'Orientation'})[2]).toContain('Orientation');
	});
});