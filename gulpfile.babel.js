import gulp from 'gulp';

const now = new Date();
const currentMonth = now.getMonth() + 1;
const currentYear = now.getFullYear();

const JULY = 7;
const schoolYear = currentYear + (currentMonth < JULY);

const AY_START = process.env.YEAR || schoolYear;
const AY_END = AY_START + 1;

function test(done) {
  done();
}

gulp.task('default', test);
