// @flow
import React from 'react';

export default function Loader() {
  return (
    <div className="text-center">
      <i className="fa fa-circle-o-notch fa-spin" style={{ fontSize: '4rem' }} aria-hidden="true" />
      <span className="sr-only">Loading</span>
    </div>
  );
}
