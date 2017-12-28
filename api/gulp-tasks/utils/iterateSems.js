import R from 'ramda';

/**
 * Generates an array of configuration for gulp tasks use.
 */
export default function iterateSems(obj) {
  const yearStart = obj.from;
  const yearEnd = obj.to;

  const semesters = obj.semesters;

  const years = R.range(yearStart, yearEnd);
  const config = obj.config;

  // eslint-disable-next-line
  const injectConfig = R.map(([year, semester]) => {
    return {
      ...config,
      year,
      semester,
    };
  });

  const allSems = R.xprod(years, semesters);
  return injectConfig(allSems);
}
