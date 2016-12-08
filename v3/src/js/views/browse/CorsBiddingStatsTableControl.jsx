// @flow
import React, { Component } from 'react';
import { connect } from 'react-redux';
import _ from 'lodash';
import classnames from 'classnames';

import { selectNewStudent, selectFaculty } from 'actions/settings';
import AccountSelect from 'views/components/AccountSelect';
import FacultySelect from 'views/components/FacultySelect';
import NewStudentSelect from 'views/components/NewStudentSelect';
import { BiddingStat, Faculty } from 'types/modules';
import CorsBiddingStatsTable from './CorsBiddingStatsTable';


type Props = {
  faculty: Faculty,
  newStudent: boolean,
  selectFaculty: Function,
  selectNewStudent: Function,
  stats: Array<BiddingStat>,
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
      aySem: null,
    };
    this.onAccountTypeChange = this.onAccountTypeChange.bind(this);
    this.onSelectAySem = this.onSelectAySem.bind(this);
  }

  onAccountTypeChange(accountType) {
    this.setState({ accountType });
  }

  onSelectAySem(aySem) {
    this.setState({ aySem });
  }

  render() {
    const {
      stats,
      faculty,
      newStudent,
    } = this.props;

    const student = {
      ...this.state,
      faculty,
    };

    const relevantStats = stats.filter(s => isStatRelevantForStudent(s, student));
    const grouped = _.groupBy(relevantStats, s => `${s.AcadYear} Sem ${s.Semester}`);
    const aySemSelector = Object.keys(grouped).map(a =>
      <button key={a} onClick={() => this.onSelectAySem(a)}
        type="button"
        className={classnames('btn', {
          'btn-primary': this.state.aySem === a,
          'btn-secondary': !(this.state.aySem === a),
        })}
      >
        {a}
      </button>
    );

    return (
      <div>
        <div className="row">
          <div className="col-sm-5 text-xs-right">
            <FacultySelect faculty={faculty} onChange={this.props.selectFaculty} />
          </div>
          <div className="col-sm-4 text-xs-right">
            <AccountSelect accountType={this.state.accountType} onChange={this.onAccountTypeChange} />
          </div>
          <div className="col-sm-2 text-xs-right">
            <NewStudentSelect newStudent={newStudent} onSelectNewStudent={this.props.selectNewStudent} />
          </div>
        </div>
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
