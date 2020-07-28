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
    selectedDay: 'Monday',
    selectedStartTimeHH: '08',
    selectedStartTimeMM: '00',
    selectedEndTimeHH: '10',
    selectedEndTimeMM: '00',
  };


  /*
  onUpdateInner = (
    event: React.SyntheticEvent<HTMLSelectElement>,
    key: keyof ModuleClass,
    additionalKey?: string,
  ) => {
    if (typeof event.currentTarget.value !== 'undefined') {
      let finalValue = event.currentTarget.value;
      if (additionalKey) {
        finalValue = (additionalKey == 'hour') ?
          +event.currentTarget.value + this.props.moduleClass.startTime.slice(-2, 0)
          : this.props.moduleClass.startTime.slice(0, 2) + +event.currentTarget.value;
      }
      this.props.onChange({
        ...this.props.moduleClass,
        [key]: finalValue,
      });
    }
  };
  */

  onSelectLessonType = (item: string) => {
    this.props.onSelectLessonType(item);
  };

  renderDropdownLessonType = () => {
    return (
      <div className="form-group">
        <label htmlFor="venue-time">Lesson Type</label>
        <select
          id="venue-time"
          className="form-control"
          value={this.state.selectedLessonType}
          onChange={(evt) => this.onSelectLessonType(evt.currentTarget.value)}
        >
          {Object.keys(LESSON_TYPE_ABBREV).map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}

        </select>
      </div>
    );
  };


  onSelectDay = (item: string) => {
    this.props.onSelectDay(item);
  }

  renderDropdownDay = () => {
    return (
      <div className={(styles.search)}>

      <div className="form-group">
        <label htmlFor="venue-time">Day</label>
        <select
          id="venue-time"
          className="form-control"
          value={this.state.selectedDay}
          onChange={(evt) => this.onSelectDay(evt.currentTarget.value)}
        >
          {Days.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </select>
        </div>
        </div>
    );
  };

  onSelectStartTimeHH = (selectedItem: string) => {
    this.props.onSelectStartTime(selectedItem, 'HH');
  };

  onSelectStartTimeMM = (selectedItem: string) => {
    this.props.onSelectStartTime(selectedItem, 'MM');
  };

  renderDropdownStartTimeHH: ChildrenFunction<string> = () => {
    return (
      <div className={styles.timeMenu}>
        <div className="form-group">
          <label htmlFor="venue-time">Start Time Hour</label>
          <select
            id="venue-time"
            className="form-control"
            value={this.state.selectedStartTimeHH}
            onChange={(evt) => this.onSelectStartTimeHH(evt.currentTarget.value)}
          >
            {[
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
            ].map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </div>
      </div>
    );
  };

  renderDropdownStartTimeMM: ChildrenFunction<string> = () => {
    return (
      <div className={styles.timeMenu}>
        <div className="form-group">
          <label htmlFor="venue-time">Start Time Minutes</label>
          <select
            id="venue-time"
            className="form-control"
            value={this.state.selectedStartTimeMM}
            onChange={(evt) => this.onSelectStartTimeMM(evt.currentTarget.value)}
          >
            {['00', '15', '30', '45'].map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </div>
        </div>
    );
  };

    renderDropdownEndTimeHH: ChildrenFunction<string> = () => {
    return (
      <div className={styles.timeMenu}>
        <div className="form-group">
          <label htmlFor="venue-time">End Time Hour</label>
          <select
            id="venue-time"
            className="form-control"
            value={this.state.selectedEndTimeHH}
            onChange={(evt) => this.onSelectEndTimeHH(evt.currentTarget.value)}
          >
            {[
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
            ].map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </div>
      </div>
    );
  };

  renderDropdownEndTimeMM: ChildrenFunction<string> = () => {
    return (
      <div className={styles.timeMenu}>
        <div className="form-group">
          <label htmlFor="venue-time">End Time Minutes</label>
          <select
            id="venue-time"
            className="form-control"
            value={this.state.selectedEndTimeMM}
            onChange={(evt) => this.onSelectEndTimeMM(evt.currentTarget.value)}
          >
            {['00', '15', '30', '45'].map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </div>
        </div>
    );
  };



  onSelectEndTimeHH = (selectedItem: string) => {
    this.props.onSelectEndTime(selectedItem, 'HH');
  };

  onSelectEndTimeMM = (selectedItem: string) => {
    this.props.onSelectEndTime(selectedItem, 'MM');
  };

  render() {
    return (
      <div>
        <div className={(styles.formGroup)}>
          <input
            className={classnames(styles.input)}
            onChange={(e) => this.props.onChangeClassNo(e)}
            placeholder="Class No."
          />
          {this.renderDropdownLessonType}
          <input
            className={classnames(styles.input)}
            onChange={(e) => this.props.onChangeVenue(e)}
            placeholder="Venue."
          />
          {this.renderDropdownDay()}

          <div className={classnames(styles.timeInputHolder, 'btn btn-outline-primary btn-svg')}>
            {this.renderDropdownStartTimeHH}:{this.renderDropdownStartTimeMM}
          </div>

          <div className={classnames(styles.timeInputHolder, 'btn btn-outline-primary btn-svg')}>
            {this.renderDropdownEndTimeHH}:{this.renderDropdownEndTimeMM}
          </div>
        </div>
      </div>
    );
  }
}