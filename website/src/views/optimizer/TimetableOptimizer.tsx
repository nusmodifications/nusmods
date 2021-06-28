import * as React from 'react';
import { TrendingUp } from 'react-feather';
import { SemTimetableConfig } from 'types/timetables';
import { Module, ModuleCode, Semester } from 'types/modules';
import { ModulesMap } from 'types/reducers';
import OptimizerConstraints from './OptimizerConstraints';
import { Z3Manager } from '../../utils/z3Manager';
import { Z3Callbacks } from '../../types/z3';

type OwnProps = {
  semester: Semester;
  timetable: SemTimetableConfig;
  modules: ModulesMap;
};

const TimetableOptimizer: React.FC<OwnProps> = ({ semester, timetable, modules }) => {
  const onZ3Initialized = () => {
    console.log('Initialized!');
    alert("Temp alert: Z3 initialized!")
  }
  const onSmtlib2InputCreated = (s: string) => console.log(`OnSmtlib2: ${s}`);
  const onOutput = (s: string) => console.log(`OnOutput: ${s}`);
  const onTimetableOutput = (timetable: any) => console.log(`Timetable: ${timetable}`);
  const callbacks: Z3Callbacks = {
    onZ3Initialized,
    onSmtlib2InputCreated,
    onOutput,
    onTimetableOutput,
  };

  function runOptimizer() {
    const moduleCodes = Object.keys(timetable);
    console.log(moduleCodes);
    Z3Manager.initZ3(callbacks);
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

export default TimetableOptimizer;
