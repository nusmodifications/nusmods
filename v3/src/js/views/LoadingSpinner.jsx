// @flow
import React from 'react';

export default function LoadingSpinner() {
  return (
    <div className="loading-spinner">
      <i className="fa fa-fw fa-circle-o-notch fa-spin" style={{ fontSize: '4rem' }} aria-hidden="true" />
      <p className="loading-text">Loading...</p>
    </div>
  );
}
