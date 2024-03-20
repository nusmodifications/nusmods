/* eslint-disable no-underscore-dangle */
import Title from 'views/components/Title';
import { Link } from 'react-router-dom';
import { Fragment, useEffect, useMemo, useState } from 'react';
import classNames from 'classnames';
import { ChevronDown, ChevronRight, ChevronUp, ExternalLink, MoreVertical } from 'react-feather';
import { current } from 'immer';
import isbServicesJSON from '../../data/isb-services.json';
import isbStopsJSON from '../../data/isb-stops.json';
import publicBusJSON from '../../data/public-bus.json';

import styles from './StopDetails.scss';

const isbServices = isbServicesJSON as ISBService[];
const isbStops = isbStopsJSON as ISBStop[];
const publicBus = publicBusJSON as Record<number, string>;

const baseURL = 'https://nusmods.com'; // TODO: wait until we have an api proxy

type Props = {
  stop: string;
  setSelectedService: (service: ISBService) => void;
};

const getArrivalTime = (eta: number) => {
  const date = new Date();
  date.setSeconds(date.getSeconds() + eta);
  return date;
};

const getShownArrivalTime = (eta: number, forceTime = false) => {
  const date = getArrivalTime(eta);
  if (!forceTime && eta < 60 * 60) {
    if (eta < 60) return 'Arriving';
    return `${Math.floor(eta / 60)} mins`;
  }
  return date.toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
    // time in SGT
    timeZone: 'Asia/Singapore',
  });
};

const getStopTimings = async (stop: string, setState: (state: ShuttleServiceResult) => void) => {
  if (!stop) return;
  const API_AUTH = ''; // TODO: wait until we have an api proxy
  try {
    const response = await fetch(`${baseURL}/ShuttleService?busstopname=${stop}`, {
      headers: {
        authorization: API_AUTH,
        accept: 'application/json',
      },
    });
    const data = await response.json();
    // console.log(data);
    setState(data.ShuttleServiceResult);
  } catch (e) {
    console.error(e);
  }
};

const getDepartAndArriveTiming = (timings = [] as NUSShuttle[], isEnd: boolean) => {
  if (isEnd) {
    const departTiming = timings.find((t) => t.busstopcode.endsWith('-S'));
    const arriveTiming = timings.find((t) => t.busstopcode.endsWith('-E')) || timings[0];
    return { departTiming, arriveTiming };
  }
  return { departTiming: timings[0], arriveTiming: undefined };
};

function ServiceStop(props: { stop: ISBStop; className?: string }) {
  const { stop } = props;
  return (
    <Link
      to={{
        pathname: `/mobility/stop/${stop.name}`,
      }}
      className={classNames(styles.stop, props.className)}
    >
      <span className={styles.stopSymbol} />
      {stop.LongName}
    </Link>
  );
}

function ServiceSchedule(props: { timing?: NUSShuttle; title: string }) {
  const { timing, title } = props;
  return (
    <div className={styles.serviceSchedule}>
      <h4 className={styles.header}>{title}</h4>
      {timing?._etas ? (
        <ol className={styles.upcomingBuses}>
          {timing._etas.map((eta) => (
            <li key={eta.eta_s} className={styles.upcomingBus}>
              <span className={styles.arrivingIn}>{getShownArrivalTime(eta.eta_s, true)}</span>
              <span className={styles.plate}>{eta.plate.slice(-3)}</span>
            </li>
          ))}
        </ol>
      ) : (
        <div className={classNames(styles.upcomingBuses, styles.none)}>No upcoming departures</div>
      )}
    </div>
  );
}

