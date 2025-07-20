import { filterTimeOptions, toTimeLabel } from './timeOptions';

describe('timeOptions', () => {
  describe('toTimeLabel', () => {
    test.each([
      ['0800', '08:00'],
      ['0915', '09:15'],
      ['1030', '10:30'],
      ['1145', '11:45'],
      ['0333', '03:33'],
    ])('should return the correct time label for %s', (time, expected) => {
      expect(toTimeLabel(time)).toBe(expected);
    });
  });

  describe('filterTimeOptions', () => {
    const timeOptions = [
      '0800',
      '0830',
      '0900',
      '0930',
      '1000',
      '1030',
      '1100',
      '1130',
      '1200',
      '1230',
    ];

    describe('when filter is greater', () => {
      it('should keep times greater than selected time', () => {
        expect(filterTimeOptions(timeOptions, '1000', 'greater')).toEqual([
          '1030',
          '1100',
          '1130',
          '1200',
          '1230',
        ]);
      });
    });

    describe('when filter is lesser', () => {
      it('should keep times lesser than selected time', () => {
        expect(filterTimeOptions(timeOptions, '1000', 'lesser')).toEqual([
          '0800',
          '0830',
          '0900',
          '0930',
        ]);
      });
    });
  });
});
