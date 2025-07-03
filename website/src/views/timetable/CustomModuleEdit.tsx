import * as React from 'react';
import { Edit } from 'react-feather';
import { CustomLesson, ModuleCode, Semester } from 'types/modules';
import Tooltip from 'views/components/Tooltip';
import classnames from 'classnames';
import CustomModuleModal from './CustomModuleModal';

export type Props = {
  moduleCode: ModuleCode;
  moduleTitle: string;
  customLessons: CustomLesson[];
  moduleActionStyle: string;
  actionIconStyle: string;
  semester: Semester;

  isModuleCodeAdded: (moduleCode: ModuleCode) => boolean;
  editCustomModule: (
    oldModuleCode: ModuleCode,
    newModuleCode: ModuleCode,
    title: string,
    lessons: CustomLesson[],
  ) => void;
};

type State = {
  isOpen: boolean;
};

export default class CustomModuleEdit extends React.PureComponent<Props, State> {
  fields = ['moduleCode', 'title', 'lessonType', 'venue', 'day', 'startTime', 'endTime'];

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

  override render() {
    const { isOpen } = this.state;

    return (
      <>
        <CustomModuleModal
          moduleCode={this.props.moduleCode}
          moduleTitle={this.props.moduleTitle}
          handleCustomModule={this.props.editCustomModule}
          closeModal={this.closeModal}
          isOpen={isOpen}
          isEdit
          customLessonData={this.props.customLessons}
          isModuleCodeAdded={this.props.isModuleCodeAdded}
          semester={this.props.semester}
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
