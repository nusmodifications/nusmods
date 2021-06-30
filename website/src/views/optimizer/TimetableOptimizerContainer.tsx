import * as React from 'react';
import { TrendingUp } from 'react-feather';
import { SemTimetableConfig } from 'types/timetables';
import { Module, ModuleCode, Semester } from 'types/modules';
import { ModulesMap } from 'types/reducers';
import { TimetableOptimizer } from 'utils/optimizer/timetableOptimizer';
import { OptimizerOutput, OptimizerCallbacks } from 'types/optimizer';
import OptimizerConstraints from './OptimizerConstraints';

type OwnProps = {
  semester: Semester;
  timetable: SemTimetableConfig;
  modules: ModulesMap;
};

const TimetableOptimizerContainer: React.FC<OwnProps> = ({ semester, timetable, modules }) => {
  const onOptimizerInitialized = () => {
    console.log('Initialized!');
    alert('Temp alert: Z3 Optimizer initialized!');
  };
  const onSmtlib2InputCreated = (s: string) => console.log(`OnSmtlib2: ${s}`);
  const onOutput = (s: string) => console.log(`OnOutput: ${s}`);
  const onTimetableOutput = (timetable: OptimizerOutput) => console.log(`Timetable: ${timetable}`);
  const callbacks: OptimizerCallbacks = {
    onOptimizerInitialized,
    onSmtlib2InputCreated,
    onOutput,
    onTimetableOutput,
  };

  function runOptimizer() {
    const moduleCodes = Object.keys(timetable);
    console.log(moduleCodes);
    TimetableOptimizer.initOptimizer(callbacks);
  }

  return (
    <>
      <hr />
      <button
        className="btn btn-block btn-svg btn-outline-primary"
        onClick={runOptimizer}
        type="button"
      >
        <TrendingUp className="svg" /> Optimize Timetable
      </button>
      <OptimizerConstraints />
    </>
  );
};

export default TimetableOptimizerContainer;
