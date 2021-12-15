import * as React from 'react';
import { Edit } from 'react-feather';
import { ModuleCode } from 'types/modules';
import { Lesson } from 'types/timetables';
import Tooltip from 'views/components/Tooltip';
import classnames from 'classnames';
import CustomModuleModal from './CustomModuleModal';

export type Props = {
  lesson: Lesson | undefined;
  moduleActionStyle: string;
  actionIconStyle: string;

  editCustomModule: (oldModuleCode: ModuleCode, newModuleCode: ModuleCode, lesson: Lesson) => void;
};

type State = {
  isOpen: boolean;
};

export default class CustomModuleEdit extends React.PureComponent<Props, State> {
  fields = ['moduleCode', 'title', 'lessonType', 'venue', 'day', 'startTime', 'endTime'];

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
      <>
        <CustomModuleModal
          handleCustomModule={this.props.editCustomModule}
          closeModal={this.closeModal}
          isOpen={isOpen}
          isEdit
          customLessonData={this.props.lesson}
        />
        <Tooltip content="Edit Custom Module" touch="hold">
          <button
            type="button"
            className={classnames(
              'btn btn-outline-secondary btn-svg',
              this.props.moduleActionStyle,
            )}
            aria-label="Edit Custom Module"
            onClick={this.openModal}
          >
            <Edit className={this.props.actionIconStyle} />
          </button>
        </Tooltip>
      </>
    );
  }
}
