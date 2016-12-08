// @flow
import React, { Component } from 'react';
import { connect } from 'react-redux';
import _ from 'lodash';

import { selectNewStudent, selectFaculty } from 'actions/settings';
import AccountSelect from 'views/components/AccountSelect';
import FacultySelect from 'views/components/FacultySelect';
import NewStudentSelect from 'views/components/NewStudentSelect';
import { AccountType, BiddingStat, Faculty } from 'types/modules';
import ButtonGroupSelector from 'views/components/ButtonGroupSelector';
import CorsBiddingStatsTable from './CorsBiddingStatsTable';

type Props = {
  faculty: Faculty,
  newStudent: boolean,
  selectFaculty: Function,
  selectNewStudent: Function,
  stats: Array<BiddingStat>,
};

type Student = {
  newStudent: boolean,
  faculty: Faculty,
  accountType: AccountType,
}

const sameFaculty = (stat: BiddingStat, student: Student): boolean => (stat.Faculty === student.faculty);
const isNew = student => (student.newStudent);
const PROGRAMME = 'P';
const GENERAL = 'G';
const isProgrammeAccount = student => (student.accountType === PROGRAMME);
const isGeneralAccount = student => (student.accountType === GENERAL);

function isStatRelevantForStudent(stat, student) {
  switch (stat.StudentAcctType) {
    case 'Returning Students [P]':
      return sameFaculty(stat, student) && isProgrammeAccount(student) && !isNew(student);
    case 'New Students [P]':
      return sameFaculty(stat, student) && isProgrammeAccount(student) && isNew(student);
    case 'NUS Students [P]':
      return sameFaculty(stat, student) && isProgrammeAccount(student);
    case 'Returning Students and New Students [P]':
      return sameFaculty(stat, student) && isProgrammeAccount(student);
    case 'NUS Students [G]':
      return isGeneralAccount(student);
    case 'Returning Students [P] and NUS Students [G]':
      return (sameFaculty(stat, student) && isProgrammeAccount(student) && !isNew(student))
        || (!sameFaculty(stat, student) && isGeneralAccount(student));
    case 'NUS Students [P, G]':
      return (sameFaculty(stat, student) && isProgrammeAccount(student))
        || (!sameFaculty(stat, student) && isGeneralAccount(student));
    case 'Reserved for [G] in later round':
      return !sameFaculty(stat, student) && isGeneralAccount(student);
    case 'Not Available for [G]':
      return sameFaculty(stat, student) && isProgrammeAccount(student);
    default:
      throw Error(`unknown StudentAcctType ${stat.StudentAcctType}`);
  }
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
        />

        <CorsBiddingStatsTable stats={statsByAySem[selectedAySem]} />
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
