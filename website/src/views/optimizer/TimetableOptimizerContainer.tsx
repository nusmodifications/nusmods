import * as React from 'react';
import { TrendingUp } from 'react-feather';
import { SemTimetableConfig } from 'types/timetables';
import { Module, ModuleCode, Semester, SemesterData, RawLesson } from 'types/modules';
import { ModulesMap } from 'types/reducers';
import { TimetableOptimizer } from 'utils/optimizer/timetableOptimizer';
import {
  OptimizerInput,
  OptimizerOutput,
  OptimizerCallbacks,
  ModuleInfoWithConstraints,
  lessonByGroupsByClassNo,
  GlobalConstraints,
  defaultConstraints,
} from 'types/optimizer';
import OptimizerConstraints from './OptimizerConstraints';

type OwnProps = {
  semester: Semester;
  timetable: SemTimetableConfig;
  modules: ModulesMap;
};

const TimetableOptimizerContainer: React.FC<OwnProps> = ({ semester, timetable, modules }) => {
  const onOptimizerInitialized = () => {
    console.log('Optimizer Initialized!');
    runOptimizer();
  };
  const onSmtlib2InputCreated = (s: string) => console.log(`OnSmtlib2: ${s}`);
  const onOutput = (s: string) => {
    console.log(`OnOutput:\n${s}`);
  };
  const onTimetableOutput = (timetable: OptimizerOutput) => {
    console.log(`Timetable:`);
    console.log(timetable);
  };
  const callbacks: OptimizerCallbacks = {
    onOptimizerInitialized,
    onSmtlib2InputCreated,
    onOutput,
    onTimetableOutput,
  };

  function initAndRunOptimizer() {
    const moduleCodes = Object.keys(timetable);
    console.log(moduleCodes);
    TimetableOptimizer.initOptimizer(callbacks);
  }

  function runOptimizer() {
    const moduleInfo: ModuleInfoWithConstraints[] = Object.keys(timetable).map(
      (moduleCode: string) => {
        const mod: Module = modules[moduleCode];
        const required = true; // TODO change this based on UI
        // Should be assured that the semester data is inside the module data
        const allLessons: readonly RawLesson[] = mod.semesterData.find(
          (v: SemesterData) => v.semester === semester,
        )!.timetable;
        const lessonsGrouped = lessonByGroupsByClassNo(allLessons);
        return { mod, required, lessonsGrouped };
      },
    );
    const constraints: GlobalConstraints = defaultConstraints;
    const optimizerInput: OptimizerInput = {
      moduleInfo,
      constraints,
    };
    TimetableOptimizer.loadInput(optimizerInput);
    TimetableOptimizer.solve();
  }

  return (
    <>
      <hr />
      <button
        className="btn btn-block btn-svg btn-outline-primary"
        onClick={initAndRunOptimizer}
        type="button"
      >
        <TrendingUp className="svg" /> Optimize Timetable
      </button>
      <OptimizerConstraints />
    </>
  );
};

export default TimetableOptimizerContainer;
