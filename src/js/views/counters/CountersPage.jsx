import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { increment, decrement } from 'actions/counter';

class CountersPage extends Component {
  render() {
    return (
      <div>
        <h1>Counter</h1>
        <hr/>
        <h3>{this.props.counter}</h3>
        <button className="btn btn-primary" onClick={this.props.increment.bind(this)}>+</button>
        &nbsp;Buttons&nbsp;
        <button className="btn btn-primary" onClick={this.props.decrement.bind(this)}>-</button>
      </div>
    );
  }
}

CountersPage.propTypes = {
  counter: PropTypes.number,
  increment: PropTypes.func,
  decrement: PropTypes.func
};

function mapStateToProps(state) {
  return {
    counter: state.counter
  };
}

export default connect(
  mapStateToProps,
  {
    increment,
    decrement
  }
)(CountersPage);
