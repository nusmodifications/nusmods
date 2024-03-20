/* eslint-disable no-underscore-dangle */
import { useState, useEffect, useMemo } from 'react';
import classnames from 'classnames';
import { Link, useRouteMatch, match as Match, useHistory } from 'react-router-dom';

import { ArrowDownLeft, ArrowUpRight, ChevronLeft } from 'react-feather';
import useScrollToTop from 'views/hooks/useScrollToTop';

import LocationMap from 'views/components/bus-map/LocationMap';
import NoFooter from 'views/layout/NoFooter';
import { set } from 'lodash';
import styles from './MobilityContainer.scss';
import ServiceDetails from '../ServiceDetails';
import ServiceList from '../ServiceList';
import StopDetails from '../StopDetails';

import isbServicesJSON from '../../../data/isb-services.json';

const isbServices = isbServicesJSON;

type Params = {
  type: 'service' | 'stop';
  slug: string;
};

const getPropsFromMatch = (match: Match<Params>) => ({
  type: match.params.type,
  slug: match.params.slug,
});

const getRouteSegments = (stops: string[], color: string) => {
  const routes = [];

  for (let i = 0; i < stops.length - 1; i++) {
    const thisStop = stops[i];
    const nextStop = stops[i + 1];
    routes.push({
      start: thisStop,
      end: nextStop,
      color,
    });
  }

  return routes;
};

const timeIsBefore = (a: Date, b: string) => {
  const parse = (x: string) => parseInt(x, 10);
  const ta = new Date(0, 0, 0, a.getHours(), a.getMinutes());
  const tb = new Date(0, 0, 0, ...b.split(':').map(parse));
  return ta < tb;
};

const isWithinBlock = (time: Date, block: ScheduleBlock) => {
  const { from, to } = block;
  return timeIsBefore(time, to) && !timeIsBefore(time, from);
};

export { isWithinBlock };

const getServiceStatus = (period: 'term' | 'vacation' = 'vacation') => {
  const time = new Date();
  // +12 hrs
  // time.setHours(time.getHours() + 8 + 24);
  const serviceStatuses: ServiceStatus[] = isbServices.map((service) => {
    const todaySchedule = service.schedule[period][time.getDay()];
    const currentBlock = todaySchedule.find((t) => isWithinBlock(time, t));
    if (currentBlock) {
      return {
        id: service.id,
        running: true,
        currentBlock,
      };
    }

    let nextBlock;
    let i = -1;

    while (!nextBlock && i < 7) {
      i += 1;
      // if this day has schedule
      if (service.schedule[period][(time.getDay() + i) % 7].length > 0) {
        [nextBlock] = service.schedule[period][(time.getDay() + i) % 7];
      }
    }

    if (nextBlock) {
      return {
        id: service.id,
        running: false,
        runningThisPeriod: true,
        nextDay: (time.getDay() + i) % 7,
        nextTime: nextBlock.from,
      };
    }
    return {
      id: service.id,
      running: false,
      runningThisPeriod: false,
    };
  });
  return serviceStatuses;
};

const MobilityContainer = () => {
  useScrollToTop();

  const history = useHistory();

  const match = useRouteMatch<Params>();
  const { type, slug } = getPropsFromMatch(match);
  const [focusStop, setFocusStop] = useState<string | null>(null);
  const [campus, setCampus] = useState<'KRC' | 'BTC'>('KRC');
  const [selectedService, setSelectedService] = useState<ISBService | null>(null);

  const [serviceStatus, setServiceStatus] = useState<ServiceStatus[]>([]);
  useEffect(() => {
    setServiceStatus(getServiceStatus());
    const interval = setInterval(() => {
      setServiceStatus(getServiceStatus());
    }, 1000 * 60 * 0.25);
    return () => clearInterval(interval);
  }, []);

  // window.scrollTo(0, 0); when type or slug changes
  useEffect(() => {
    window.scrollTo(0, 0);
    if (type === 'stop') {
      setFocusStop(slug);
    } else if (type === 'service') {
      const service = isbServices.find((s) => s.id === slug);
      if (service) {
        setSelectedService(service);
        setFocusStop(service.stops[0]);
      }
    } else if (type === undefined) {
      setSelectedService(null);
      setFocusStop(null);
    }
  }, [type, slug]);

  return (
    <>
      <div className={styles.pageContainer}>
        <LocationMap
          className={styles.map}
          position={[1.29631, 103.77237]}
          zoom={16}
          onStopClicked={(stop) => {
            if (!stop) return;

            // redirect to /stop/:stop with react router
            history.push(`/mobility/stop/${stop}`);
          }}
          campus={campus}
          focusStop={focusStop}
          setFocusStop={setFocusStop}
          {...(selectedService && {
            selectedSegments: getRouteSegments(selectedService.stops, selectedService.color),
            selectedStops: selectedService.stops.map((stop) => {
              const circular =
                selectedService.stops[0] === stop &&
                selectedService.stops[selectedService.stops.length - 1] === stop;
              let subtext;
              if (circular) {
                subtext = 'Start/End';
              } else if (selectedService.stops[0] === stop) {
                subtext = 'Start';
              } else if (selectedService.stops[selectedService.stops.length - 1] === stop) {
                subtext = 'End';
              }
              return {
                name: stop,
                color: selectedService.color,
                subtext,
              };
            }),
          })}
        >
          {/* switch campus button
           */}
          <button
            type="button"
            className={classnames('btn btn-primary', styles.switchCampusButton)}
            onClick={() => {
              setCampus(campus === 'KRC' ? 'BTC' : 'KRC');
            }}
          >
            {campus === 'KRC' ? (
              <>
                <ArrowUpRight />
                BTC
              </>
            ) : (
              <>
                <ArrowDownLeft />
                KRC
              </>
            )}
          </button>
        </LocationMap>
        <div className={styles.container}>
          {type && (
            <Link
              type="button"
              className={classnames('btn btn-link btn-svg', styles.backButton)}
              to="/mobility"
            >
              <ChevronLeft /> Back
            </Link>
          )}
          {type === undefined && <ServiceList serviceStatus={serviceStatus} />}
          {type === 'service' && <ServiceDetails service={slug} />}
          {type === 'stop' && <StopDetails stop={slug} setSelectedService={setSelectedService} />}
        </div>
      </div>
      <NoFooter />
    </>
  );
};

export default MobilityContainer;
