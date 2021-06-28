import * as React from 'react';
import classnames from 'classnames';
import { SemTimetableConfig } from 'types/timetables';
import { Module, ModuleCode, Semester } from 'types/modules';
import { ModulesMap } from 'types/reducers';
import Toggle from 'views/components/Toggle';
import styles from './OptimizerConstraints.scss';
// (evt) => props.setModRegScheduleType(evt.target.value as ScheduleType)
//                 {SCHEDULE_TYPES.map((type) => (
// <option value={type} key={type}>
//   {type}
// </option>
const OptimizerConstraints: React.FC = () => (
  <>
    <div className={classnames(styles.constraintsArea, 'page-container')}>
      <h4> Constraints </h4>

      <div>
        <div className="row">
          <div className="col-sm-12">
            <h5>Lesson Start/End Times</h5>
          </div>

          <div className="col-sm-8">
            <p>Earliest Lesson Start Time</p>
          </div>
          <div className="col-sm-4">
            <select className="form-control" onChange={() => 1} />
          </div>

          <div className="col-sm-8">
            <p>Latest Lesson End Time</p>
          </div>
          <div className="col-sm-4">
            <select className="form-control" onChange={() => 1} />
          </div>

          <div className="col-sm-8">
            <p>Enable Constraint?</p>
          </div>
          <div className="col-sm-4">
            <Toggle className={styles.betaToggle} isOn onChange={() => 1} />
          </div>
        </div>

        <div className="row">
          <div className="col-sm-12">
            <h5>Free Days</h5>
          </div>

          <div className="col-sm-8">
            <p>Number of Free Days</p>
          </div>
          <div className="col-sm-4">
            <select className="form-control" onChange={() => 1} />
          </div>

          <div className="col-sm-8">
            <p>Enable Constraint?</p>
          </div>
          <div className="col-sm-4">
            <Toggle className={styles.betaToggle} isOn onChange={() => 1} />
          </div>

          <div className="col-sm-8">
            <p>Specific Free Days</p>
          </div>
          <div className="col-sm-4">
            <select className="form-control" onChange={() => 1} />
          </div>

          <div className="col-sm-8">
            <p>Enable Constraint?</p>
          </div>
          <div className="col-sm-4">
            <Toggle className={styles.betaToggle} isOn onChange={() => 1} />
          </div>
        </div>

        <hr />
      </div>
    </div>
  </>
);

export default OptimizerConstraints;
