import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { fetchReddits } from 'actions/reddit';

class RedditPage extends Component {
  constructor(props) {
    super(props);
    this.state = {
      topic: 'reactjs'
    };
  }

  componentDidMount() {
    this.search();
  }

  updateTopic(event) {
    this.setState({
      topic: event.target.value
    });
  }

  search(event) {
    if (event) {
      event.preventDefault();
    }
    this.props.fetchReddits(this.state.topic);
  }

  render() {
    return (
      <div>
        <h1>Reddit</h1>
        <hr/>
        <p>Try searching for "redux" to see the failure case.</p>
        <form onSubmit={this.search.bind(this)}>
          <input className="form-control" value={this.state.topic} onChange={this.updateTopic.bind(this)}/>
        </form>
        <br/>
        {this.props.fetchRedditsRequest.isPending ? <p>Loading...</p> : null}
        {this.props.fetchRedditsRequest.isFailure ? <p>Request failed</p> : null}
        {this.props.fetchRedditsRequest.isSuccessful ?
          <ul>
            {this.props.items.map((item) => {
              return (
                <li key={item.data.id}>{item.data.title}</li>
              );
            })}
          </ul> : null
        }
      </div>
    );
  }
}

RedditPage.propTypes = {
  items: PropTypes.array,
  fetchReddits: PropTypes.func,
  fetchRedditsRequest: PropTypes.object
};

function mapStateToProps(state) {
  return {
    items: state.reddit,
    fetchRedditsRequest: state.requests.fetchRedditsRequest || {}
  };
}

export default connect(
  mapStateToProps,
  {
    fetchReddits
  }
)(RedditPage);