function StopServiceDetails(props: {
  service: ISBService;
  timings?: NUSShuttle[];
  currentStop: ISBStop;
  selectedService: string | null;
  setSelectedService: (service: string | null) => void;
}) {
  const [showPrevStops, setShowPrevStops] = useState(false);
  const [showAllNextStops, setShowAllNextStops] = useState(false);
  const { service, timings, currentStop, selectedService, setSelectedService } = props;

  const isStart = currentStop.name === service.stops[0];
  const isEnd = currentStop.name === service.stops[service.stops.length - 1];

  const { departTiming, arriveTiming } = useMemo(
    () => getDepartAndArriveTiming(timings, isEnd),
    [timings, isEnd],
  );

  const toggleSelectedService = useMemo(
    () => () => {
      if (selectedService === service.name) {
        setSelectedService(null);
      } else {
        setSelectedService(service.name);
      }
    },
    [selectedService, service.name, setSelectedService],
  );

  const nextBuses: string[] = [];
  if (departTiming?._etas && departTiming._etas.length > 0) {
    const nextBusEta = departTiming._etas[0].eta_s;
    const nextBusArrivalTime = getShownArrivalTime(nextBusEta);
    nextBuses.push(`${nextBusArrivalTime}`);

    if (departTiming._etas.length > 1) {
      const secondNextBusEta = departTiming._etas[1].eta_s;
      const secondNextBusArrivalTime = getShownArrivalTime(secondNextBusEta);
      nextBuses.push(`${secondNextBusArrivalTime}`);
    }
  }

  const lineStops = service.stops
    .map((stop) => {
      const stopDetails = isbStops.find((s) => s.name === stop);
      if (!stopDetails) return null;
      return stopDetails;
    })
    .filter(Boolean) as ISBStop[];

  const thisStopIndex = lineStops.findIndex((stop) => stop.name === currentStop.name);

  let circular = true;
  const termini = [lineStops[0]];
  if (termini[0].name !== lineStops[lineStops.length - 1].name) {
    // this service is not circular
    circular = false;
    termini.push(lineStops[lineStops.length - 1]);
  }

  const isTerminus = termini.some((terminus) => terminus.name === currentStop.name);

  const immediatePrevStops = lineStops.slice(
    Math.max(0, thisStopIndex - 1),
    Math.max(0, thisStopIndex),
  );
  const prevStops = lineStops.slice(0, Math.max(0, thisStopIndex - 1));
  const immediateNextStops = lineStops.slice(
    Math.min(thisStopIndex + 1, lineStops.length),
    Math.min(thisStopIndex + 4, lineStops.length),
  );
  const nextStops = lineStops
    .slice(Math.min(thisStopIndex + 4, lineStops.length), lineStops.length)
    .filter((stop) => termini.every((terminus) => stop.name !== terminus.name));

  return (
    <div
      className={styles.stopService}
      style={
        {
          '--color': service.color,
          '--color2': service.color2,
          '--color2--dark': service?.color2dark || '',
        } as React.CSSProperties
      }
    >
      <div
        className={styles.serviceHeader}
        onClick={toggleSelectedService}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter') toggleSelectedService();
        }}
      >
        <h3 className={styles.serviceName}>{service.name}</h3>
        <span className={styles.serviceNextBus}>
          {isEnd && !isStart ? (
            <span className={styles.serviceEnds}>No boarding</span>
          ) : (
            nextBuses.map((bus, i) => (
              <span key={`${bus} ${currentStop.name} ${i}`}>
                {i === 0 && nextBuses.length > 1 && nextBuses[1].includes('m')
                  ? bus.slice(0, -5)
                  : bus}
                {i !== nextBuses.length - 1 && ', '}
              </span>
            ))
          )}
        </span>
        {selectedService === service.name ? (
          <ChevronUp className={styles.serviceChevron} />
        ) : (
          <ChevronDown className={styles.serviceChevron} />
        )}
      </div>
      {selectedService === service.name && (
        <div className={styles.serviceDetails}>
          <div className={styles.serviceStops}>
            <ol className={styles.stops}>
              {prevStops.length > 0 && (
                <span
                  className={classNames(styles.showMore)}
                  onClick={() => setShowPrevStops(!showPrevStops)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') setShowPrevStops(!showPrevStops);
                  }}
                >
                  {showPrevStops ? (
                    <>
                      Hide previous stops <ChevronUp className={styles.chevron} />
                    </>
                  ) : (
                    <>
                      {prevStops.length} previous stop{prevStops.length > 1 ? 's' : ''}{' '}
                      <ChevronDown className={styles.chevron} />
                    </>
                  )}
                </span>
              )}
              {showPrevStops &&
                prevStops.map((stop, i) => (
                  <ServiceStop
                    key={stop.name}
                    stop={stop}
                    className={classNames(styles.minor, styles.passed, {
                      [styles.isFirst]: i === 0,
                      [styles.isTerminal]: stop.name === lineStops[0].name,
                    })}
                  />
                ))}
              {immediatePrevStops.map((stop) => (
                <ServiceStop
                  key={stop.name}
                  stop={stop}
                  className={classNames(styles.minor, styles.passed, styles.immediatePrev, {
                    [styles.isFirst]: !showPrevStops,
                    [styles.isTerminal]: stop.name === lineStops[0].name,
                  })}
                />
              ))}
              <ServiceStop
                stop={currentStop}
                className={classNames(styles.current, { [styles.isTerminal]: isTerminus })}
              />
              {immediateNextStops.map(
                (stop) =>
                  !termini.some((terminus) => stop.name === terminus.name) && (
                    <ServiceStop key={stop.name} stop={stop} className={classNames(styles.minor)} />
                  ),
              )}
              {showAllNextStops &&
                nextStops.map(
                  (stop, i) =>
                    !termini.some((terminus) => stop.name === terminus.name) && (
                      <ServiceStop
                        key={stop.name}
                        stop={stop}
                        className={classNames(styles.minor, {
                          [styles.isLast]: i === nextStops.length - 1,
                        })}
                      />
                    ),
                )}
              {nextStops.length > 0 && (
                <span
                  className={classNames(styles.showMore)}
                  onClick={() => setShowAllNextStops(!showAllNextStops)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') setShowAllNextStops(!showAllNextStops);
                  }}
                >
                  {showAllNextStops ? (
                    <>
                      Show fewer stops <ChevronUp className={styles.chevron} />
                    </>
                  ) : (
                    <>
                      {nextStops.length} more stop{nextStops.length > 1 ? 's' : ''}{' '}
                      <ChevronDown className={styles.chevron} />
                    </>
                  )}
                </span>
              )}
              {(circular || termini[1].name !== currentStop.name) && (
                <ServiceStop
                  stop={termini[1] || termini[0]}
                  className={classNames(styles.minor, styles.isTerminal)}
                />
              )}
            </ol>
          </div>
          {isEnd && !isStart && (
            <div className={classNames(styles.serviceEndNotice, 'text-muted')}>
              ※ Service {service.name} terminates here <br />
              All passengers must alight
            </div>
          )}
          <div className={styles.divider} />
          <div className={styles.serviceUpcoming}>
            {arriveTiming && <ServiceSchedule timing={arriveTiming} title="Arrivals" />}
            {departTiming && <ServiceSchedule timing={departTiming} title="Departures" />}
          </div>
        </div>
      )}
    </div>
  );
}

