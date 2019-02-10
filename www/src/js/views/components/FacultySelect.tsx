import * as React from 'react';

import { Faculty } from 'types/modules';

import facultyList from 'data/faculty-list.json';

type Props = {
  faculty: Faculty | void;
  onChange: Function; // will be called with the selected faculty when option changes
};

export default function FacultySelect(props: Props) {
  const { faculty: selectedFaculty = '', onChange } = props;

  return (
    <select
      className="form-control"
      name="faculty-select"
      value={selectedFaculty}
      onChange={(event) => onChange(event.target.value)}
    >
      <option disabled value="">
        &nbsp;-- Select a faculty --&nbsp;
      </option>
      {facultyList.map((faculty) => (
        <option key={faculty.value} value={faculty.value}>
          {faculty.name}
        </option>
      ))}
    </select>
  );
}
