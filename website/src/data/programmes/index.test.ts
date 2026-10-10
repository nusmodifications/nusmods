import programmes, { programmeList } from '.';

const MODULE_CODE_FORMAT = /^[A-Z]{2,4}\d{4}[A-Z]{0,3}$/;

describe('programmes', () => {
  test('should use the programme id as its key', () => {
    Object.entries(programmes).forEach(([id, programme]) => {
      expect(programme.id).toEqual(id);
    });
  });

  test('should have data provenance fields', () => {
    programmeList.forEach((programme) => {
      expect(programme.source).toMatch(/^https:\/\//);
      expect(programme.lastVerified).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    });
  });

  test('should have unique requirement ids within each programme', () => {
    programmeList.forEach((programme) => {
      const ids = programme.requirements.map((requirement) => requirement.id);
      expect(new Set(ids).size).toEqual(ids.length);
    });
  });

  test('should have at least one matcher for every requirement', () => {
    programmeList.forEach((programme) =>
      programme.requirements.forEach((requirement) => {
        expect(requirement.matchers.length).toBeGreaterThan(0);
      }),
    );
  });

  test('should only contain well-formed module codes and prefixes', () => {
    programmeList.forEach((programme) =>
      programme.requirements.forEach((requirement) =>
        requirement.matchers.forEach((matcher) => {
          if (matcher.kind === 'modules') {
            expect(matcher.codes.length).toBeGreaterThan(0);
            matcher.codes.forEach((code) => expect(code).toMatch(MODULE_CODE_FORMAT));
          } else {
            expect(matcher.prefixes.length).toBeGreaterThan(0);
            matcher.prefixes.forEach((prefix) => expect(prefix).toMatch(/^[A-Z]{2,4}$/));
          }
        }),
      ),
    );
  });
});
