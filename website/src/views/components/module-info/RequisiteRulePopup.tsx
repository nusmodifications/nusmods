import { Info } from 'react-feather';

import LinkModuleCodes from 'views/components/LinkModuleCodes';
import Tooltip from 'views/components/Tooltip';
import styles from './RequisiteRulePopup.scss';

type Props = {
  rule: string;
  summary?: string;
  label?: string;
};

/**
 * Info icon that shows the full structured requisite rule in a popup.
 */
export default function RequisiteRulePopup({
  rule,
  summary,
  label = 'View detailed prerequisite rule',
}: Props) {
  if (!rule.trim()) return null;
  if (summary?.trim() === rule.trim()) return null;

  const content = (
    <div className={styles.content}>
      <LinkModuleCodes>{rule}</LinkModuleCodes>
    </div>
  );

  return (
    <Tooltip
      content={content}
      interactive
      arrow
      placement="bottom"
      maxWidth="none"
      touch="hold"
      className={styles.tooltip}
    >
      <button type="button" className={styles.trigger} aria-label={label}>
        <Info className="svg svg-small" size={18} strokeWidth={2} />
      </button>
    </Tooltip>
  );
}
