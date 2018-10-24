// @flow
import React from 'react';
import { connect } from 'react-redux';
import type { Tombstone } from 'types/modules';
import { undo } from 'actions/undoHistory';
import classnames from 'classnames';
import styles from './TimetableModulesTable.scss';

type Props = {
  tombstone: Tombstone,
  horizontalOrientation: boolean,
  undo: () => void,
  resetTombstone: Function,
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
        <div className={styles.moduleActionButtons}>
          <div className="btn-group">
            <button
              type="button"
              className={classnames('btn btn-outline-secondary btn-link', styles.moduleAction)}
              title="Dismiss"
              aria-label="Dismiss"
              onClick={props.resetTombstone}
            >
              Dismiss
            </button>
            <button
              type="button"
              className={classnames('btn btn-outline-secondary btn-link', styles.moduleAction)}
              title="Undo"
              aria-label="Undo"
              onClick={() => {
                props.undo();
                props.resetTombstone();
              }}
            >
              Undo
            </button>
          </div>
        </div>
        <span>Removed {tombstone.moduleCode}</span>
      </div>
    </div>
  );
}

export { ModuleTombstone as DisconnectedModuleTombstone };

export default connect(null, { undo })(ModuleTombstone);
