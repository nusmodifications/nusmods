import { Fragment, useCallback, useEffect, useState } from 'react';
import { connect } from 'react-redux';
import classnames from 'classnames';
import { isEqual } from 'lodash';

import { Mode, ThemeId } from 'types/settings';
import { Tracker } from 'types/vendor/piwik';
import { ModRegNotificationSettings } from 'types/reducers';
import { State as StoreState } from 'types/state';
import { RegPeriod, SCHEDULE_TYPES, ScheduleType } from 'config';

import availableThemes from 'data/themes.json';
import { selectTheme } from 'actions/theme';
import {
  dismissModregNotification,
  enableModRegNotification,
  selectFaculty,
  selectMode,
  setLoadDisqusManually,
  setModRegScheduleType,
  toggleBetaTesting,
  toggleModRegNotificationGlobally,
} from 'actions/settings';
import Timetable from 'views/timetable/Timetable';
import Title from 'views/components/Title';
import deferComponentRender from 'views/hocs/deferComponentRender';
import Online from 'views/components/Online';
import { supportsCSSVariables } from 'utils/css';
import { withTracker } from 'bootstrapping/matomo';
import ExternalLink from 'views/components/ExternalLink';
import Toggle from 'views/components/Toggle';
import ModRegNotification from 'views/components/notfications/ModRegNotification';
import { getModRegRoundKey, getRounds } from 'selectors/modreg';

import useScrollToTop from 'views/hooks/useScrollToTop';
import ThemeOption from './ThemeOption';
import ModeSelect from './ModeSelect';
import previewTimetable from './previewTimetable';
import BetaToggle from './BetaToggle';
import RefreshPrompt from './RefreshPrompt';
import styles from './SettingsContainer.scss';

type Props = {
  currentThemeId: string;
  mode: Mode;
  betaTester: boolean;
  loadDisqusManually: boolean;
  modRegNotification: ModRegNotificationSettings;

  selectTheme: (theme: ThemeId) => void;
  selectMode: (mode: Mode) => void;

  toggleBetaTesting: () => void;
  setLoadDisqusManually: (status: boolean) => void;

  setModRegScheduleType: (scheduleType: ScheduleType) => void;
  toggleModRegNotificationGlobally: (enabled: boolean) => void;
  enableModRegNotification: (round: RegPeriod) => void;
  dismissModregNotification: (round: RegPeriod) => void;
};

