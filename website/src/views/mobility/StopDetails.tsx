/* eslint-disable no-underscore-dangle */
import Title from 'views/components/Title';
import { Link } from 'react-router-dom';
import { Fragment, useEffect, useMemo, useState } from 'react';
import classNames from 'classnames';
import { ChevronDown, ChevronRight, ChevronUp, ExternalLink } from 'react-feather';
import { getDepartAndArriveTiming, getShownArrivalTime } from 'utils/mobility';
import { getStopTimings } from 'apis/nextbus-new';
import isbServicesJSON from '../../data/isb-services.json';
import isbStopsJSON from '../../data/isb-stops.json';
import publicBusJSON from '../../data/public-bus.json';

import styles from './StopDetails.scss';

const isbServices = isbServicesJSON as ISBService[];
const isbStops = isbStopsJSON as ISBStop[];
const publicBus = publicBusJSON as Record<number, string>;

type Props = {
  stop: string;
  setSelectedService: (service: ISBService) => void;
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
  timings?: NUSShuttle[] | string;
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

  const nextBuses: string[] = useMemo(() => {
    const buses: string[] = [];
    if (departTiming?._etas && departTiming._etas.length > 0) {
      const nextBusEta = departTiming._etas[0].eta_s;
      const nextBusArrivalTime = getShownArrivalTime(nextBusEta);
      buses.push(`${nextBusArrivalTime}`);

      if (departTiming._etas.length > 1) {
        const secondNextBusEta = departTiming._etas[1].eta_s;
        const secondNextBusArrivalTime = getShownArrivalTime(secondNextBusEta);
        buses.push(`${secondNextBusArrivalTime}`);
      }
    }
    return buses;
  }, [departTiming]);

  const lineStops = useMemo(
    () =>
      service.stops
        .map((stop) => {
          const stopDetails = isbStops.find((s) => s.name === stop);
          if (!stopDetails) return null;
          return stopDetails;
        })
        .filter(Boolean) as ISBStop[],
    [service.stops],
  );

  const thisStopIndex = useMemo(
    () => lineStops.findIndex((stop) => stop.name === currentStop.name),
    [lineStops, currentStop.name],
  );

  const { circular, termini, isTerminus } = useMemo(() => {
    let c = true;
    const t = [lineStops[0]];
    if (t[0].name !== lineStops[lineStops.length - 1].name) {
      c = false;
      t.push(lineStops[lineStops.length - 1]);
    }

    const i = t.some((terminus) => terminus.name === currentStop.name);

    return { circular: c, termini: t, isTerminus: i };
  }, [lineStops, currentStop.name]);

  const adjacentStops = useMemo(() => {
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

    return { immediatePrevStops, prevStops, immediateNextStops, nextStops };
  }, [lineStops, thisStopIndex, termini]);

  const { immediatePrevStops, prevStops, immediateNextStops, nextStops } = adjacentStops;

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
          {!departTiming && !arriveTiming ? (
            <div className={styles.serviceUpcomingError}>
              {timings === 'error' ? <>Error fetching bus timings</> : <>No upcoming departures</>}
            </div>
          ) : (
            <div className={styles.serviceUpcoming}>
              {arriveTiming && <ServiceSchedule timing={arriveTiming} title="Arrivals" />}
              {departTiming && <ServiceSchedule timing={departTiming} title="Departures" />}
            </div>
          )}
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
  const [selectedStopTiming, setSelectedStopTiming] = useState<
    ShuttleServiceResult | 'error' | 'loading'
  >('loading');
  const [selectedService, setSelectedService] = useState<string | null>(null);

  useEffect(() => {
    if (!stop) return;
    setSelectedStopTiming('loading');
    getStopTimings(
      stop,
      (data) => {
        setSelectedStopTiming(data);
      },
      () => {
        // TODO: Surface the error.
        // console.error(error);
        setSelectedStopTiming('error');
      },
    );
  }, [stop]);

  useEffect(() => {
    if (selectedService) {
      setSelectedServiceMap(isbServices.find((s) => s.name === selectedService) || isbServices[0]);
    }
  }, [selectedService, setSelectedServiceMap]);

  const incoming = useMemo(() => {
    if (stopDetails === undefined) return null;

    const nusShuttles = stopDetails.shuttles
      .filter((shuttle) => shuttle.routeid)
      .filter(
        (shuttle, index, self) => index === self.findIndex((s) => s.routeid === shuttle.routeid),
      )
      .sort((a, b) => a.name.localeCompare(b.name));

    if (selectedStopTiming === 'loading' || selectedStopTiming === 'error') {
      return {
        services: nusShuttles,
        buses: [],
        buses_grouped: [],
      };
    }

    const incomingBuses: {
      service: ISBService;
      arrivingInSeconds: number;
      plate: string;
    }[] = [];
    nusShuttles.forEach((shuttle) => {
      const serviceDetail = isbServices.find((s) => s.id === shuttle.name.toLocaleLowerCase());
      if (!serviceDetail) return;
      const isEnd = stopDetails.name === serviceDetail.stops[serviceDetail.stops.length - 1];
      const serviceShuttles = selectedStopTiming?.shuttles.filter(
        (s) => s.name === shuttle.name,
      ) as NUSShuttle[];
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
      const shownTime = getShownArrivalTime(bus.arrivingInSeconds);
      const newAcc = { ...acc };
      if (!newAcc[shownTime]) newAcc[shownTime] = [];
      newAcc[shownTime].push(bus);
      return newAcc;
    }, {} as Record<string, typeof incomingBuses>);

    return {
      services: nusShuttles,
      buses: incomingBuses,
      buses_grouped: incomingBusGroups,
    };
  }, [selectedStopTiming, stopDetails]);

  const incomingPublic = useMemo(() => {
    if (stopDetails === undefined) return null;
    const { shuttles } = stopDetails;

    return shuttles
      .filter((shuttle) => shuttle.name.startsWith('PUB:'))
      .map((shuttle) => {
        let st = {
          number: parseInt(shuttle.name.replace('PUB:', ''), 10),
        } as PublicShuttle;
        if (selectedStopTiming !== 'loading' && selectedStopTiming !== 'error') {
          st = {
            ...selectedStopTiming?.shuttles?.find((s) => s.name === shuttle.name),
            number: parseInt(shuttle.name.replace('PUB:', ''), 10),
          } as PublicShuttle;
        }
        return st;
      })
      .sort((a, b) => a.number - b.number);
  }, [selectedStopTiming, stopDetails]);

  if (!stopDetails || !incoming || !incomingPublic) return <div>Stop not found</div>;

  const { ShortName, LongName } = stopDetails;

  const subtitle = [];
  if (ShortName !== LongName) {
    subtitle.push(<span>{LongName}</span>);
  }

  if (stopDetails.opposite) {
    const oppositeStop = isbStops.find((s) => s.name === stopDetails.opposite);
    const oppositeStopName = oppositeStop?.ShortName || stopDetails.opposite;
    subtitle.push(
      <span>
        {(oppositeStopName.startsWith('Opp') && oppositeStopName.endsWith(ShortName)) ||
        (ShortName.startsWith('Opp') && oppositeStopName.endsWith(ShortName.replace('Opp ', '')))
          ? ''
          : 'Opp: '}{' '}
        <Link to={`/mobility/stop/${stopDetails.opposite}`}>{oppositeStopName}</Link>
      </span>,
    );
  }

  return (
    <div className={styles.stopDetails}>
      <Title description={`NUS Internal Shuttle Bus ${LongName} Stop`}>{`${ShortName}`}</Title>
      <h1>{ShortName}</h1>
      <p>
        {subtitle.map((s, i) => (
          <Fragment key={i}>
            {i > 0 && ' • '}
            {s}
          </Fragment>
        ))}
      </p>

      <div className={styles.incomingBusesWrapper}>
        <ol className={styles.incomingBuses}>
          {Object.entries(incoming.buses_grouped).length ? (
            Object.entries(incoming.buses_grouped).map(([time, buses], i) => (
              <Fragment key={`${time} ${stopDetails.name}`}>
                {i > 0 && <ChevronRight className={styles.chevron} />}
                <li className={styles.serviceWithChevron}>
                  <div className={classNames(styles.incomingBus)}>
                    <div className={styles.busNames}>
                      {buses.map((bus) => (
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
              {selectedStopTiming === 'error'
                ? 'Error fetching bus timings'
                : 'No upcoming buses today'}
            </span>
          )}
        </ol>
      </div>

      {incoming.services.map((shuttle) => {
        const service = isbServices.find((s) => s.id === shuttle.name.toLocaleLowerCase());
        let timings;
        if (selectedStopTiming === 'loading') {
          timings = 'loading';
        } else if (selectedStopTiming === 'error') {
          timings = 'error';
        } else {
          timings = selectedStopTiming?.shuttles.filter(
            (s) => s.name === shuttle.name,
          ) as NUSShuttle[];
        }
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
      {incomingPublic.map((shuttle) => (
        <PublicBusDetails service={shuttle} />
      ))}
    </div>
  );
}

export default StopDetails;
