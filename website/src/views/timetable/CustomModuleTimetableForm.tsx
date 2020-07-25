import * as React from 'react';
import classnames from 'classnames';
import { connect } from 'react-redux';
import Downshift, { ChildrenFunction } from 'downshift';
import { Days } from 'types/modules';
import { LESSON_TYPE_ABBREV } from '../../utils/timetables';
import ExportMenu from './ExportMenu';


import styles from './CustomModuleTimetableForm.scss';

type OwnProps = {
  // Own props
  index: number;
  onChangeClassNo: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onSelectStartTime: (item: string, type: string) => void;
  onSelectEndTime: (item: string, type: string) => void;
  onChangeVenue: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onSelectDay: (item: string) => void;
  onSelectLessonType: (item: string) => void;
};

type Props = OwnProps;

type State = {
  selectedLessonType: string,
  selectedDay: string,
  selectedStartTimeHH: string,
  selectedStartTimeMM: string,
  selectedEndTimeHH: string,
  selectedEndTimeMM: string,
}

export default class CustomModuleTimetableForm extends React.Component<Props, State> {
  state: State = {
    selectedLessonType: '',
    selectedDay: '',
    selectedStartTimeHH: '',
    selectedStartTimeMM: '',
    selectedEndTimeHH: '',
    selectedEndTimeMM: '',
  };

  renderDropdownLessonType: ChildrenFunction<string> = ({
    isOpen,
    getItemProps,
    toggleMenu,
  }) => {
    return (
      <div className={styles.dayMenu}>
        <button
          className={classnames(styles.toggle, 'btn btn-outline-primary btn-svg')}
          type="button"
          onClick={() => toggleMenu()}
        >
          {this.state.selectedLessonType !== ''
            ? this.state.selectedLessonType
            : 'Lesson Type'}
        </button>
        <div
          className={classnames('dropdown-menu', styles.dropdownMenu, {
            show: isOpen,
          })}
        >
          {Object.keys(LESSON_TYPE_ABBREV).map((item, index) => (
            <div
              className="dropdown-item"
              {...getItemProps({ key: index, index, item })}
            >
              {item}
            </div>
          ))}
        </div>
      </div>
    );
  };

  onSelectLessonType = (selectedItem: string | null) => {
    if (selectedItem === null) {
      console.log('invalid');
      return;
    }
    const item: string = selectedItem || '';
    this.setState({ selectedLessonType: item });
    this.props.onSelectLessonType(item);
  };

  onSelectDay = (selectedItem: string | null) => {
    if (selectedItem === null) {
      console.log('invalid');
      return;
    }
    const item: string = selectedItem || '';
    this.setState({ selectedDay: item });
    this.props.onSelectDay(item);
  };

  renderDropdownDay: ChildrenFunction<string> = ({
    isOpen,
    getItemProps,
    toggleMenu,
  }) => {
    return (
      <div className={styles.dayMenu}>
        <button
          className={classnames(styles.toggle, 'btn btn-outline-primary btn-svg')}
          type="button"
          onClick={() => toggleMenu()}
        >
          {this.state.selectedDay !== '' ? this.state.selectedDay : 'Day'}
        </button>
        <div
          className={classnames('dropdown-menu', styles.dropdownMenu, {
            show: isOpen,
          })}
        >
          {Days.map((item, index) => (
            <div
              className="dropdown-item"
              {...getItemProps({ key: index, index, item })}
            >
              {item}
            </div>
          ))}
        </div>
      </div>
    );
  };

  onSelectStartTimeHH = (selectedItem: string | null) => {
    const item: string = selectedItem || '';
    this.setState({ selectedStartTimeHH: item });
    this.props.onSelectStartTime(item, 'HH');
  };

  onSelectStartTimeMM = (selectedItem: string | null) => {
    const item: string = selectedItem || '00';
    this.setState({ selectedStartTimeMM: item });
    this.props.onSelectStartTime(item, 'MM');
  };

  renderDropdownStartTimeHH: ChildrenFunction<string> = ({
    isOpen,
    getItemProps,
    toggleMenu,
  }) => {
    return (
      <div className={styles.timeMenu}>
        <button
          className={styles.timeInput}
          type="button"
          onClick={() => toggleMenu()}
        >
          {this.state.selectedStartTimeHH !== ''
            ? this.state.selectedStartTimeHH
            : 'HH'}
          <div
            className={classnames('dropdown-menu', styles.dropdownMenu, {
              show: isOpen,
            })}
          >
            {[
              '06',
              '07',
              '08',
              '09',
              '10',
              '11',
              '12',
              '13',
              '14',
              '15',
              '16',
              '17',
              '18',
              '19',
              '20',
              '21',
              '22',
            ].map((item, index) => (
              <div
                className="dropdown-item"
                {...getItemProps({ key: index, index, item })}
              >
                {item}
              </div>
            ))}
          </div>
        </button>
      </div>
    );
  };

