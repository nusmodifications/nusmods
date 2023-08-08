import _ from 'lodash';
import stringify from 'fast-json-stable-stringify';

import facultyEmails from '../../data/facultyEmail';

describe('facultyEmails', () => {
  // These tests prevent data entry errors
  it('should not have duplicate IDs', () => {
    const configByCode = _.groupBy(facultyEmails, (config) => config.id);
    _.each(configByCode, (config) => {
      expect(config).toHaveLength(1);
    });
  });

  it('should not have duplicate labels', () => {
    const configByLabel = _.groupBy(facultyEmails, (config) => config.label);
    _.each(configByLabel, (config) => {
      expect(config).toHaveLength(1);
    });
  });

  it('should not have duplicate email', () => {
    // Some departments genuinely do share emails for some reason
    const expectedDuplicates = new Set(['fasbox59@nus.edu.sg']);

    const configByCode = _.groupBy(facultyEmails, (config) => config.email);
    _.each(configByCode, (config) => {
      if (expectedDuplicates.has(config[0].email)) return;

      expect(config).toHaveLength(1);
    });
  });

  it('should not have duplicate matchers', () => {
    const configByMatcher = _.groupBy(facultyEmails, (config) => stringify(config.match));

    _.each(configByMatcher, (config) => {
      expect(config).toHaveLength(1);
    });
  });
});
