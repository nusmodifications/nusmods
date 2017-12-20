// @flow

import React from 'react';
import { Close } from 'views/components/icons';

type Props = {
  onClick: Function,
};

export default function ({ onClick }: Props) {
  return (
    <button className="close" type="button" onClick={onClick} aria-label="Close">
      <Close />
    </button>
  );
}
