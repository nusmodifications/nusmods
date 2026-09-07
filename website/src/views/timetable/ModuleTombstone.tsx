import { Button } from 'components/ui/button';
import * as React from 'react';
import { connect } from 'react-redux';
import classnames from 'classnames';
import { undo } from 'actions/undoHistory';
import { Module } from 'types/modules';
import styles from './TimetableModulesTable.scss';

export type Props = {
  module: Module;
  undo: () => void;
  resetTombstone: () => void;
};

const ModuleTombstone: React.FC<Props> = (props) => (
  <div className={classnames(styles.moduleInfo, styles.tombstone)}>
    <span>{props.module.moduleCode} removed</span>

    <div className={styles.moduleActionButtons}>
      <Button
        variant="link"
        size="sm"
        type="button"
        className={classnames(styles.moduleAction)}
        onClick={props.resetTombstone}
      >
        Dismiss
      </Button>
      <Button
        variant="link"
        size="sm"
        type="button"
        className={classnames(styles.moduleAction)}
        onClick={() => {
          props.undo();
          props.resetTombstone();
        }}
      >
        Undo
      </Button>
    </div>
  </div>
);

export { ModuleTombstone as DisconnectedModuleTombstone };

export default connect(null, { undo })(ModuleTombstone);
