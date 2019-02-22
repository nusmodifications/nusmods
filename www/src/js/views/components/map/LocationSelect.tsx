import React, { SelectHTMLAttributes } from 'react';
import { LatLngTuple } from 'types/venues';

export const wellKnownLocations: Record<string, LatLngTuple> = {
  'Central Library': [1.2966113, 103.7732264],
  UTown: [1.3044487, 103.7727811],
  Science: [1.2964893, 103.7806588],
  Engineering: [1.3002873, 103.770677],
  Computing: [1.2935772, 103.7741592],
  "Prince George's Park": [1.2909124, 103.781155],
  'Bukit Timah Campus': [1.3189664, 103.8176009],
};

type Props = SelectHTMLAttributes<HTMLSelectElement> & {
  onLocationChange: (name: string, latlng: LatLngTuple) => void;
};

export default function LocationSelect({ onLocationChange, ...otherProps }: Props) {
  return (
    <select
      onChange={(evt) => {
        evt.preventDefault();

        const newLocation = evt.target.value;
        const newLatlng = wellKnownLocations[newLocation];

        if (newLatlng) onLocationChange(newLocation, newLatlng);
      }}
      {...otherProps}
    >
      <option>Jump to...</option>
      {Object.keys(wellKnownLocations).map((name) => (
        <option key={name} value={name}>
          {name}
        </option>
      ))}
    </select>
  );
}
