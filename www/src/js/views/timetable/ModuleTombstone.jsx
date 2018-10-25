// @flow
import React from 'react';
import { connect } from 'react-redux';
import type { Tombstone } from 'types/modules';
import { undo } from 'actions/undoHistory';
import classnames from 'classnames';
import styles from './TimetableModulesTable.scss';

type Props = {
  tombstone: Tombstone,
  undo: () => void,
  resetTombstone: Function,
};

function ModuleTombstone(props: Props) {
  const { tombstone } = props;

  return (
    <div className={classnames(styles.moduleInfo, styles.tombstone)}>
      <span className={styles.tombstoneText}>{tombstone.moduleCode} removed</span>

      <div className={styles.moduleActionButtons}>
        <button
          type="button"
          className={classnames('btn btn-sm btn-link', styles.moduleAction)}
          title="Dismiss"
          aria-label="Dismiss"
          onClick={props.resetTombstone}
        >
          Dismiss
        </button>
        <button
          type="button"
          className={classnames('btn btn-sm btn-link', styles.moduleAction)}
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
  );
}

export { ModuleTombstone as DisconnectedModuleTombstone };

export default connect(null, { undo })(ModuleTombstone);
