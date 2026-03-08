import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

import {
  cleanString,
  getTimestampForFilename,
  MAX_ITEMS,
  normalizeCredit,
  normalizeModuleCode,
  normalizeTitle,
  scrapeCPEx,
} from '../src/scraper';

describe('normalization helpers', () => {
  test('cleanString strips tags, decodes entities, and collapses whitespace', () => {
    expect(cleanString(' <p>CS&nbsp;1010 &amp; &lt;stuff&gt;</p>\u00A0 ')).toBe(
      'CS 1010 & <stuff>',
    );
  });

  test('normalizeModuleCode removes whitespace and uppercases the result', () => {
    expect(normalizeModuleCode(' cs&nbsp; ', ' 10 <b>10</b>a ')).toBe('CS1010A');
  });

  test('normalizeTitle and normalizeCredit normalize source values', () => {
    expect(normalizeTitle('  Intro&nbsp;to <i>Programming</i>  ')).toBe('Intro to Programming');
    expect(normalizeCredit(4)).toBe('4');
    expect(normalizeCredit(null)).toBe('0');
  });

  test('getTimestampForFilename formats a date with zero padding', () => {
    expect(getTimestampForFilename(new Date(2025, 2, 4, 5, 6, 7))).toBe('20250304050607');
  });
});

