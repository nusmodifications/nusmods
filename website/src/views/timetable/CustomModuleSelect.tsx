import * as React from 'react';

import { PlusCircle } from 'react-feather';
import { CustomLesson, ModuleCode, Semester } from 'types/modules';
import styles from './CustomModuleSelect.scss';
import CustomModuleModal from './CustomModuleModal';

export type Props = {
  addCustomModule: (moduleCode: ModuleCode, title: string, lessons: CustomLesson[]) => void;
  isModuleCodeAdded: (moduleCode: ModuleCode) => boolean;
  semester: Semester;
};

type State = {
  isOpen: boolean;
};

export default class CustomModuleSelect extends React.PureComponent<Props, State> {
  override state: State = {
    isOpen: false,
  };

  openModal = () => {
    this.setState({ isOpen: true });
  };

  closeModal = () =>
    this.setState({
      isOpen: false,
    });

  handleCustomModule = (
    _oldModuleCode: ModuleCode,
    moduleCode: ModuleCode,
    title: string,
    lessons: CustomLesson[],
  ) => {
    this.props.addCustomModule(moduleCode, title, lessons);
  };

  override render() {
    const { isOpen } = this.state;

    return (
      <div className={styles.select}>
        <button type="button" className="btn btn-outline-primary btn-svg" onClick={this.openModal}>
          <PlusCircle className="svg svg-small" />
          Add Custom Module
        </button>

        <CustomModuleModal
          handleCustomModule={this.handleCustomModule}
          closeModal={this.closeModal}
          isOpen={isOpen}
          isEdit={false}
          isModuleCodeAdded={this.props.isModuleCodeAdded}
          semester={this.props.semester}
        />
      </div>
    );
  }
}
