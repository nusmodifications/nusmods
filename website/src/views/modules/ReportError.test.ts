import { each, groupBy } from 'lodash-es';
import stringify from 'fast-json-stable-stringify';

import facultyEmails from '../../data/facultyEmail';

describe('facultyEmails', () => {
  // These tests prevent data entry errors
  it('should not have duplicate IDs', () => {
    const configByCode = groupBy(facultyEmails, (config) => config.id);
    each(configByCode, (config) => {
      expect(config).toHaveLength(1);
    });
  });

  it('should not have duplicate labels', () => {
    const configByLabel = groupBy(facultyEmails, (config) => config.label);
    each(configByLabel, (config) => {
      expect(config).toHaveLength(1);
    });
  });

  it('should not have duplicate email', () => {
    // Some departments genuinely do share emails for some reason
    const expectedDuplicates = new Set([
      'fasbox58@nus.edu.sg',
      'fasbox59@nus.edu.sg',
      'fasbox63@nus.edu.sg',
    ]);

    const configByCode = groupBy(facultyEmails, (config) => config.email);
    each(configByCode, (config) => {
      if (expectedDuplicates.has(config[0].email)) return;

      expect(config).toHaveLength(1);
    });
  });

  it('should not have duplicate matchers', () => {
    const configByMatcher = groupBy(facultyEmails, (config) => stringify(config.match));

    each(configByMatcher, (config) => {
      expect(config).toHaveLength(1);
    });
  });
});
