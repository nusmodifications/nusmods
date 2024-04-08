import Title from 'views/components/Title';
import { Link } from 'react-router-dom';
import classNames from 'classnames';
import ButtonGroupSelector from 'views/components/ButtonGroupSelector';
import { useMemo, useState } from 'react';
import { ChevronDown, ChevronUp } from 'react-feather';
import { isWithinBlock } from 'utils/mobility';
import isbServicesJSON from '../../data/isb-services.json';
import isbStopsJSON from '../../data/isb-stops.json';

import styles from './ServiceDetails.scss';

const isbServices = isbServicesJSON;
const isbStops = isbStopsJSON;

type Props = {
  service: string;
};

function ServiceSchedule({
  schedule,
  title,
  defaultExpand,
}: {
  schedule: ScheduleBlock[][];
  title: string;
  defaultExpand: boolean;
}) {
  const [expanded, setExpanded] = useState(defaultExpand);
  const currentDay = new Date().getDay() >= 1 && new Date().getDay() <= 5 ? 1 : new Date().getDay();
  const [selectedDay, setSelectedDay] = useState(currentDay);
  const scheduleForDay = useMemo(() => schedule[selectedDay], [schedule, selectedDay]);

  return (
    <div className={styles.schedule}>
      <div
        className={styles.scheduleHeader}
        onClick={() => setExpanded((e) => !e)}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter') setExpanded((ex) => !ex);
        }}
      >
        <h3 className={styles.scheduleTitle}>{title}</h3>

        {expanded ? (
          <ChevronUp className={styles.scheduleChevron} />
        ) : (
          <ChevronDown className={styles.scheduleChevron} />
        )}
      </div>
      {expanded && (
        <div className={styles.scheduleDetails}>
          <div className={classNames(styles.daySelector, 'form-group')}>
            <select
              id="day-selector"
              className="form-control"
              value={selectedDay}
              onChange={(e) => setSelectedDay(parseInt(e.target.value, 10))}
            >
              {/* for now theres no schedule for individual weekdays, so they're grouped up for convenience */}
              <option value="1">Weekdays</option>
              <option value="6">Saturday</option>
              <option value="0">Sunday & Public Holidays</option>
            </select>
          </div>
          <table className={classNames(styles.scheduleTable, 'table table-sm')}>
            <tbody>
              {scheduleForDay.map((block) => {
                const isNow = selectedDay === currentDay && isWithinBlock(new Date(), block);
                return (
                  <tr key={block.from} className={classNames({ [styles.now]: isNow })}>
                    <td className={styles.time}>{block.from}</td>
                    <td className={styles.timeSep}>–</td>
                    <td className={styles.time}>{block.to}</td>
                    <td className={styles.freq}>
                      <div className={styles.freqMins}>{block.interval[0]}</div>
                      {block.interval.length > 1 && (
                        <>
                          <div className={styles.freqMinsSep}>–</div>
                          <div className={styles.freqMins}>{block.interval[1]}</div>
                        </>
                      )}
                      <div className={styles.freqMinsLabel}>mins</div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function ServiceDetails(props: Props) {
  const [selectedTab, setSelectedTab] = useState<'Stops' | 'Schedule'>('Stops');
  const serviceDetails = useMemo(() => isbServices.find((s) => s.id === props.service), [props]);
  if (!serviceDetails) return <div>Service not found</div>;

  const { name, color, id } = serviceDetails;
  const stops = serviceDetails.stops
    .map((stop) => isbStops.find((s) => s.name === stop) || null)
    .filter((stop) => stop !== null) as ISBStop[];

  return (
    <div style={{ '--color': color } as React.CSSProperties}>
      <Title
        description={`NUS Internal Shuttle Bus Service ${name}`}
      >{`ISB Service ${name}`}</Title>
      <h1>Service {name}</h1>
      <div className={styles.tabber}>
        <ButtonGroupSelector
          choices={['Stops', 'Schedule']}
          selectedChoice={selectedTab}
          onChoiceSelect={(selected) => setSelectedTab(selected as 'Stops' | 'Schedule')}
        />
      </div>
      {selectedTab === 'Stops' && (
        <ol className={classNames(styles.stops, styles.collapseToTabber)}>
          {stops.map((stop, i) => (
            <li key={stop.name}>
              <Link
                to={{
                  pathname: `/mobility/stop/${stop.name}`,
                }}
                className={classNames(styles.stop, { [styles.isLast]: i === stops.length - 1 })}
              >
                <span
                  className={classNames(styles.stopSymbol, {
                    [styles.isTerminal]: (i === 0 || i === stops.length - 1) && id !== 'e',
                  })}
                />
                {stop?.LongName}
              </Link>
            </li>
          ))}
        </ol>
      )}
      {selectedTab === 'Schedule' && (
        <>
          <ServiceSchedule
            schedule={serviceDetails.schedule.term}
            title="Term"
            defaultExpand={false}
          />
          <ServiceSchedule
            schedule={serviceDetails.schedule.vacation}
            title="Vacation"
            defaultExpand
          />
        </>
      )}
    </div>
  );
}

export default ServiceDetails;
