import axios from 'axios';
import fs from 'fs';
import path from 'path';

import env from '../env.json';

const TERM = '2520';

// Sanity check to see if there are at least this many modules before overwriting cpexModules.json
// The last time I ran this fully there were 3418 modules
const threshold = 1500;

const baseUrl = env['baseUrl'].endsWith('/') ? env['baseUrl'].slice(0, -1) : env['baseUrl'];

const FETCH_OK = '00000';

axios.defaults.headers.common = {
  'X-STUDENT-API': env['studentKey'],
  'X-APP-API': env['appKey'],
};

function getTimestampForFilename(): string {
  function pad2(n: number): string {
    return n < 10 ? '0' + n : String(n);
  }

  const date = new Date();

  return (
    date.getFullYear().toString() +
    pad2(date.getMonth() + 1) +
    pad2(date.getDate()) +
    pad2(date.getHours()) +
    pad2(date.getMinutes()) +
    pad2(date.getSeconds())
  );
}

type ApiResponse<T> = {
  msg: string;
  code: string;
  ts: string;
  data: T;
};

type GetDepartmentsResponseData = {
  AcademicOrganisation: string;
  Description: string;
};

// Set everything to optional because we cannot trust the API to be consistent
type Module = {
  CourseTitle?: string;
  ModularCredit?: string;
  Subject?: string;
  CatalogNumber?: string;
  PrintCatalog?: string;
  ModuleAttributes?: {
    CourseAttribute: string;
    CourseAttributeValue: string;
  }[];
};

export type CPExModule = {
  title: string;
  moduleCode: string;
  moduleCredit: string;
  inS1CPEx?: boolean;
  inS2CPEx?: boolean;
};

async function scraper() {
  const getDepartmentsResponse = await axios.post<ApiResponse<GetDepartmentsResponseData[]>>(
    `${baseUrl}/config/get-acadorg`,
    {
      eff_status: 'A',
      acad_org: '%',
    },
  );
  const departmentsData = getDepartmentsResponse.data.data;
  console.log(`Total departments: ${departmentsData.length}`);

  const collatedCPExModulesMap = new Map<string, CPExModule>();

  for (let i = 0; i < departmentsData.length; i++) {
    const department = departmentsData[i];

    console.log(
      `[${i + 1}/${departmentsData.length}] Fetching modules for ${department.Description
      } with acadorg: ${department.AcademicOrganisation}...`,
    );

    const getModulesResponse = await axios.post<ApiResponse<Module[]>>(`${baseUrl}/module`, {
      acadorg: department.AcademicOrganisation,
      term: TERM,
    });

    if (getModulesResponse.data.code !== FETCH_OK) {
      console.log(
        `Error fetching modules for ${department.Description} with acadorg: ${department.AcademicOrganisation}`,
      );
      continue;
    }

    const modulesData = getModulesResponse.data.data;

    for (const module of modulesData) {
      if (
        !module.CourseTitle ||
        !module.ModularCredit ||
        !module.Subject ||
        !module.CatalogNumber ||
        !module.ModuleAttributes ||
        !module.PrintCatalog
      ) {
        continue;
      }

      // Filter out hidden modules
      if (module.PrintCatalog !== 'Y') {
        continue;
      }

      const moduleTitle = module.CourseTitle;
      const moduleCode = `${module.Subject}${module.CatalogNumber}`;

      // Filter duplicate modules
      if (collatedCPExModulesMap.has(moduleCode)) {
        continue;
      }

      const moduleCredit = module.ModularCredit;
      const cpexAttribute = module.ModuleAttributes.find(
        (attribute) => attribute.CourseAttribute === 'MPE', // this still isn't changed to CPEx
      );

      if (!cpexAttribute) {
        continue;
      }

      const cpexModuleToAdd: CPExModule = {
        title: moduleTitle,
        moduleCode,
        moduleCredit,
      };

      switch (cpexAttribute.CourseAttributeValue) {
        case 'S1':
          cpexModuleToAdd.inS1CPEx = true;
          break;
        case 'S2':
          cpexModuleToAdd.inS2CPEx = true;
          break;
        case 'S1&S2':
          cpexModuleToAdd.inS1CPEx = true;
          cpexModuleToAdd.inS2CPEx = true;
          break;
        default:
          console.log(
            `Unknown CPEx attribute value: ${cpexAttribute.CourseAttributeValue} for ${moduleCode} ${moduleTitle}`,
          );
          break;
      }
      collatedCPExModulesMap.set(moduleCode, cpexModuleToAdd);
    }
  }

  const collatedCPExModules = Array.from(collatedCPExModulesMap.values());
  console.log(`Collated ${collatedCPExModules.length} modules.`);

  const DATA_DIR = path.join(__dirname, '../../data');
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR);
  }
  const OLD_DATA_DIR = path.join(DATA_DIR, '/old');
  if (!fs.existsSync(OLD_DATA_DIR)) {
    fs.mkdirSync(OLD_DATA_DIR);
  }

  if (collatedCPExModules.length >= threshold) {
    fs.writeFileSync(path.join(DATA_DIR, 'cpexModules.json'), JSON.stringify(collatedCPExModules));
    console.log(`Wrote ${collatedCPExModules.length} modules to cpexModules.json.`);
  } else {
    console.log(
      `Not writing to cpexModules.json because the number of modules ${collatedCPExModules.length} is less than the threshold of ${threshold}.`,
    );
  }

  const archiveFilename = `cpexModules-${getTimestampForFilename()}.json`;
  fs.writeFileSync(path.join(OLD_DATA_DIR, archiveFilename), JSON.stringify(collatedCPExModules));
  console.log(`Wrote ${collatedCPExModules.length} modules to archive ${archiveFilename}.`);
  console.log('Done!');
}

scraper().catch((error) => {
  console.error(`Failed to scrape: ${error}`);
});
