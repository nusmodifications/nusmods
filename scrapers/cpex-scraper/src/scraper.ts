import axios from 'axios';
import fs from 'fs';
import path from 'path';

const FETCH_OK = '00000';

export const MAX_ITEMS = 1000;

export type ScraperEnv = {
  baseUrl: string;
  acadApiKey: string;
  acadAppKey: string;
  courseApiKey: string;
};

type V1ApiResponse<T> = {
  msg: string;
  code: string;
  data: T;
};

type AcademicGrp = {
  EffectiveStatus: string;
  AcademicGroup: string;
  DescriptionShort: string;
  Description: string;
  EffectiveDate: string;
};

type Module = {
  Title?: string;
  UnitsMin?: number | null;
  SubjectArea?: string;
  CatalogNumber?: string;
  CourseAttributes?: {
    Code: string;
    Value: string;
  }[];
};

export type CPExModule = {
  title: string;
  moduleCode: string;
  moduleCredit: string;
  inS1CPEx?: boolean;
  inS2CPEx?: boolean;
};

type Logger = Pick<Console, 'log'>;

type HttpClient = Pick<typeof axios, 'get'>;

type FileSystem = Pick<typeof fs, 'existsSync' | 'mkdirSync' | 'writeFileSync'>;

type PathModule = Pick<typeof path, 'join'>;

export type ScrapeResult = {
  modules: CPExModule[];
  archiveFilename: string;
  wroteCurrentFile: boolean;
  summary: {
    totalRawRows: number;
    skippedIncomplete: number;
    unknownMpeValues: number;
    duplicatesMerged: number;
  };
};

export type ScrapeOptions = {
  env: ScraperEnv;
  academicYear: string;
  threshold: number;
  outputDir?: string;
  now?: Date;
  axiosClient?: HttpClient;
  fileSystem?: FileSystem;
  pathModule?: PathModule;
  logger?: Logger;
};

const mpeValueMap: Record<string, { inS1CPEx?: boolean; inS2CPEx?: boolean }> = {
  'S1 - Sem 1': { inS1CPEx: true },
  'S2 - Sem 2': { inS2CPEx: true },
  'S1&S2 - Sem 1 & 2': { inS1CPEx: true, inS2CPEx: true },
  S1: { inS1CPEx: true },
  S2: { inS2CPEx: true },
  'S1&S2': { inS1CPEx: true, inS2CPEx: true },
};

export function getTimestampForFilename(date: Date = new Date()): string {
  function pad2(n: number): string {
    return n < 10 ? `0${n}` : String(n);
  }

  return (
    date.getFullYear().toString() +
    pad2(date.getMonth() + 1) +
    pad2(date.getDate()) +
    pad2(date.getHours()) +
    pad2(date.getMinutes()) +
    pad2(date.getSeconds())
  );
}

