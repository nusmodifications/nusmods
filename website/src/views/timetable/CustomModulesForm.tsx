import * as React from 'react';
import { connect } from 'react-redux';
import classnames from 'classnames';

import styles from './CustomModulesForm.scss';

class CustomModulesForm extends React.Component<> {
  render() {
    return (<input className={classnames(styles.input)} placeholder="Module Name" />);
  }
}

function mapStateToProps() {
  return {};
}

export default connect(mapStateToProps, {})(CustomModulesForm);
