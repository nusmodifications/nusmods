// @flow
import React from 'react';

export default function LoadingSpinner() {
  return (
    <div className="loading-spinner">
      <i className="fa fa-3x fa-fw fa-circle-o-notch fa-spin" aria-hidden="true" />
    </div>
  );
}
