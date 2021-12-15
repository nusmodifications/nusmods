import * as React from 'react';

import { PlusCircle } from 'react-feather';
import { Module, ModuleCode } from 'types/modules';
import { Lesson } from 'types/timetables';
import styles from './CustomModuleSelect.scss';
import CustomModuleModal from './CustomModuleModal';

export type Props = {
  addCustomModule: (moduleCode: ModuleCode, module: Module, lesson: Lesson) => void;
};

type State = {
  isOpen: boolean;
};

export default class CustomModuleSelect extends React.PureComponent<Props, State> {
  state: State = {
    isOpen: false,
  };

  openModal = () => {
    this.setState({ isOpen: true });
  };

  closeModal = () =>
    this.setState({
      isOpen: false,
    });

  render() {
    const { isOpen } = this.state;

    return (
      <div className={styles.select}>
        <button
          type="button"
          className="btn btn-outline-primary btn-svg"
          onClick={this.openModal}
          onMouseOver={() => {}}
          onFocus={() => {}}
        >
          <PlusCircle className="svg svg-small" />
          Add Custom Module
        </button>

        <CustomModuleModal
          handleCustomModule={this.props.addCustomModule}
          closeModal={this.closeModal}
          isOpen={isOpen}
          isEdit={false}
        />
      </div>
    );
  }
}
