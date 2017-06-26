// @flow

import React from 'react';
import classnames from 'classnames';

type Props = {
  choices: string[],
  selectedChoice: ?string,
  onChoiceSelect: Function,
  ariaLabel: ?string,
};

export default function ButtonGroupSelector(props: Props) {
  const { choices, selectedChoice, onChoiceSelect, ariaLabel = 'Choices' } = props;

  const buttons = choices.map(choice =>
    (<button key={choice}
      onClick={() => onChoiceSelect(choice)}
      type="button"
      className={classnames('btn', {
        'btn-primary': selectedChoice === choice,
        'btn-secondary': selectedChoice !== choice,
      })}
    >
      {choice}
    </button>),
  );

  return (
    <div className="btn-group btn-group-sm" role="group" aria-label={ariaLabel}>
      {buttons}
    </div>
  );
}
