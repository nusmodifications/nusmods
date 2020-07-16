import * as React from 'react';
import classnames from 'classnames';
import { connect } from 'react-redux';
import Downshift, { ChildrenFunction } from 'downshift';
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
    console.log("SDASD")
    if (selectedItem === null) {
      console.log("invalid");
      return;
    }
    const item: string = selectedItem || "";
    this.setState({selectedDay: item})
    console.log(this.state.selectedDay)
    this.props.onSelectDay(item, this.props.index)
  }

  renderDropdownDay: ChildrenFunction<string> = ({
    isOpen,
    getItemProps,
    getMenuProps,
    toggleMenu,
    highlightedIndex,
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
          {...getMenuProps()}
        >
          <div
            className={classnames('dropdown-item', {
              'dropdown-selected': counter.matches(highlightedIndex),
            })}
          >
            Monday
          </div>
          <div
            className={classnames('dropdown-item', {
              'dropdown-selected': counter.matches(highlightedIndex),
            })}
          >
            Tuesday
          </div>
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
        <Downshift onSelect={this.onSelectDay}>{this.renderDropdownDay}</Downshift>
      </div>
    )
  }
}