// @flow
import React from 'react';

export default function LoadingSpinner() {
  return (
    <div className="loading-spinner">
      <i className="fa fa-4x fa-fw fa-circle-o-notch fa-spin" aria-hidden="true" />
      <p className="loading-text">Loading...</p>
    </div>
  );
}
