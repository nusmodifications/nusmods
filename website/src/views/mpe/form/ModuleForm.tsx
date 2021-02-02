import styles from './ModuleForm.scss';
import ModuleCard from './ModuleCard';

type Props = {
  totalMC: number; // Remove this when new props are added.
};
const ModuleForm: React.FC<Props> = (props) => (
  <div className={styles.container}>
    <div className={styles.headerTitle}>
      <div className={styles.rank}>Rank</div>
      <div className={styles.module}>Module</div>
      <div className={styles.mc}>
        {props.totalMC > 1 ? `${props.totalMC} MCs Selected` : `${props.totalMC} MC Selected`}
      </div>
    </div>
    -
    <ModuleCard moduleTitle="Programming Methodology 1" moduleCode="CS1101S" amountMC={4} />
  </div>
);

export default ModuleForm;
