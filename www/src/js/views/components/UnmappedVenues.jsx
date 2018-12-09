// @flow
import React from 'react';

export default function UnmappedVenues() {
  return (
    <div>
      <div className="progress">
        <div
          className="progress-bar bg-success"
          role="progressbar"
          style={{width: "75%"}}
          aria-valuenow="25"
          aria-valuemin="0"
          aria-valuemax="100"
        />
      </div>
      75% of venues are mapped! Help us locate the remaining venues.
    </div>
  );
}
