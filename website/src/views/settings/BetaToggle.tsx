import { memo } from 'react';
import Toggle from 'views/components/Toggle';
import ExternalLink from 'views/components/ExternalLink';
import config from 'config';
import styles from './SettingsContainer.scss';

export const currentTests = [];

type Props = {
  betaTester: boolean;
  toggleStates: () => void;
};

const BetaToggle = memo<Props>((props) => {
  const { betaTester, toggleStates } = props;
  const hasTests = currentTests.length > 0;

  // If the user isn't a beta tester already and there are no tests, then
  // there's no need to show them anything
  if (!betaTester && !hasTests) {
    return null;
  }

  const testDescriptions = hasTests ? (
    <>
      <h5>Current tests</h5>
      <ul>
        {currentTests.map((test) => (
          <li key={test}>{test}</li>
        ))}
      </ul>
    </>
  ) : (
    <p>There are currently no tests</p>
  );

  return (
    <div>
      <h4 id="beta">NUSMods Beta</h4>

      <div className={styles.toggleRow}>
        <div className={styles.toggleDescription}>
          <p>Help us improve NUSMods by testing new features and providing feedback.</p>
          {testDescriptions}
        </div>

        <div className={styles.toggle}>
          <Toggle className={styles.betaToggle} isOn={betaTester} onChange={toggleStates} />
          {betaTester && hasTests && (
            <ExternalLink className="btn btn-success" href={config.contact.messenger}>
              Leave Feedback
            </ExternalLink>
          )}
        </div>
      </div>

      <hr />
    </div>
  );
});

export default BetaToggle;
