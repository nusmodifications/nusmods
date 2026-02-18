import Title from 'views/components/Title';
import { Link } from 'react-router-dom';
import classNames from 'classnames';
import { AlertTriangle, ArrowRight, Circle, Pause, RotateCcw } from 'react-feather';
import isbServicesJSON from '../../data/isb-services.json';
import isbStopsJSON from '../../data/isb-stops.json';

import styles from './ServiceList.scss';

const isbServices = isbServicesJSON;
const isbStops = isbStopsJSON;

type Props = {
  serviceStatus: ServiceStatus[];
};

const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

function StatusDisplay(props: { status?: ServiceStatus }) {
  const status = props.status || { running: false, runningThisPeriod: false };
  if (status.running) {
    return (
      <>
        <Circle size={12} className={classNames(styles.statusIcon, styles.normal)} />
        <span className={styles.statusText}>
          Every {status.currentBlock.interval.join('–')} minutes
        </span>
      </>
    );
  }
  if (status.runningThisPeriod) {
    return (
      <>
        <Pause size={12} className={classNames(styles.statusIcon, styles.paused)} />
        <span className={styles.statusText}>
          Resumes {status.nextDay === new Date().getDay() ? '' : daysOfWeek[status.nextDay]}{' '}
          {status.nextTime}
        </span>
      </>
    );
  }
  return (
    <>
      <AlertTriangle size={12} className={classNames(styles.statusIcon, styles.stopped)} />
      <span className={styles.statusText}>Vacation break</span>
    </>
  );
}

function ServiceDetails({ serviceStatus }: Props) {
  return (
    <div>
      <Title description="NUS Internal Shuttle Bus Services">ISB Services</Title>
      <h1>ISB Services</h1>
      <ol className={styles.serviceList}>
        {isbServices.map((service) => {
          const start = isbStops.find((s) => s.name === service.stops[0])?.ShortName;
          const end = isbStops.find(
            (s) => s.name === service.stops[service.stops.length - 1],
          )?.ShortName;
          const mid = isbStops.find(
            (s) => s.name === service.stops[Math.floor(service.stops.length / 2)],
          )?.ShortName;
          let circular = false;
          if (start === end) {
            circular = true;
          }

          const status: ServiceStatus = serviceStatus.find((s) => s.id === service.id) || {
            id: '0',
            running: false,
            runningThisPeriod: false,
          };

          return (
            <li
              key={service.id}
              style={
                {
                  '--color': service.color,
                  '--color2': service.color2,
                  '--color2--dark': service.color2dark,
                } as React.CSSProperties
              }
            >
              <Link
                className={classNames(styles.serviceItem, {
                  [styles.inactive]: !status.running,
                })}
                to={{
                  pathname: `/mobility/service/${service.id}`,
                }}
              >
                <h2 className={classNames(styles.name)}>
                  <span>{service.name}</span>
                </h2>
                <p className={styles.description}>
                  <p className={styles.terminals}>
                    {circular ? (
                      <>
                        {start}
                        <RotateCcw size={16} className={styles.arrow} />
                        {mid}
                      </>
                    ) : (
                      <>
                        {start}
                        <ArrowRight size={16} className={styles.arrow} />
                        {mid}
                        <ArrowRight size={16} className={styles.arrow} />
                        {end}
                      </>
                    )}
                  </p>
                  <p className={classNames(styles.notable, 'text-muted')}>
                    via{' '}
                    {service.notableStops.map((stop, i) => {
                      const stopDetails = isbStops.find((s) => s.name === stop);
                      if (!stopDetails) return null;
                      return (
                        <span key={stopDetails.name} className={styles.stop}>
                          {i ? ' · ' : ''}
                          {stopDetails.ShortName}
                        </span>
                      );
                    })}
                  </p>
                  <p
                    className={classNames(styles.status, {
                      [styles.running]: status.running,
                      [styles.paused]: !status.running && status.runningThisPeriod,
                      [styles.stopped]: !status.running && !status.runningThisPeriod,
                    })}
                  >
                    <StatusDisplay status={status} />
                  </p>
                </p>
              </Link>
            </li>
          );
        })}
      </ol>
    </div>
  );
}

export default ServiceDetails;