function PublicBusDetails(props: { service: PublicShuttle }) {
  const { service } = props;
  const nextBuses: string[] = [];
  if (service.arrivalTime) nextBuses.push(service.arrivalTime);
  if (service.nextArrivalTime) nextBuses.push(service.nextArrivalTime);
  return (
    <div
      className={classNames(styles.stopService, styles.publicBus)}
      style={
        {
          '--color': '#93d500',
        } as React.CSSProperties
      }
    >
      <div className={classNames(styles.serviceHeader)}>
        <h3 className={styles.serviceName}>{service.number}</h3>
        <span className={styles.serviceNextBus}>
          {nextBuses.length ? `${nextBuses.join(', ')} mins` : ''}
        </span>
        <a
          className={styles.extLink}
          href={`https://busrouter.sg/#/services/${service.number}`}
          target="_blank"
          rel="noreferrer"
        >
          <ExternalLink />
        </a>
      </div>
      {publicBus[service.number] && (
        <div className={classNames(styles.serviceDetails, 'text-muted')}>
          {publicBus[service.number]}
        </div>
      )}
    </div>
  );
}

function StopDetails(props: Props) {
  const { stop } = props;
  const setSelectedServiceMap = props.setSelectedService;
  const stopDetails = isbStops.find((s) => s.name === stop);
  const [selectedStopTiming, setSelectedStopTiming] = useState<ShuttleServiceResult | null>(null);
  const [selectedService, setSelectedService] = useState<string | null>(null);

  useEffect(() => {
    if (!stop) return;
    getStopTimings(stop, setSelectedStopTiming);
  }, [stop]);

  useEffect(() => {
    if (selectedService) {
      // console.log('selectedService', selectedService);
      setSelectedServiceMap(isbServices.find((s) => s.name === selectedService) || isbServices[0]);
    }
  }, [selectedService]);

  if (!stopDetails) return <div>Stop not found</div>;

  // console.log(selectedStopTiming);

  const { ShortName, LongName, shuttles } = stopDetails;
  const nusShuttles = shuttles
    .filter((shuttle) => shuttle.routeid)
    .filter(
      (shuttle, index, self) => index === self.findIndex((s) => s.routeid === shuttle.routeid),
    )
    .sort((a, b) => a.name.localeCompare(b.name));
  // console.log('shuttles', stopDetails);

  const incomingBuses: {
    service: ISBService;
    arrivingInSeconds: number;
    plate: string;
  }[] = [];
  nusShuttles.forEach((shuttle) => {
    const serviceDetail = isbServices.find((s) => s.id === shuttle.name.toLocaleLowerCase());
    if (!serviceDetail) return;
    const isEnd = stopDetails.name === serviceDetail.stops[serviceDetail.stops.length - 1];
    const serviceShuttles = selectedStopTiming?.shuttles.filter((s) => s.name === shuttle.name);
    const timings = getDepartAndArriveTiming(serviceShuttles, isEnd);
    const timing = timings.departTiming;

    timing?._etas?.forEach((eta) => {
      incomingBuses.push({
        service: serviceDetail,
        arrivingInSeconds: eta.eta_s,
        plate: eta.plate,
      });
    });
  });
  incomingBuses.sort((a, b) => a.arrivingInSeconds - b.arrivingInSeconds);
  incomingBuses.splice(4);
  const incomingBusGroups = incomingBuses.reduce((acc, bus) => {
    // above but avoid param-reassign error
    const shownTime = getShownArrivalTime(bus.arrivingInSeconds);
    // console.log('bus', bus, shownTime, bus.service.name);
    const newAcc = { ...acc };
    if (!newAcc[shownTime]) newAcc[shownTime] = [];
    newAcc[shownTime].push(bus);
    return newAcc;
  }, {} as Record<string, typeof incomingBuses>);
  // console.log('IBG', incomingBusGroups);

  const publicShuttles = shuttles
    .filter((shuttle) => shuttle.name.startsWith('PUB:'))
    .map(
      (shuttle) =>
        ({
          ...selectedStopTiming?.shuttles?.find((s) => s.name === shuttle.name),
          number: parseInt(shuttle.name.replace('PUB:', ''), 10),
        } as PublicShuttle),
    )
    .sort((a, b) => a.number - b.number);

  return (
    <div>
      <Title description={`NUS Internal Shuttle Bus ${LongName} Stop`}>{`${ShortName}`}</Title>
      <h1>{ShortName}</h1>
      {ShortName !== LongName && <h2 className={classNames('h3', styles.fullname)}>{LongName}</h2>}

      <div className={styles.incomingBusesWrapper}>
        <ol className={styles.incomingBuses}>
          {Object.entries(incomingBusGroups).length ? (
            Object.entries(incomingBusGroups).map(([time, buses], i) => (
              <Fragment key={`${time} ${stopDetails.name}`}>
                {i > 0 && <ChevronRight className={styles.chevron} />}
                <li className={styles.serviceWithChevron}>
                  <div className={classNames(styles.incomingBus)}>
                    <div className={styles.busNames}>
                      {buses.map((bus, j) => (
                        <span
                          className={styles.service}
                          style={
                            {
                              '--color': bus.service.color,
                            } as React.CSSProperties
                          }
                        >
                          {bus.service?.name}
                        </span>
                      ))}
                    </div>
                    <span className={styles.arrivingIn}>{time}</span>
                  </div>
                </li>
              </Fragment>
            ))
          ) : (
            <span className={classNames(styles.noIncoming, 'text-muted')}>
              No upcoming buses today
            </span>
          )}
        </ol>
      </div>

      {nusShuttles.map((shuttle) => {
        const service = isbServices.find((s) => s.id === shuttle.name.toLocaleLowerCase());
        const timings = selectedStopTiming?.shuttles.filter((s) => s.name === shuttle.name);
        if (!service) return <Fragment key={shuttle.name} />;
        return (
          <StopServiceDetails
            key={shuttle.name}
            service={service}
            timings={timings}
            currentStop={stopDetails}
            selectedService={selectedService}
            setSelectedService={setSelectedService}
          />
        );
      })}
      {publicShuttles.map((shuttle) => (
        <PublicBusDetails service={shuttle} />
      ))}
    </div>
  );
}

export default StopDetails;

// get the state of the light/dark mode of the page
