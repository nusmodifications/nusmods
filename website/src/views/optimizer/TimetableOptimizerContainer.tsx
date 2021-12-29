import * as React from 'react';
import { TrendingUp } from 'react-feather';
import { SemTimetableConfig, ModuleLessonConfig } from 'types/timetables';
import { Module, Semester, SemesterData, RawLesson } from 'types/modules';
import { ModulesMap } from 'types/reducers';
import { TimetableOptimizer } from 'utils/optimizer/timetableOptimizer';
import { useDispatch } from 'react-redux';
import {
  OptimizerInput,
  OptimizerOutput,
  OptimizerCallbacks,
  ModuleInfoWithConstraints,
  lessonByGroupsByClassNo,
  GlobalConstraints,
  defaultConstraints,
} from 'types/optimizer';
import { setLessonConfig } from 'actions/timetables';
import OptimizerConstraints from './OptimizerConstraints';

type OwnProps = {
  semester: Semester;
  timetable: SemTimetableConfig;
  modules: ModulesMap;
};

const TimetableOptimizerContainer: React.FC<OwnProps> = ({ semester, timetable, modules }) => {
  const dispatch = useDispatch();

  const onOptimizerInitialized = () => {
    // console.log('Optimizer Initialized!');
    runOptimizer();
  };
  // const onSmtlib2InputCreated = (s: string) => console.log(`OnSmtlib2: ${s}`);
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  const onSmtlib2InputCreated = () => {};
  const onSmtLib2ResultOutput = () => {
    // console.log(`OnOutput:\n${s}`);
  };
  const onTimetableOutput = (optimizerOutput: OptimizerOutput) => {
    // console.log(`optimizerOutput:`);
    // console.log(optimizerOutput);

    if (optimizerOutput.isSat) {
      // Have to get the color map here to use this
      // dispatch(setTimetable(semester, optimizerOutput.timetable));

      // Maybe this looks more interesting :)
      Object.keys(optimizerOutput.timetable).forEach((moduleCode: string) => {
        const modLessonConfig: ModuleLessonConfig = optimizerOutput.timetable[moduleCode];
        dispatch(setLessonConfig(semester, moduleCode, modLessonConfig));
      });
    } else {
      // TODO do something proper if it's not sat
      // alert('No timetable found!');
    }
  };
  const callbacks: OptimizerCallbacks = {
    onOptimizerInitialized,
    onSmtlib2InputCreated,
    onSmtLib2ResultOutput,
    onTimetableOutput,
  };

  function initAndRunOptimizer() {
    // const moduleCodes = Object.keys(timetable);
    // console.log(moduleCodes);
    TimetableOptimizer.initOptimizer(callbacks);
  }

  function runOptimizer() {
    const moduleInfo: ModuleInfoWithConstraints[] = Object.keys(timetable).map(
      (moduleCode: string) => {
        const mod: Module = modules[moduleCode];
        const required = true; // TODO change this based on UI
        // Should be assured that the semester data is inside the module data
        const allLessons: readonly RawLesson[] | undefined = mod.semesterData.find(
          (v: SemesterData) => v.semester === semester,
        )?.timetable;
        if (!allLessons) {
          throw new Error(`Cannot find semester ${semester} data for mod ${mod.moduleCode}`);
        }
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
