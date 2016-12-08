// @flow
import React, { Component } from 'react';
import { connect } from 'react-redux';
import _ from 'lodash';

import { selectNewStudent, selectFaculty } from 'actions/settings';
import FacultySelect from 'views/components/FacultySelect';
import AccountSelect from 'views/components/AccountSelect';
import { BiddingStat, Faculty } from 'types/modules';
import CorsBiddingStatsTable from './CorsBiddingStatsTable';


type Props = {
  stats: Array<BiddingStat>,
  faculty: Faculty,
  selectFaculty: Function,
}

const sameFaculty = (stat, student) => (stat.Faculty === student.faculty);
const isNew = student => (student.newStudent);
const PROGRAMME = 'P';
const GENERAL = 'G';
const programmeAccount = student => (student.accountType === PROGRAMME);
const generalAccount = student => (student.accountType === GENERAL);

function isStatRelevantForStudent(stat, student) {
  switch (stat.StudentAcctType) {
    case 'Returning Students [P]':
      return sameFaculty(stat, student) && programmeAccount(student) && !isNew(student);
    case 'New Students [P]':
      return sameFaculty(stat, student) && programmeAccount(student) && isNew(student);
    case 'NUS Students [P]':
      return sameFaculty(stat, student) && programmeAccount(student);
    case 'Returning Students and New Students [P]':
      return sameFaculty(stat, student) && programmeAccount(student);
    case 'NUS Students [G]':
      return generalAccount(student);
    case 'Returning Students [P] and NUS Students [G]':
      return (sameFaculty(stat, student) && programmeAccount(student) && !isNew(student))
        || (!sameFaculty(stat, student) && generalAccount(student));
    case 'NUS Students [P, G]':
      return (sameFaculty(stat, student) && programmeAccount(student))
        || (!sameFaculty(stat, student) && generalAccount(student));
    case 'Reserved for [G] in later round':
      return !sameFaculty(stat, student) && generalAccount(student);
    case 'Not Available for [G]':
      return sameFaculty(stat, student) && programmeAccount(student);
    default:
      return false;
  }
}


class CorsBiddingStatsTableControl extends Component {
  constructor(props: Props) {
    super(props);
    this.state = {
      accountType: 'G',
      isNewStudent: false,
      aySem: null,
    };
    this.onAccountTypeChange = this.onAccountTypeChange.bind(this);
    this.onSelectAySem = this.onSelectAySem.bind(this);
  }

  onAccountTypeChange(accountType) {
    this.setState({
      accountType,
    });
  }

  onSelectAySem(aySem) {
    this.setState({
      aySem,
    });
  }

  render() {
    const stats = this.props.stats;
    const student = {
      ...this.state,
      faculty: this.props.faculty,
    };
    const relevantStats = stats.filter(s => isStatRelevantForStudent(s, student));
    const grouped = _.groupBy(relevantStats, s => `${s.AcadYear} Sem ${s.Semester}`);
    const aySemKeys = Object.keys(grouped);

    const aySemSelector = aySemKeys.map(a =>
      <button onClick={() => this.onSelectAySem(a)}
        type="button"
        className="btn btn-secondary">
        {a}
      </button>
    );

    return (
      <div>
        <FacultySelect faculty={this.props.faculty} onChange={this.props.selectFaculty} />
        <AccountSelect accountType={this.state.accountType} onChange={this.onAccountTypeChange} />
        <div className="btn-group btn-group-sm" role="group" aria-label="Ay Sems">
          {aySemSelector}
        </div>
        <CorsBiddingStatsTable stats={grouped[this.state.aySem]} />
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
