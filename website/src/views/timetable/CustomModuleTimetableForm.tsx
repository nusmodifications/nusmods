import * as React from 'react';
import classnames from 'classnames';
import { connect } from 'react-redux';
import Downshift, { ChildrenFunction } from 'downshift';
import { Days } from 'types/modules';
import { Counter } from 'utils/react';

import styles from './CustomModuleTimetableForm.scss';

type OwnProps = {
  // Own props
  index: number;
  onChangeClassNo: (event: React.ChangeEvent<HTMLInputElement>, index: number) => void;
  onSelectStartTime: (item: string, index: number) => void;
  onSelectEndTime: (item: string, index: number) => void;
  onSelectVenue: (item: string, index: number) => void;
  onSelectDay: (item: string, index: number) => void;
  onSelectLessonType: (item: string, index: number) => void;
};

type Props = OwnProps;

type State = {
  selectedDay: string;
};

export default class CustomModuleTimetableForm extends React.Component<Props, State> {
  state: State = {
    selectedDay: ""
  }

  onSelectDay = (selectedItem: string | null) => {
    if (selectedItem === null) {
      console.log("invalid");
      return;
    }
    const item: string = selectedItem || "";
    this.setState({selectedDay: item})
    this.props.onSelectDay(item, this.props.index)
  }

  renderDropdownDay: ChildrenFunction<string> = ({
    isOpen,
    getItemProps,
    toggleMenu,
  }) => {
    const counter = new Counter();
    return (
      <div className={styles.menu}>
        <button
          className={classnames(styles.toggle, 'btn btn-outline-primary btn-svg')}
          type="button"
          onClick={() => toggleMenu()}
        >
          {this.state.selectedDay!==""? this.state.selectedDay : "Day"}
        </button>
          <div
            className={classnames('dropdown-menu', styles.dropdownMenu, { show: isOpen })}
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
    )
  }
    
  render() {
    return (
      <div>
        <input
          className={classnames(styles.input)}
          onChange={e => this.props.onChangeClassNo(e, this.props.index)}
          placeholder="Class No."
        />
        <Downshift onChange={this.onSelectDay}>{this.renderDropdownDay}</Downshift>
      </div>
    )
  }
}