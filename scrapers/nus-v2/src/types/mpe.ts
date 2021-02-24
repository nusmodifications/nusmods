import { ModuleCode } from './modules';

// This format is returned from the MPE modules endpoint.
export type MPEModule = Readonly<{
  moduleCode: ModuleCode;
  inS1MPE?: boolean;
  inS2MPE?: boolean;
}>;
