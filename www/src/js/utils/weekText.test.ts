import { AcadWeekInfo } from 'nusmoderator';
import { noBreak } from 'utils/react';
import { getWeekText } from './weekText';

const defaultAcadWeekInfo: AcadWeekInfo = {
  year: '17/18',
  sem: 'Semester 2',
  type: 'Instructional',
  num: 2,
};
describe('#getWeekText()', () => {
  test('should return proper week text', () => {
    expect(noBreak(getWeekText({ ...defaultAcadWeekInfo, type: 'Instructional' }))).toEqual(
      noBreak('AY2017/18, Semester 2, Week 2'),
    );
    expect(noBreak(getWeekText({ ...defaultAcadWeekInfo, type: 'Reading' }))).toEqual(
      noBreak('AY2017/18, Semester 2, Reading Week 2'),
    );
    expect(noBreak(getWeekText({ ...defaultAcadWeekInfo, type: 'Examination' }))).toEqual(
      noBreak('AY2017/18, Semester 2, Examination Week 2'),
    );
    expect(noBreak(getWeekText({ ...defaultAcadWeekInfo, type: 'Recess' }))).toEqual(
      noBreak('AY2017/18, Semester 2, Recess Week 2'),
    );
    expect(noBreak(getWeekText({ ...defaultAcadWeekInfo, type: 'Vacation' }))).toEqual(
      noBreak('AY2017/18, Semester 2, Vacation Week 2'),
    );
    expect(noBreak(getWeekText({ ...defaultAcadWeekInfo, type: 'Orientation' }))).toEqual(
      noBreak('AY2017/18, Semester 2, Orientation Week 2'),
    );
    expect(
      noBreak(getWeekText({ ...defaultAcadWeekInfo, type: 'Reading', num: undefined })),
    ).toEqual(noBreak('AY2017/18, Semester 2, Reading Week'));
    expect(
      noBreak(getWeekText({ ...defaultAcadWeekInfo, type: 'Recess', num: undefined })),
    ).toEqual(noBreak('AY2017/18, Semester 2, Recess Week'));
  });
});
