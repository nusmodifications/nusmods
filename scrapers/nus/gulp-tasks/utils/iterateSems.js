import R from 'ramda';

/**
 * Generates an array of configuration for gulp tasks use.
 */
export default function iterateSems(obj) {
  const { semesters, config } = obj;
  const yearStart = obj.from;
  const yearEnd = obj.to;
  const years = R.range(yearStart, yearEnd);

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
