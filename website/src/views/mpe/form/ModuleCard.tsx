import styles from './ModuleCard.scss';

type Props = {
  moduleTitle?: string;
  moduleCode?: string;
  amountMC?: number;

  // Remove this when new props are added.
};

const ModuleCard: React.FC<Props> = (props) => (
  <div className={styles.container}>
    <div className={styles.rank}> 1 </div>
    <div className={styles.card}>
      <div className={styles.side}>
        <img className={styles.image} src="https://i.ibb.co/48FtBq1/doticon.png" alt="dots" />
      </div>
      <div className={styles.modulecode}>{props.moduleCode}</div>
      <div className={styles.moduletitle}>{props.moduleTitle}</div>
      <div className={styles.mc}>{props.amountMC} MC</div>
      <div className={styles.moduletype}>Module Type</div>
    </div>
    <img
      className={styles.trashimage}
      src="https://i.ibb.co/Vt94drb/Bing-Cheng-2.png"
      alt="trash can"
    />
  </div>
);
export default ModuleCard;
