import academicCalendarJSON from './academic-calendar.json';

// Force TS to accept our typing instead of inferring from the JSON
type DateTuple = [number, number, number];
const academicCalendar: {
  [year: string]: {
    [semester: string]: { start: DateTuple };
  };
} = academicCalendarJSON as any; // eslint-disable-line @typescript-eslint/no-explicit-any

export default academicCalendar;
