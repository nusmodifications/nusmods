import academicCalendarJSON from './academic-calendar.json';

// Force TS to accept our typing instead of inferring from the JSON
type DateTuple = [number, number, number];
const academicCalendar = (academicCalendarJSON as unknown) as {
  [year: string]: {
    [semester: string]: { start: DateTuple };
  };
};

export default academicCalendar;
