// @flow
import React from 'react';
import type { Tombstone } from 'types/modules';
import classnames from 'classnames';
import styles from './TimetableModulesTable.scss';

type Props = {
  tombstone: Tombstone,
  horizontalOrientation: boolean,
};

function ModuleTombstone(props: Props) {
  const { tombstone, horizontalOrientation } = props;

  return (
    <div
      className={classnames(styles.modulesTableRow, 'col-sm-6', {
        'col-lg-4': horizontalOrientation,
        'col-md-12': !horizontalOrientation,
      })}
    >
      <div className={styles.moduleInfo}>
        <span>{`Removed ${tombstone.moduleCode}`}</span>
      </div>
    </div>
  );
}

export default ModuleTombstone;
