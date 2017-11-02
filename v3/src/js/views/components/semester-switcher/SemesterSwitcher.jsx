// @flow
import type { Semester } from 'types/modules';

import React, { Component } from 'react';
import config from 'config';

import { ChevronLeft, ChevronRight } from 'views/components/icons';
import { formatSemesterName } from 'utils/timetables';

type Props = {
  semester: Semester,
  onSelectSemester: Function,
};

function isValidSemester(semester: Semester): Boolean {
  return semester >= 1 && semester <= 4;
}

class SemesterSwitcher extends Component<Props> {
  switchSemester = (offset) => {
    const newSemester: Semester = this.props.semester + offset;
    if (!isValidSemester(newSemester)) {
      return;
    }
    this.props.onSelectSemester(newSemester);
  }

  render() {
    return (
      <div>
        <h4 className="text-center">
          {isValidSemester(this.props.semester - 1) &&
            <button
              className="btn btn-link"
              type="button"
              onClick={() => {
                this.switchSemester(-1);
              }}
            >
              <ChevronLeft />
            </button>
          }
          &nbsp;{formatSemesterName(this.props.semester, config)}&nbsp;
          {isValidSemester(this.props.semester + 1) &&
            <button
              className="btn btn-link"
              type="button"
              onClick={() => {
                this.switchSemester(1);
              }}
            >
              <ChevronRight />
            </button>
          }
        </h4>
      </div>
    );
  }
}

export default SemesterSwitcher;
