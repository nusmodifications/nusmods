import * as React from 'react';
import { ToggleGroup, ToggleGroupItem } from 'components/ui/toggle-group';

type Props = {
  labels?: [string, string];
  isOn?: boolean | null;
  className?: string;
  onChange: (boolean: boolean) => void;
};

const Toggle: React.FC<Props> = ({ labels = ['On', 'Off'], isOn, className, onChange }) => (
  <ToggleGroup
    type="single"
    value={isOn == null ? '' : String(isOn)}
    onValueChange={(value) => {
      if (value) onChange(value === 'true');
    }}
  >
    {labels.map((label, index) => (
      <ToggleGroupItem key={label} value={String(index === 0)} className={className}>
        {label}
      </ToggleGroupItem>
    ))}
  </ToggleGroup>
);

export default React.memo(Toggle);
