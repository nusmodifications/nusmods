import getExamTimetables from '../gulp-tasks/examTimetable';

describe('getExamTimetables', () => {
  it('saves object to cache folder', async () => {
    console.log(await getExamTimetables());
  });
});
