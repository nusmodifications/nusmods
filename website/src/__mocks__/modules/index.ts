import type { Module } from 'types/modules';

import { map } from 'lodash-es';
import { makeModuleLessonMap } from 'utils/timetables/lessonId';
import ACC2002_JSON from './ACC2002.json';
import BFS1001_JSON from './BFS1001.json';
import CP3880_JSON from './CP3880.json';
import CS1010A_JSON from './CS1010A.json';
import CS1010S_JSON from './CS1010S.json';
import CS3216_JSON from './CS3216.json';
import CS4243_JSON from './CS4243.json';
import GES1021_JSON from './GES1021.json';
import PC1222_JSON from './PC1222.json';
import GER1000_JSON from './GER1000.json';
import MA151_JSON from './MA1521.json';

const mockReducerTransform = (module: any): Module => ({
  ...module,
  semesterData: map(module.semesterData, (semesterData) => ({
    ...semesterData,
    lessonMap: makeModuleLessonMap(semesterData.timetable),
  })),
  timestamp: 1572843950000,
});

// Have to cast these as Module explicitly, otherwise TS will try to
// incorrectly infer the shape from the JSON - specifically Weeks will
// not be cast correctly
export const ACC2002 = mockReducerTransform(ACC2002_JSON);
export const BFS1001 = mockReducerTransform(BFS1001_JSON);
export const CP3880 = mockReducerTransform(CP3880_JSON);
export const CS1010A = mockReducerTransform(CS1010A_JSON);
export const CS1010S = mockReducerTransform(CS1010S_JSON);
export const CS3216 = mockReducerTransform(CS3216_JSON);
export const CS4243 = mockReducerTransform(CS4243_JSON);
export const GES1021 = mockReducerTransform(GES1021_JSON);
export const MA1521 = mockReducerTransform(MA151_JSON);
export const PC1222 = mockReducerTransform(PC1222_JSON);
export const GER1000 = mockReducerTransform(GER1000_JSON);

const modules: Module[] = [ACC2002, BFS1001, CS1010S, CS3216, GES1021, PC1222, CS1010A];
export default modules;
