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
  onChangeClassNo: (event: React.ChangeEvent<HTMLInputElement>, index: number) => void;
  onSelectStartTime: (item: string, type: string, index: number) => void;
  onSelectEndTime: (item: string, type: string, index: number) => void;
  onSelectVenue: (item: string, index: number) => void;
  onSelectDay: (item: string, index: number) => void;
  onSelectLessonType: (item: string, index: number) => void;
};

type Props = OwnProps;

type State = {
  selectedLessonType: string,
  selectedDay: string,
  selectedStartTimeHH: string,
  selectedStartTimeMM: string,
}

export default class CustomModuleTimetableForm extends React.Component<Props, State> {
  state: State = {
    selectedLessonType: '',
    selectedDay: '',
    selectedStartTimeHH: '00',
    selectedStartTimeMM: '00',
  }

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
          {this.state.selectedDay !== '' ? this.state.selectedLessonType : 'Lesson Type'}
        </button>
        <div className={classnames('dropdown-menu', styles.dropdownMenu, { show: isOpen })}>
          {Object.keys(LESSON_TYPE_ABBREV).map((item, index) => (
            <div className="dropdown-item" {...getItemProps({ key: index, index, item })}>
              {item}
            </div>
          ))}
        </div>
      </div>
    );
  }

  onSelectDay = (selectedItem: string | null) => {
    if (selectedItem === null) {
      console.log("invalid");
      return;
    }
    const item: string = selectedItem || "";
    this.props.onSelectDay(item, this.props.index)
  }

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
        <div className={classnames('dropdown-menu', styles.dropdownMenu, { show: isOpen })}>
          {Days.map((item, index) => (
            <div className="dropdown-item" {...getItemProps({ key: index, index, item })}>
              {item}
            </div>
          ))}
        </div>
      </div>
    );
  }

  onSelectStartTimeHH = (selectedItem: string | null) => {
    const item: string = selectedItem || "";
    this.setState({selectedStartTimeHH: item})
    this.props.onSelectStartTime(item, "HH", this.props.index)
  }

  onSelectStartTimeMM = (selectedItem: string | null) => {
    const item: string = selectedItem || "00";
    this.setState({selectedStartTimeHH: item})
    this.props.onSelectStartTime(item, "MM", this.props.index)
  }

  renderDropdownStartTimeHH: ChildrenFunction<string> = ({
    isOpen,
    getItemProps,
    toggleMenu,
  }) => {
    return (
      <div className={styles.timeMenu}>
        <button className={styles.timeInput} type="button" onClick={() => toggleMenu()}>
          {this.state.selectedStartTimeHH !== '' ? this.state.selectedStartTimeHH : 'HH'}
          <div className={classnames('dropdown-menu', styles.dropdownMenu, { show: isOpen })}>
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
              <div className="dropdown-item" {...getItemProps({ key: index, index, item })}>
                {item}
              </div>
            ))}
          </div>
        </button>
      </div>
    );
  }

  renderDropdownStartTimeMM: ChildrenFunction<string> = ({
    isOpen,
    getItemProps,
    toggleMenu,
  }) => {
    return (
      <div className={styles.time3Menu}>
        <button className={styles.timeInput} type="button" onClick={() => toggleMenu()}>
          {this.state.selectedStartTimeMM !== '' ? this.state.selectedStartTimeMM : 'MM'}

          <div className={classnames('dropdown-menu', styles.dropdownMenu, { show: isOpen })}>
            {['00', '15', '30', '45'].map((item, index) => (
              <div className="dropdown-item" {...getItemProps({ key: index, index, item })}>
                {item}
              </div>
            ))}
          </div>
        </button>
      </div>
    );
  };

  onSelectEndTimeHH = (selectedItem: string | null) => {
    const item: string = selectedItem || "00";
    this.setState({selectedStartTimeHH: item})
    this.props.onSelectStartTime(item, "HH", this.props.index)
  }

  onSelectEndTimeMM = (selectedItem: string | null) => {
    const item: string = selectedItem || "00";
    this.setState({ selectedStartTimeHH: item })
    this.props.onSelectEndTime(item, "MM", this.props.index)
  }

    
  render() {
    return (
      <div
      >
        <div className={styles.formGroup}>
          <input
            className={classnames(styles.input)}
            onChange={(e) => this.props.onChangeClassNo(e, this.props.index)}
            placeholder="Class No."
          /> 
          <Downshift onChange={this.onSelectDay}>{this.renderDropdownLessonType}</Downshift>
          <input
            className={classnames(styles.input)}
            onChange={(e) => this.props.onChangeClassNo(e, this.props.index)}
            placeholder="Venue."
          />
          <Downshift onChange={this.onSelectDay}>{this.renderDropdownDay}</Downshift>

          <div className={classnames(styles.timeInputHolder, 'btn btn-outline-primary btn-svg')}>
            <Downshift onChange={this.onSelectStartTimeHH}>
              {this.renderDropdownStartTimeHH}
            </Downshift>
            :
            <Downshift onChange={this.onSelectStartTimeMM}>
              {this.renderDropdownStartTimeMM}
            </Downshift>
          </div>
          <div className={classnames(styles.timeInputHolder, 'btn btn-outline-primary btn-svg')}>
            <Downshift onChange={this.onSelectStartTimeHH}>
              {this.renderDropdownStartTimeHH}
            </Downshift>
            :
            <Downshift onChange={this.onSelectStartTimeMM}>
              {this.renderDropdownStartTimeMM}
            </Downshift>
          </div>
        </div>
      </div>
    );
  }
}