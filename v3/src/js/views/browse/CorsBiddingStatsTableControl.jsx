// @flow
import React, { Component } from 'react';
import { connect } from 'react-redux';
import _ from 'lodash';

import { selectNewStudent, selectFaculty } from 'actions/settings';
import AccountSelect from 'views/components/AccountSelect';
import FacultySelect from 'views/components/FacultySelect';
import NewStudentSelect from 'views/components/NewStudentSelect';
import type { AccountType, BiddingStat, Faculty, Student } from 'types/modules';
import ButtonGroupSelector from 'views/components/ButtonGroupSelector';
import { isStatRelevantForStudent } from 'utils/cors';
import CorsBiddingStatsTable from './CorsBiddingStatsTable';

type Props = {
  faculty: Faculty,
  newStudent: boolean,
  selectFaculty: Function,
  selectNewStudent: Function,
  stats: Array<BiddingStat>,
};

type State = {
  accountType: AccountType,
  selectedAySem: ?string,
}

class CorsBiddingStatsTableControl extends Component {
  constructor(props: Props) {
    super(props);
    this.state = {
      accountType: 'G',
      selectedAySem: null,
    };
    this.onAccountTypeChange = this.onAccountTypeChange.bind(this);
    this.onSelectAySem = this.onSelectAySem.bind(this);
  }

  state: State
  onAccountTypeChange: Function
  onSelectAySem: Function

  onAccountTypeChange(accountType: AccountType) {
    this.setState({ accountType });
  }

  onSelectAySem(selectedAySem) {
    this.setState({ selectedAySem });
  }

  render() {
    const {
      stats,
      faculty,
      newStudent,
    } = this.props;
    const {
      selectedAySem,
      accountType,
    } = this.state;

    const student: Student = {
      accountType,
      newStudent,
      faculty,
    };

    const relevantStats = stats.filter(s => isStatRelevantForStudent(s, student));
    const statsByAySem = _.groupBy(relevantStats, s => `${s.AcadYear} Sem ${s.Semester}`);

    return (
      <div>
        <div className="row">
          <div className="col-sm-1">
            <label className="col-form-label" htmlFor="faculty-select">Faculty</label>
          </div>
          <div className="col-sm-4">
            <FacultySelect faculty={faculty} onChange={this.props.selectFaculty} />
          </div>
          <div className="col-sm-1">
            <label className="col-form-label" htmlFor="account-select">Account</label>
          </div>
          <div className="col-sm-3">
            <AccountSelect accountType={accountType} onChange={this.onAccountTypeChange} />
          </div>
          <div className="col-sm-1">
            <label className="col-form-label" htmlFor="new-student-select">New student</label>
          </div>
          <div className="col-sm-2">
            <NewStudentSelect newStudent={newStudent} onSelectNewStudent={this.props.selectNewStudent} />
          </div>
        </div>

        <ButtonGroupSelector choices={Object.keys(statsByAySem)}
          selectedChoice={selectedAySem}
          onChoiceSelect={this.onSelectAySem}
          ariaLabel="Select academic year and semester"
        />

        {selectedAySem ?
          <CorsBiddingStatsTable aySem={selectedAySem} stats={statsByAySem[selectedAySem]} />
          :
            <p>Select a semester to view its bidding statistics</p>
        }
      </div>
    );
  }
}

function mapStateToProps(state) {
  return {
    newStudent: state.settings.newStudent,
    faculty: state.settings.faculty,
  };
}

export default connect(
  mapStateToProps,
  {
    selectNewStudent,
    selectFaculty,
  }
)(CorsBiddingStatsTableControl);