export function cleanString(s: string): string {
  return s
    .replace(/<[^>]*>?/gm, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/\u00A0/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export function normalizeModuleCode(subject: string, catalogNbr: string): string {
  const raw = cleanString(subject) + cleanString(catalogNbr);
  return raw.replace(/\s/g, '').toUpperCase();
}

export function normalizeTitle(s: string): string {
  return cleanString(s);
}

export function normalizeCredit(n: number | null): string {
  return n === null ? '0' : String(n).trim();
}

function getBaseUrl(baseUrl: string): string {
  return baseUrl.endsWith('/') ? baseUrl : `${baseUrl}/`;
}

function ensureDir(fileSystem: FileSystem, dirPath: string): void {
  if (!fileSystem.existsSync(dirPath)) {
    fileSystem.mkdirSync(dirPath);
  }
}

export async function scraper({
  env,
  academicYear,
  threshold,
  outputDir = path.join(__dirname, '../../data'),
  now = new Date(),
  axiosClient = axios,
  fileSystem = fs,
  pathModule = path,
  logger = console,
}: ScrapeOptions): Promise<ScrapeResult> {
  const baseUrl = getBaseUrl(env.baseUrl);

  const acadHeaders = {
    'Content-Type': 'application/json',
    'X-API-KEY': env.acadApiKey,
    'X-APP-KEY': env.acadAppKey,
  };

  const courseHeaders = {
    'Content-Type': 'application/json',
    'X-API-KEY': env.courseApiKey,
  };

  const getFacultiesResponse = await axiosClient.get<V1ApiResponse<AcademicGrp[]>>(
    `${baseUrl}edurec/config/v1/get-acadgroup`,
    { headers: acadHeaders },
  );

  if (getFacultiesResponse.data.code !== FETCH_OK) {
    throw new Error(`Failed to fetch faculties: ${getFacultiesResponse.data.msg}`);
  }

  const facultiesData = [...getFacultiesResponse.data.data];

  if (!facultiesData.some((faculty) => faculty.AcademicGroup === '099')) {
    facultiesData.push({
      AcademicGroup: '099',
      DescriptionShort: 'Non-Faculty-based Departments',
      Description: 'Non-Faculty-based Departments',
      EffectiveStatus: 'A',
      EffectiveDate: '1905-01-01',
    });
  }

  logger.log(`Total faculties: ${facultiesData.length}`);

  const collatedCPExModulesMap = new Map<string, CPExModule>();

  let totalRawRows = 0;
  let skippedIncomplete = 0;
  let duplicatesMerged = 0;
  const unknownMpeValues = new Set<string>();

  for (let i = 0; i < facultiesData.length; i++) {
    const faculty = facultiesData[i];

    if (faculty.EffectiveStatus !== 'A') {
      continue;
    }

    const acadGroupCode =
      faculty.AcademicGroup.length >= 3 ? faculty.AcademicGroup.slice(0, 3) : faculty.AcademicGroup;

    logger.log(
      `[${i + 1}/${facultiesData.length}] Fetching modules for ${faculty.Description} (${acadGroupCode})...`,
    );

    let offset = 0;
    let hasMore = true;

    while (hasMore) {
      let modules: Module[];

      try {
        const getModulesResponse = await axiosClient.get<{ data: Module[]; itemCount: number }>(
          `${baseUrl}CourseNUSMods`,
          {
            headers: courseHeaders,
            params: {
              acadGroupCode,
              applicableInYear: academicYear,
              latestVersionOnly: 'True',
              maxItems: String(MAX_ITEMS),
              offset: String(offset),
            },
          },
        );

        modules = getModulesResponse.data.data;
      } catch (error: unknown) {
        const err = error as { response?: { status?: number }; message?: string };

        if (err.response?.status === 404) {
          logger.log(`  No modules found for ${faculty.Description} (404)`);
          break;
        }

        logger.log(
          `  Error fetching modules for ${faculty.Description} (${acadGroupCode}): ${err.message}`,
        );
        break;
      }

      for (const module of modules) {
        totalRawRows++;

        if (
          !module.Title ||
          module.UnitsMin == null ||
          !module.SubjectArea ||
          !module.CatalogNumber ||
          !module.CourseAttributes
        ) {
          skippedIncomplete++;
          continue;
        }

        const moduleCode = normalizeModuleCode(module.SubjectArea, module.CatalogNumber);
        const moduleTitle = normalizeTitle(module.Title);
        const moduleCredit = normalizeCredit(module.UnitsMin);

        const cpexAttribute = module.CourseAttributes.find(
          (attribute) => attribute.Code.trim() === 'MPE',
        );

        if (!cpexAttribute) {
          continue;
        }

        const value = cpexAttribute.Value.trim();
        const semesterFlags = mpeValueMap[value];

        if (!semesterFlags) {
          if (!unknownMpeValues.has(value)) {
            logger.log(`Unknown CPEx attribute value: '${value}' (first seen at ${moduleCode})`);
            unknownMpeValues.add(value);
          }

          continue;
        }

        const existing = collatedCPExModulesMap.get(moduleCode);

        if (existing) {
          duplicatesMerged++;

          if (existing.title !== moduleTitle) {
            logger.log(
              `  Warning: conflicting title for ${moduleCode}: '${existing.title}' vs '${moduleTitle}'`,
            );
          }

          if (existing.moduleCredit !== moduleCredit) {
            logger.log(
              `  Warning: conflicting credit for ${moduleCode}: '${existing.moduleCredit}' vs '${moduleCredit}'`,
            );
          }

          existing.title = existing.title || moduleTitle;
          existing.moduleCredit = existing.moduleCredit || moduleCredit;
          existing.inS1CPEx = existing.inS1CPEx || semesterFlags.inS1CPEx;
          existing.inS2CPEx = existing.inS2CPEx || semesterFlags.inS2CPEx;
          continue;
        }

        collatedCPExModulesMap.set(moduleCode, {
          title: moduleTitle,
          moduleCode,
          moduleCredit,
          ...semesterFlags,
        });
      }

      if (modules.length < MAX_ITEMS) {
        hasMore = false;
      } else {
        offset += MAX_ITEMS;
      }
    }
  }

  const modules = Array.from(collatedCPExModulesMap.values()).sort((a, b) =>
    a.moduleCode.localeCompare(b.moduleCode),
  );

  logger.log('\n--- Scrape Summary ---');
  logger.log(`Total raw rows:          ${totalRawRows}`);
  logger.log(`Skipped (incomplete):    ${skippedIncomplete}`);
  logger.log(`Unknown MPE values:      ${unknownMpeValues.size}`);
  logger.log(`Duplicate codes merged:  ${duplicatesMerged}`);
  logger.log(`Final module count:      ${modules.length}`);

  ensureDir(fileSystem, outputDir);

  const archiveDir = pathModule.join(outputDir, 'old');
  ensureDir(fileSystem, archiveDir);

  let wroteCurrentFile = false;

  if (modules.length >= threshold) {
    fileSystem.writeFileSync(
      pathModule.join(outputDir, 'cpexModules.json'),
      JSON.stringify(modules),
    );
    logger.log(`Wrote ${modules.length} modules to cpexModules.json.`);
    wroteCurrentFile = true;
  } else {
    logger.log(
      `Not writing to cpexModules.json because the number of modules ${modules.length} is less than the threshold of ${threshold}.`,
    );
  }

  const archiveFilename = `cpexModules-${getTimestampForFilename(now)}.json`;
  fileSystem.writeFileSync(pathModule.join(archiveDir, archiveFilename), JSON.stringify(modules));
  logger.log(`Wrote ${modules.length} modules to archive ${archiveFilename}.`);
  logger.log('Done!');

  return {
    modules,
    archiveFilename,
    wroteCurrentFile,
    summary: {
      totalRawRows,
      skippedIncomplete,
      unknownMpeValues: unknownMpeValues.size,
      duplicatesMerged,
    },
  };
}

export const scrapeCPEx = scraper;
