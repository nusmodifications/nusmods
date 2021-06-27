import * as React from 'react';
import {
  SemTimetableConfig,
} from 'types/timetables';
import { Module, ModuleCode, Semester } from 'types/modules';
import { ModulesMap } from 'types/reducers'
import Toggle from 'views/components/Toggle';

        //     <div>
        //     <h4 id="beta">NUSMods Beta</h4>

        //     <div className={styles.toggleRow}>
        //     <div className={styles.toggleDescription}>
        //     <p>Help us improve NUSMods by testing new features and providing feedback.</p>
        //     {testDescriptions}
        // </div>

        //     <div className={styles.toggle}>
        //     <Toggle className={styles.betaToggle} isOn={betaTester} onChange={toggleStates} />
        // </div>
        //     </div>

        //     <hr />
        //     </div>
export const OptimizerConstraints: React.FC = () => {
    return (
        <>
            <h4> Constraints </h4>
        </>
    );
}

export default OptimizerConstraints;