  renderDropdownStartTimeMM: ChildrenFunction<string> = ({
    isOpen,
    getItemProps,
    toggleMenu,
  }) => {
    return (
      <div className={styles.time3Menu}>
        <button
          className={styles.timeInput}
          type="button"
          onClick={() => toggleMenu()}
        >
          {this.state.selectedStartTimeMM !== ''
            ? this.state.selectedStartTimeMM
            : 'MM'}

          <div
            className={classnames('dropdown-menu', styles.dropdownMenu, {
              show: isOpen,
            })}
          >
            {['00', '15', '30', '45'].map((item, index) => (
              <div
                className="dropdown-item"
                {...getItemProps({ key: index, index, item })}
              >
                {item}
              </div>
            ))}
          </div>
        </button>
      </div>
    );
  };

  renderDropdownEndTimeHH: ChildrenFunction<string> = ({
    isOpen,
    getItemProps,
    toggleMenu,
  }) => {
    return (
      <div className={styles.timeMenu}>
        <button
          className={styles.timeInput}
          type="button"
          onClick={() => toggleMenu()}
        >
          {this.state.selectedEndTimeHH !== ''
            ? this.state.selectedEndTimeHH
            : 'HH'}
          <div
            className={classnames('dropdown-menu', styles.dropdownMenu, {
              show: isOpen,
            })}
          >
            {[
              '06',
              '07',
              '08',
              '09',
              '10',
              '11',
              '12',
              '13',
              '14',
              '15',
              '16',
              '17',
              '18',
              '19',
              '20',
              '21',
              '22',
            ].map((item, index) => (
              <div
                className="dropdown-item"
                {...getItemProps({ key: index, index, item })}
              >
                {item}
              </div>
            ))}
          </div>
        </button>
      </div>
    );
  };

  renderDropdownEndTimeMM: ChildrenFunction<string> = ({
    isOpen,
    getItemProps,
    toggleMenu,
  }) => {
    return (
      <div className={styles.time3Menu}>
        <button
          className={styles.timeInput}
          type="button"
          onClick={() => toggleMenu()}
        >
          {this.state.selectedEndTimeMM !== ''
            ? this.state.selectedEndTimeMM
            : 'MM'}

          <div
            className={classnames('dropdown-menu', styles.dropdownMenu, {
              show: isOpen,
            })}
          >
            {['00', '15', '30', '45'].map((item, index) => (
              <div
                className="dropdown-item"
                {...getItemProps({ key: index, index, item })}
              >
                {item}
              </div>
            ))}
          </div>
        </button>
      </div>
    );
  };

  onSelectEndTimeHH = (selectedItem: string | null) => {
    const item: string = selectedItem || '00';
    this.setState({ selectedEndTimeHH: item });
    this.props.onSelectEndTime(item, 'HH');
  };

  onSelectEndTimeMM = (selectedItem: string | null) => {
    const item: string = selectedItem || '00';
    this.setState({ selectedEndTimeMM: item });
    this.props.onSelectEndTime(item, 'MM');
  };

  render() {
    return (
      <div>
        <div className={styles.formGroup}>
          <input
            className={classnames(styles.input)}
            onChange={(e) => this.props.onChangeClassNo(e)}
            placeholder="Class No."
          />
          <Downshift onChange={this.onSelectLessonType}>
            {this.renderDropdownLessonType}
          </Downshift>
          <input
            className={classnames(styles.input)}
            onChange={(e) => this.props.onChangeVenue(e)}
            placeholder="Venue."
          />
          <Downshift onChange={this.onSelectDay}>{this.renderDropdownDay}</Downshift>

          <div
            className={classnames(
              styles.timeInputHolder,
              'btn btn-outline-primary btn-svg',
            )}
          >
            <Downshift onChange={this.onSelectStartTimeHH}>
              {this.renderDropdownStartTimeHH}
            </Downshift>
            :
            <Downshift onChange={this.onSelectStartTimeMM}>
              {this.renderDropdownStartTimeMM}
            </Downshift>
          </div>

          <div
            className={classnames(
              styles.timeInputHolder,
              'btn btn-outline-primary btn-svg',
            )}
          >
            <Downshift onChange={this.onSelectEndTimeHH}>
              {this.renderDropdownEndTimeHH}
            </Downshift>
            :
            <Downshift onChange={this.onSelectEndTimeMM}>
              {this.renderDropdownEndTimeMM}
            </Downshift>
          </div>
        </div>
      </div>
    );
  }
}