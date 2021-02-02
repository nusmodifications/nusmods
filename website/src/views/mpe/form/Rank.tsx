import styles from './Rank.scss';

type Props = {
  rankNumber: number;
};

const Rank: React.FC<Props> = ({ rankNumber }) => (
  <div className={styles.rank}>{rankNumber}</div>
);

export default Rank;