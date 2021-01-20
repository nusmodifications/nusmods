import styles from './MpeContainer.scss';

type Props = {
  placeholder: true; // Remove this when new props are added.
};

const MpeContainer: React.FC<Props> = () => (
  <div className={styles.pageContainer}>
    <div className="col-md-9">
      <header className={styles.header}>
        <h2>Module Preference Exercise</h2>
        <h4>AY2021/2022 - Semester 2</h4>
      </header>
      <h4 className={styles.subtitle}>Overview</h4>

      <p>
        The Module Preference Exercise (MPE) is a project initiated by NUS to better understand students’ demand for specific modules. 
        Students who have completed this exercise <strong>will receive tie-breaker benefit</strong> during the ModReg period.
      </p>
      <p>
        Do take note that this is only a planning exercise; <strong>it does not enroll you in the modules.</strong>
      </p>
    </div>
  </div>
);

export default MpeContainer;
