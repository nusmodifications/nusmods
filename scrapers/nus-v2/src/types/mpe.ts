import { ModuleCode, ModuleTitle } from './modules';

// This format is returned from the MPE modules endpoint.
export type MPEModule = Readonly<{
  title: ModuleTitle;
  moduleCode: ModuleCode;
  moduleCredit: string;
  inS1CPEx?: boolean;
  inS2CPEx?: boolean;
}>;
