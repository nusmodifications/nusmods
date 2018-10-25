// @flow
import type { Module } from 'types/modules';
import React from 'react';
import { connect } from 'react-redux';
import { undo } from 'actions/undoHistory';
import classnames from 'classnames';
import styles from './TimetableModulesTable.scss';

type Props = {
  module: Module,
  undo: () => void,
  resetTombstone: () => void,
};

function ModuleTombstone(props: Props) {
  const { module } = props;

  return (
    <div className={classnames(styles.moduleInfo, styles.tombstone)}>
      <span>{module.ModuleCode} removed</span>

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
