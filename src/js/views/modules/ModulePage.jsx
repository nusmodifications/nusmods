import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import _ from 'lodash';

const ModulePage = (props) => (
  <div>
    <h1>{props.module.ModuleCode} {props.module.ModuleTitle}</h1>
    <hr/>
  </div>
);

ModulePage.propTypes = {
  module: PropTypes.object,
};

function mapStateToProps(state, ownProps) {
  const module = _.find(state.entities.moduleBank.moduleList, (mod) => {
    return mod.ModuleCode === ownProps.params.moduleCode;
  });
  return {
    module,
  };
}

export default connect(
  mapStateToProps
)(ModulePage);
