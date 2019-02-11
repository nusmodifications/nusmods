import * as React from 'react';
import classnames from 'classnames';

type ButtonChoice = string;
type Props = {
  choices: ButtonChoice[];
  attrs?: { [choice: string]: React.ButtonHTMLAttributes<HTMLButtonElement> };
  classNames?: { [buttonChoice: string]: string[] };
  size?: string;
  selectedChoice: ButtonChoice | null | undefined;
  onChoiceSelect: (str: string) => void;
  ariaLabel?: string;
};

export default function ButtonGroupSelector(props: Props) {
  const {
    size,
    choices,
    selectedChoice,
    onChoiceSelect,
    classNames = {},
    attrs = {},
    ariaLabel = 'Choices',
  } = props;

  const sizeClassName = size ? `btn-group-${size}` : null;

  const buttons = choices.map((choice) => {
    const attr = attrs[choice] || {};
    const className = classNames[choice] || [];

    return (
      <button
        key={choice}
        onClick={() => onChoiceSelect(choice)}
        type="button"
        className={classnames('btn', ...className, {
          'btn-primary': selectedChoice === choice,
          'btn-outline-primary': selectedChoice !== choice,
        })}
        {...attr}
      >
        {choice}
      </button>
    );
  });

  return (
    <div className={classnames('btn-group', sizeClassName)} role="group" aria-label={ariaLabel}>
      {buttons}
    </div>
  );
}
