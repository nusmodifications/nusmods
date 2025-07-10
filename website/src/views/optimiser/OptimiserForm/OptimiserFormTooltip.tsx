import { Info } from 'react-feather';
import Tooltip from 'views/components/Tooltip';

import styles from './OptimiserFormTooltip.scss';

type Props = {
  content: string;
};

const OptimiserFormTooltip: React.FC<Props> = ({ content }) => (
  <Tooltip content={content} placement="right">
    <Info className={styles.optimiserTooltipIcon} />
  </Tooltip>
);

export default OptimiserFormTooltip;
