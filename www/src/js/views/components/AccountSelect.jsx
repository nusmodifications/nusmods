// @flow
import React from 'react';

type Props = {
  accountType: string | void,
  onChange: Function, // will be called with the selected faculty when option changes
};

export default function AccountSelect(props: Props) {
  const { accountType: selectedAccountType = 'P', onChange } = props;

  return (
    <select
      className="form-control"
      name="account-select"
      value={selectedAccountType}
      onChange={(event) => onChange(event.target.value)}
    >
      <option value="P">Programme</option>
      <option value="G">General</option>
    </select>
  );
}