describe(scrapeCPEx, () => {
  let tempDir: string;

  beforeEach(() => {
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'cpex-scraper-test-'));
  });

  afterEach(() => {
    fs.rmSync(tempDir, { force: true, recursive: true });
  });

  test('collates modules, merges duplicates, and writes current and archive files', async () => {
    const logger = { log: vi.fn() };
    const get = vi
      .fn()
      .mockImplementation((url: string, config?: { params?: Record<string, string> }) => {
        if (url.endsWith('/edurec/config/v1/get-acadgroup')) {
          return Promise.resolve({
            data: {
              code: '00000',
              msg: 'ok',
              data: [
                {
                  AcademicGroup: '001',
                  Description: 'Faculty of Computing',
                  DescriptionShort: 'Computing',
                  EffectiveDate: '1905-01-01',
                  EffectiveStatus: 'A',
                },
                {
                  AcademicGroup: '002',
                  Description: 'Inactive Faculty',
                  DescriptionShort: 'Inactive',
                  EffectiveDate: '1905-01-01',
                  EffectiveStatus: 'I',
                },
              ],
            },
          });
        }

        if (url.endsWith('/CourseNUSMods') && config?.params?.offset === '0') {
          if (config.params.acadGroupCode === '001') {
            return Promise.resolve({
              data: {
                data: [
                  {
                    Title: ' Intro &amp; Programming ',
                    UnitsMin: 4,
                    SubjectArea: ' cs ',
                    CatalogNumber: ' 1010 ',
                    CourseAttributes: [{ Code: 'MPE', Value: 'S1 - Sem 1' }],
                  },
                  {
                    Title: 'Intro & Programming',
                    UnitsMin: 4,
                    SubjectArea: 'CS',
                    CatalogNumber: '1010',
                    CourseAttributes: [{ Code: ' MPE ', Value: ' S2 - Sem 2 ' }],
                  },
                  {
                    Title: 'Linear Algebra',
                    UnitsMin: 4,
                    SubjectArea: 'MA',
                    CatalogNumber: '1521',
                    CourseAttributes: [{ Code: 'MPE', Value: 'S1&S2 - Sem 1 & 2' }],
                  },
                  {
                    Title: 'Unknown Value Module',
                    UnitsMin: 4,
                    SubjectArea: 'CS',
                    CatalogNumber: '9999',
                    CourseAttributes: [{ Code: 'MPE', Value: 'Summer' }],
                  },
                  {
                    Title: 'Incomplete Module',
                    UnitsMin: 4,
                    SubjectArea: 'CS',
                    CatalogNumber: '1111',
                  },
                  {
                    Title: 'Ignored Attribute Module',
                    UnitsMin: 4,
                    SubjectArea: 'CS',
                    CatalogNumber: '1231',
                    CourseAttributes: [{ Code: 'OTHER', Value: 'Nope' }],
                  },
                ],
                itemCount: 6,
              },
            });
          }

          if (config.params.acadGroupCode === '099') {
            return Promise.reject({
              message: 'Not found',
              response: { status: 404 },
            });
          }
        }

        throw new Error(`Unexpected request: ${url}`);
      });

    const result = await scrapeCPEx({
      academicYear: '2025/26',
      env: {
        acadApiKey: 'acad-key',
        acadAppKey: 'acad-app-key',
        baseUrl: 'https://example.com/api',
        courseApiKey: 'course-key',
      },
      axiosClient: { get } as never,
      logger,
      now: new Date(2025, 2, 8, 9, 10, 11),
      outputDir: tempDir,
      threshold: 2,
    });

    expect(result.modules).toEqual([
      {
        inS1CPEx: true,
        inS2CPEx: true,
        moduleCode: 'CS1010',
        moduleCredit: '4',
        title: 'Intro & Programming',
      },
      {
        inS1CPEx: true,
        inS2CPEx: true,
        moduleCode: 'MA1521',
        moduleCredit: '4',
        title: 'Linear Algebra',
      },
    ]);
    expect(result.summary).toEqual({
      duplicatesMerged: 1,
      skippedIncomplete: 1,
      totalRawRows: 6,
      unknownMpeValues: 1,
    });
    expect(result.wroteCurrentFile).toBe(true);
    expect(result.archiveFilename).toBe('cpexModules-20250308091011.json');

    expect(get).toHaveBeenCalledTimes(3);
    expect(get.mock.calls[1]?.[1]?.params?.acadGroupCode).toBe('001');
    expect(get.mock.calls[2]?.[1]?.params?.acadGroupCode).toBe('099');

    const currentFile = path.join(tempDir, 'cpexModules.json');
    const archiveFile = path.join(tempDir, 'old', result.archiveFilename);

    expect(JSON.parse(fs.readFileSync(currentFile, 'utf8'))).toEqual(result.modules);
    expect(JSON.parse(fs.readFileSync(archiveFile, 'utf8'))).toEqual(result.modules);
    expect(logger.log).toHaveBeenCalledWith(
      "Unknown CPEx attribute value: 'Summer' (first seen at CS9999)",
    );
  });

  test('continues pagination and skips writing the current file below the threshold', async () => {
    const logger = { log: vi.fn() };
    const firstPage = Array.from({ length: MAX_ITEMS }, (_, index) => ({
      Title: `Module ${index}`,
      UnitsMin: 4,
      SubjectArea: 'CS',
      CatalogNumber: String(1000 + index),
      CourseAttributes: [{ Code: 'MPE', Value: 'S1 - Sem 1' }],
    }));

    const get = vi
      .fn()
      .mockImplementation((url: string, config?: { params?: Record<string, string> }) => {
        if (url.endsWith('/edurec/config/v1/get-acadgroup')) {
          return Promise.resolve({
            data: {
              code: '00000',
              msg: 'ok',
              data: [
                {
                  AcademicGroup: '001',
                  Description: 'Faculty of Computing',
                  DescriptionShort: 'Computing',
                  EffectiveDate: '1905-01-01',
                  EffectiveStatus: 'A',
                },
              ],
            },
          });
        }

        if (url.endsWith('/CourseNUSMods') && config?.params?.acadGroupCode === '001') {
          if (config.params.offset === '0') {
            return Promise.resolve({
              data: {
                data: firstPage,
                itemCount: MAX_ITEMS + 1,
              },
            });
          }

          if (config.params.offset === String(MAX_ITEMS)) {
            return Promise.resolve({
              data: {
                data: [
                  {
                    Title: 'Module tail',
                    UnitsMin: 4,
                    SubjectArea: 'CS',
                    CatalogNumber: '9999',
                    CourseAttributes: [{ Code: 'MPE', Value: 'S2 - Sem 2' }],
                  },
                ],
                itemCount: MAX_ITEMS + 1,
              },
            });
          }
        }

        if (url.endsWith('/CourseNUSMods') && config?.params?.acadGroupCode === '099') {
          return Promise.reject({
            message: 'Not found',
            response: { status: 404 },
          });
        }

        throw new Error(`Unexpected request: ${url}`);
      });

    const result = await scrapeCPEx({
      academicYear: '2025/26',
      env: {
        acadApiKey: 'acad-key',
        acadAppKey: 'acad-app-key',
        baseUrl: 'https://example.com/api/',
        courseApiKey: 'course-key',
      },
      axiosClient: { get } as never,
      logger,
      outputDir: tempDir,
      threshold: MAX_ITEMS + 2,
    });

    expect(result.modules).toHaveLength(MAX_ITEMS + 1);
    expect(result.wroteCurrentFile).toBe(false);
    expect(get.mock.calls[1]?.[1]?.params?.offset).toBe('0');
    expect(get.mock.calls[2]?.[1]?.params?.offset).toBe(String(MAX_ITEMS));
    expect(fs.existsSync(path.join(tempDir, 'cpexModules.json'))).toBe(false);
    expect(fs.existsSync(path.join(tempDir, 'old', result.archiveFilename))).toBe(true);
    expect(logger.log).toHaveBeenCalledWith(
      `Not writing to cpexModules.json because the number of modules ${MAX_ITEMS + 1} is less than the threshold of ${MAX_ITEMS + 2}.`,
    );
  });
});
