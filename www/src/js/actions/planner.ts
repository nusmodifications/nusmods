import actionCreatorFactory from 'typescript-fsa';

import { ModuleCode, Semester } from 'types/modules';
import { CustomModule } from 'types/reducers';

const actionCreator = actionCreatorFactory('PLANNER');

export const setMinYear = actionCreator<string>('SET_MIN_YEAR');
export const setMaxYear = actionCreator<string>('SET_MAX_YEAR');
export const setIBLOCs = actionCreator<boolean>('SET_IBLOCS');

export type AddModulePayload = {
  moduleCode: ModuleCode;
  year: string;
  semester: Semester;
  index?: number;
};

export type MoveModulePayload = AddModulePayload;

export const addModule = actionCreator<AddModulePayload>('ADD_MODULE');
export const moveModule = actionCreator<MoveModulePayload>('MOVE_MODULE');

export type RemoveModulePayload = { moduleCode: ModuleCode };
export const removeModule = actionCreator<RemoveModulePayload>('REMOVE_MODULE');

export const addCustomModule = actionCreator<{
  moduleCode: ModuleCode;
  data: CustomModule;
}>('ADD_CUSTOM_DATA');
