import * as React from 'react';
import {
  SemTimetableConfig,
} from 'types/timetables';
import { Module, ModuleCode, Semester } from 'types/modules';
import { ModulesMap } from 'types/reducers'
import OptimizerConstraints from './OptimizerConstraints'

type OwnProps = {
  semester: Semester;
  timetable: SemTimetableConfig;
  modules: ModulesMap
};


export const TimetableOptimizer: React.FC<OwnProps> = ({semester, timetable, modules}) => {
  const moduleCodes = Object.keys(timetable)
  console.log(moduleCodes)
  return (
    <>
          <hr/>
          <OptimizerConstraints/>
    </>
  );
}

export default TimetableOptimizer;
