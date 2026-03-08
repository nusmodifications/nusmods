import { ModuleCode, ModuleTitle } from './modules';

// This format is returned from the MPE modules endpoint.
export type MPEModule = Readonly<{
  inS1CPEx?: boolean;
  inS2CPEx?: boolean;
  moduleCode: ModuleCode;
  moduleCredit: string;
  title: ModuleTitle;
}>;
