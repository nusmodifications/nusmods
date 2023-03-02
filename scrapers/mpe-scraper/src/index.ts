import axios from 'axios';
import env from '../env.json';
import fs from 'fs';

// Configure this!
const term = '2310';

const baseUrl = env['baseUrl'].endsWith('/') ? env['baseUrl'].slice(0, -1) : env['baseUrl'];

const FETCH_OK = '00000';

axios.defaults.headers.common = {
  'X-STUDENT-API': env['studentKey'],
  'X-APP-API': env['appKey'],
};

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

type Module = {
  CourseTitle?: string;
  ModularCredit?: string;
  Subject?: string;
  CatalogNumber?: string;
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

  const collatedMpeModules: MPEModule[] = [];
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
        !module.ModuleAttributes
      ) {
        continue;
      }

      const moduleTitle = module.CourseTitle;
      const moduleCode = `${module.Subject}${module.CatalogNumber}`;
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
      collatedMpeModules.push(mpeModuleToAdd);
    }
  }

  console.log(`Collated ${collatedMpeModules.length} modules.`);
  // Write to a file with dd-mm-yyyy-hh-mm-ss.json
  fs.writeFileSync('mpeModules.json', JSON.stringify(collatedMpeModules));
  console.log(`Wrote ${collatedMpeModules.length} modules to mpeModules.json.`);
  console.log('Done!');
};

scraper();
