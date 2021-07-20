import * as React from 'react';
import classnames from 'classnames';
import { connect } from 'react-redux';

import CustomModulesForm from 'views/timetable/CustomModulesForm';
import styles from './CustomModulesContainer.scss';

type OwnProps = {
  // Own props
  semester: number;
};

type Props = OwnProps;

type State = {
  showCustomModulesForm: boolean;
};

class CustomModulesAddContainer extends React.Component<Props, State> {
  state = {
    showCustomModulesForm: false,
  };

  onChange = () => {
    if (this.state.showCustomModulesForm === true) {
      this.setState({ showCustomModulesForm: false });
    } else {
      this.setState({ showCustomModulesForm: true });
    }
  };

  render() {
    return (
      <div>
        <button
          type="button"
          className={classnames(styles.titleBtn, 'btn-outline-primary btn btn-svg')}
          onClick={this.onChange}
        >
          Add custom module to timetable
        </button>
        {this.state.showCustomModulesForm && <CustomModulesForm />}
      </div>
    );
  }
}

function mapStateToProps() {
  return {};
}

export default connect(mapStateToProps, {})(CustomModulesAddContainer);
