import { useState } from 'react';
import { useSelector } from 'react-redux';
import classnames from 'classnames';
import { AlertTriangle, CheckCircle, ChevronDown, ChevronUp } from 'react-feather';

import { ProgrammeFulfilment, RequirementFulfilment } from 'types/programmes';
import { getProgrammeFulfilments } from 'selectors/planner';
import { programmeTypeLabels } from 'utils/programmes';
import LinkModuleCodes from 'views/components/LinkModuleCodes';
import styles from './PlannerProgrammes.scss';

type RequirementProps = {
  readonly fulfilment: RequirementFulfilment;
};

const ProgrammeRequirementRow: React.FC<RequirementProps> = ({ fulfilment }) => {
  const { requirement, assignedModules, fulfilledMCs, satisfied } = fulfilment;
  const isElectivePool = requirement.minModules == null && requirement.minMCs == null;

  // Elective pools only matter once they have modules counting towards them
  if (isElectivePool && assignedModules.length === 0) return null;

  const targets = [];
  if (requirement.minModules) {
    targets.push(
      `${Math.min(assignedModules.length, requirement.minModules)}/${
        requirement.minModules
      } courses`,
    );
  }
  if (requirement.minMCs) {
    targets.push(`${Math.min(fulfilledMCs, requirement.minMCs)}/${requirement.minMCs} units`);
  }

  const ratios = [
    requirement.minModules ? assignedModules.length / requirement.minModules : null,
    requirement.minMCs ? fulfilledMCs / requirement.minMCs : null,
  ].filter((ratio): ratio is number => ratio != null);
  const progress = ratios.length > 0 ? Math.min(1, ...ratios) : 1;

  return (
    <div className={styles.requirement}>
      <div className={styles.requirementHeader}>
        <h4>{requirement.name}</h4>
        {targets.length > 0 && <span className={styles.progressLabel}>{targets.join(', ')}</span>}
      </div>

      {!isElectivePool && (
        <div className={classnames('progress', styles.progress)}>
          <div
            className={classnames(
              'progress-bar',
              satisfied ? styles.barSatisfied : styles.barUnsatisfied,
            )}
            role="progressbar"
            style={{ width: `${progress * 100}%` }}
            aria-valuenow={Math.round(progress * 100)}
            aria-valuemin={0}
            aria-valuemax={100}
          />
        </div>
      )}

      {assignedModules.length > 0 && (
        <p className={styles.assignedModules}>
          <LinkModuleCodes>{assignedModules.join(', ')}</LinkModuleCodes>
        </p>
      )}
      {requirement.description && <p className={styles.description}>{requirement.description}</p>}
    </div>
  );
};

type ProgrammeProps = {
  readonly fulfilment: ProgrammeFulfilment;
};

const ProgrammeCard: React.FC<ProgrammeProps> = ({ fulfilment }) => {
  const { programme, requirements, totalMCs, satisfied } = fulfilment;
  const [expanded, setExpanded] = useState(true);

  return (
    <div className={styles.programme}>
      <button
        type="button"
        className={styles.programmeHeader}
        onClick={() => setExpanded(!expanded)}
      >
        {satisfied ? (
          <CheckCircle className={classnames(styles.statusIcon, styles.satisfied)} />
        ) : (
          <AlertTriangle className={classnames(styles.statusIcon, styles.unsatisfied)} />
        )}
        <h3 className={styles.programmeName}>{programme.name}</h3>
        <span className="badge badge-secondary">{programmeTypeLabels[programme.type]}</span>
        <span className={styles.programmeMCs}>
          {totalMCs}
          {programme.totalMCs != null && `/${programme.totalMCs}`} units
        </span>
        {expanded ? <ChevronUp /> : <ChevronDown />}
      </button>

      {expanded && (
        <div className={styles.requirements}>
          {requirements.map((requirement) => (
            <ProgrammeRequirementRow key={requirement.requirement.id} fulfilment={requirement} />
          ))}
        </div>
      )}
    </div>
  );
};

/**
 * Shows progress towards the specialisations, focus areas and minors selected
 * in the planner settings
 */
const PlannerProgrammes: React.FC = () => {
  const fulfilments = useSelector(getProgrammeFulfilments);

  if (fulfilments.length === 0) return null;

  return (
    <section className={styles.programmes}>
      {fulfilments.map((fulfilment) => (
        <ProgrammeCard key={fulfilment.programme.id} fulfilment={fulfilment} />
      ))}
    </section>
  );
};

export default PlannerProgrammes;
