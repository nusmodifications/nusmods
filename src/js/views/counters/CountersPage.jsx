import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { increment, decrement } from 'actions/counter';

const CountersPage = (props) => (
  <div>
    <h1>Counter</h1>
    <hr/>
    <h3>{props.counter}</h3>
    <button className="btn btn-primary" onClick={props.increment}>+</button>
    &nbsp;Buttons&nbsp;
    <button className="btn btn-primary" onClick={props.decrement}>-</button>
  </div>
);

CountersPage.propTypes = {
  counter: PropTypes.number,
  increment: PropTypes.func,
  decrement: PropTypes.func,
};

function mapStateToProps(state) {
  return {
    counter: state.counter,
  };
}

export default connect(
  mapStateToProps,
  {
    increment,
    decrement,
  }
)(CountersPage);
