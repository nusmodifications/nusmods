import * as React from 'react';
import classnames from 'classnames';
import { connect } from 'react-redux';

import CustomModulesForm from 'views/timetable/CustomModulesForm';
import styles from './CustomModulesContainer.scss';

class CustomModulesAddContainer extends React.Component<Props> {
  state = {
    showAddCustomModulesForm: false,
  };

  onChange = () => {
    if (this.state.showAddCustomModulesForm === true) {
      this.setState({showAddCustomModulesForm: false })
    }
    else {
      this.setState({showAddCustomModulesForm: true })
    }
  };

  render() {
    return (
      <button
        type="button"
        className={classnames(styles.titleBtn, 'btn-outline-primary btn btn-svg')}
        onClick={(this.onChange)}
      >
        Add custom modules to timetable
        {this.state.showCustomModulesForm && <CustomModulesForm />}
      </button>
    );
  }
}

function mapStateToProps() {

  return {

  };
}

export default connect(mapStateToProps, {})(CustomModulesAddContainer);
