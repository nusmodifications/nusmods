import axios from 'axios';
import env from '../env.json';
import fs from 'fs';
import path from 'path';

// Configure this!
const term = '2310';
// Sanity check to see if there are at least this many modules before overwriting mpeModules.json
// The last time I ran this fully there were 10092 modules
const threshold = 7000;

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

export type MPEModule = {
  title: string;
  moduleCode: string;
  moduleCredit: string;
  inS1MPE?: boolean;
  inS2MPE?: boolean;
};

const scraper = async () => {
  const getDepartmentsResponse = await axios.post<ApiResponse<GetDepartmentsResponseData[]>>(
    `${baseUrl}/config/get-acadorg`,
    {
      eff_status: 'A',
      acad_org: '%',
    },
  );
  const departmentsData = getDepartmentsResponse.data.data;

  const collatedMpeModulesMap = new Map<string, MPEModule>();
  console.log(`Total departments: ${departmentsData.length}`);
  let i = 0;

  for (const department of departmentsData) {
    console.log(
      `[${++i}/${departmentsData.length}] Fetching modules for ${
        department.Description
      } with acadorg: ${department.AcademicOrganisation}...`,
    );

    const getModulesResponse = await axios.post<ApiResponse<Module[]>>(`${baseUrl}/module`, {
      acadorg: department.AcademicOrganisation,
      term,
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
      if (collatedMpeModulesMap.has(moduleCode)) {
        continue;
      }

      const moduleCredit = module.ModularCredit;
      const mpeAttribute = module.ModuleAttributes.find(
        (attribute) => attribute.CourseAttribute === 'MPE',
      );

      if (!mpeAttribute) {
        continue;
      }

      const mpeModuleToAdd: MPEModule = {
        title: moduleTitle,
        moduleCode,
        moduleCredit,
      };

      switch (mpeAttribute.CourseAttributeValue) {
        case 'S1':
          mpeModuleToAdd.inS1MPE = true;
          break;
        case 'S2':
          mpeModuleToAdd.inS2MPE = true;
          break;
        case 'S1&S2':
          mpeModuleToAdd.inS1MPE = true;
          mpeModuleToAdd.inS2MPE = true;
          break;
        default:
          console.log(
            `Unknown MPE attribute value: ${mpeAttribute.CourseAttributeValue} for ${moduleCode} ${moduleTitle}`,
          );
          break;
      }
      collatedMpeModulesMap.set(moduleCode, mpeModuleToAdd);
    }
  }

  const collatedMpeModules = Array.from(collatedMpeModulesMap.values());

  console.log(`Collated ${collatedMpeModules.length} modules.`);
  const DATA_DIR = path.join(__dirname, '../../data');
  const OLD_DATA_DIR = path.join(DATA_DIR, '/old');
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR);
  }
  if (!fs.existsSync(OLD_DATA_DIR)) {
    fs.mkdirSync(OLD_DATA_DIR);
  }

  if (collatedMpeModules.length >= threshold) {
    fs.writeFileSync(path.join(DATA_DIR, 'mpeModules.json'), JSON.stringify(collatedMpeModules));
    console.log(`Wrote ${collatedMpeModules.length} modules to mpeModules.json.`);
  } else {
    console.log(
      `Not writing to mpeModules.json because the number of modules ${collatedMpeModules.length} is less than the threshold of ${threshold}.`,
    );
  }
  const archiveFilename = `mpeModules-${getTimestampForFilename()}.json`;
  fs.writeFileSync(path.join(OLD_DATA_DIR, archiveFilename), JSON.stringify(collatedMpeModules));
  console.log(`Wrote ${collatedMpeModules.length} modules to archive ${archiveFilename}.`);
  console.log('Done!');
};

scraper();