const SettingsContainer: React.FC<Props> = ({
  currentThemeId,
  mode,
  betaTester,
  loadDisqusManually,
  modRegNotification,
  ...props
}) => {
  const [allowTracking, setAllowTracking] = useState(true);

  const onToggleTracking = useCallback((isTrackingAllowed: boolean) => {
    withTracker((tracker: Tracker) => {
      if (isTrackingAllowed) {
        tracker.forgetUserOptOut();
      } else {
        tracker.optUserOut();
      }

      setAllowTracking(!tracker.isUserOptedOut());
    });
  }, []);

  useEffect(() => {
    withTracker((tracker: Tracker) => setAllowTracking(!tracker.isUserOptedOut()));
  }, [onToggleTracking]);

  const rounds = getRounds(modRegNotification);

  useScrollToTop();

  return (
    <div className={classnames(styles.settingsPage, 'page-container')}>
      <Title>Settings</Title>

      <Online>
        <RefreshPrompt />
      </Online>

      <h1 className={styles.title}>Settings</h1>
      <hr />

      {supportsCSSVariables() && (
        <div>
          <h4 id="night-mode">Night Mode</h4>
          <div className={styles.toggleRow}>
            <div className={styles.toggleDescription}>
              <p>
                Night mode turns the light surfaces of the page dark, creating an experience ideal
                for the dark. Try it out!
              </p>
              <p>
                Protip: Press <kbd>X</kbd> to toggle modes anywhere on NUSMods.
              </p>
            </div>
            <div className={styles.toggle}>
              <ModeSelect mode={mode} onSelectMode={props.selectMode} />
            </div>
          </div>
          <hr />
        </div>
      )}

      <h4 id="theme">Theme</h4>

      <p>Liven up your timetable with different color schemes!</p>
      <p>
        Protip: Press <kbd>Z</kbd>/<kbd>C</kbd> to cycle through the themes anywhere on NUSMods.
      </p>

      <div className={styles.preview}>
        <Timetable lessons={previewTimetable} customisedModules={[]} />
      </div>

      <div>
        {availableThemes.map((theme) => (
          <ThemeOption
            key={theme.id}
            className={styles.themeOption}
            theme={theme}
            isSelected={currentThemeId === theme.id}
            onSelectTheme={props.selectTheme}
          />
        ))}
      </div>

      <hr />

      <h4 id="modreg">CourseReg Reminder</h4>

      <div className={styles.notificationPreview}>
        <ModRegNotification dismissible />
      </div>

      <div className={styles.toggleRow}>
        <div className={styles.toggleDescription}>
          <p>
            You can get a reminder about when CourseReg rounds starts with a small notification.
          </p>
        </div>
        <div className={styles.toggle}>
          <Toggle
            isOn={modRegNotification.enabled}
            onChange={() => props.toggleModRegNotificationGlobally(!modRegNotification.enabled)}
          />
        </div>
      </div>

      {modRegNotification.enabled && (
        <>
          <div className="row">
            <div className="col-sm-12">
              <h5>Course Type</h5>
            </div>
            <div className="col-sm-8">
              <p>Choose your course type so we can show you the appropriate CourseReg schedule</p>
            </div>
            <div className="col-sm-4">
              <select
                className="form-control"
                onChange={(evt) => props.setModRegScheduleType(evt.target.value as ScheduleType)}
              >
                {SCHEDULE_TYPES.map((type) => (
                  <option value={type} key={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {rounds.map((round) => {
            const roundKey = getModRegRoundKey(round);
            const isSnoozed = modRegNotification.dismissed.find((dismissed) =>
              isEqual(dismissed, roundKey),
            );

            return (
              <Fragment key={round.type}>
                <h5>
                  {round.type} {round.name ? `(Round ${round.name})` : ''}
                </h5>
                <div className={styles.toggleRow}>
                  <div className={styles.toggleDescription}>
                    <p>
                      {isSnoozed
                        ? 'You have snoozed reminders until the end of this round'
                        : 'You can also temporarily snooze the notification until the end of this round.'}
                    </p>
                  </div>
                  <div className={classnames('col-sm-4 offset-sm-1', styles.toggle)}>
                    <button
                      className="btn btn-outline-primary"
                      type="button"
                      onClick={() =>
                        isSnoozed
                          ? props.enableModRegNotification(round)
                          : props.dismissModregNotification(round)
                      }
                    >
                      {isSnoozed ? 'Unsnooze' : 'Snooze'}
                    </button>
                  </div>
                </div>
              </Fragment>
            );
          })}
        </>
      )}

      <hr />

      <BetaToggle betaTester={betaTester} toggleStates={props.toggleBetaTesting} />

      <h4 id="privacy">Privacy</h4>

      <div className="row">
        <div className="col-md-8">
          <p>
            We collect anonymous, aggregated usage information on NUSMods - think of it as a survey
            to tells us which browsers to support and what features are popular. If you opt out, we
            could end up removing features that you use since we won&apos;t know if anyone is using
            them.
          </p>
          <p>
            We do not use this information for advertising, or share this information with anybody.
            You can see the data we collect at{' '}
            <ExternalLink href="https://analytics.nusmods.com/">analytics.nusmods.com</ExternalLink>
            .
          </p>
        </div>

        <div className="col-md-4">
          {navigator.doNotTrack === '1' ? (
            <div className="alert alert-warning">
              You have enabled{' '}
              <ExternalLink href="https://en.wikipedia.org/wiki/Do_Not_Track">
                do not track
              </ExternalLink>{' '}
              in your browser, so you will not be tracked until that option is disabled.
            </div>
          ) : (
            <div className="text-right">
              <Toggle
                labels={['Allow', 'Opt out']}
                isOn={allowTracking}
                onChange={onToggleTracking}
              />
            </div>
          )}
        </div>
      </div>

      <br />

      <div className="row">
        <div className="col-md-8">
          <p>
            We use Disqus for comments. Disqus may load its own tracking code which we cannot
            control. To improve privacy you may opt to load Disqus only when you wish to see or read
            the comments.
          </p>
        </div>
        <div className="col-md-4 text-right">
          <Toggle
            labels={['Load Manually', 'Always Load']}
            isOn={loadDisqusManually}
            onChange={props.setLoadDisqusManually}
          />
        </div>
      </div>
    </div>
  );
};

const mapStateToProps = (state: StoreState) => ({
  mode: state.settings.mode,
  currentThemeId: state.theme.id,
  betaTester: state.settings.beta || false,
  loadDisqusManually: state.settings.loadDisqusManually,
  modRegNotification: state.settings.modRegNotification,
});

const connectedSettings = connect(mapStateToProps, {
  selectTheme,
  selectFaculty,
  selectMode,
  toggleBetaTesting,
  setLoadDisqusManually,
  toggleModRegNotificationGlobally,
  dismissModregNotification,
  enableModRegNotification,
  setModRegScheduleType,
})(SettingsContainer);

export default deferComponentRender(connectedSettings);
