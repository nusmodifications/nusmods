/* eslint-disable no-underscore-dangle */
import { useState, useEffect, useMemo } from 'react';
import classnames from 'classnames';
import { Link, useRouteMatch, match as Match, useHistory } from 'react-router-dom';

import { ArrowDownLeft, ArrowUpRight, ChevronLeft } from 'react-feather';
import useScrollToTop from 'views/hooks/useScrollToTop';

import LocationMap from 'views/components/bus-map/LocationMap';
import NoFooter from 'views/layout/NoFooter';
import { getRouteSegments, getServiceStatus } from 'utils/mobility';
import NUSModerator from 'nusmoderator';
import { setTime } from 'utils/timify';
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

const BTCStops = [
  // college green, oth bldg, and bg mrt
  'CG',
  'OTH',
  'BG-MRT',
];

const MobilityContainer = () => {
  useScrollToTop();

  const history = useHistory();

  const match = useRouteMatch<Params>();
  const { type, slug } = getPropsFromMatch(match);
  const [focusStop, setFocusStop] = useState<string | null>(null);
  const [campus, setCampus] = useState<'KRC' | 'BTC'>('KRC');
  const [selectedService, setSelectedService] = useState<ISBService | null>(null);

  const [serviceStatus, setServiceStatus] = useState<ServiceStatus[]>([]);

  const acadWeekInfo = NUSModerator.academicCalendar.getAcadWeekInfo(new Date());
  const busPeriod =
    acadWeekInfo.sem === 'Semester 1' || acadWeekInfo.sem === 'Semester 2' ? 'term' : 'vacation';
  useEffect(() => {
    setServiceStatus(getServiceStatus(busPeriod));
    const interval = setInterval(() => {
      setServiceStatus(getServiceStatus(busPeriod));
    }, 1000 * 60 * 0.25);
    return () => clearInterval(interval);
  }, []);

  const setFocusStopAndCampus = (stop: string) => {
    if (campus === 'KRC' && BTCStops.includes(stop)) {
      setCampus('BTC');
    } else if (campus === 'BTC' && !BTCStops.includes(stop)) {
      setCampus('KRC');
    }
    setTimeout(() => setFocusStop(stop), 100);
    // setFocusStop(stop);
  };

  // window.scrollTo(0, 0); when type or slug changes
  useEffect(() => {
    window.scrollTo(0, 0);
    if (type === 'stop') {
      console.log('A');
      setFocusStopAndCampus(slug);
    } else if (type === 'service') {
      const service = isbServices.find((s) => s.id === slug);
      if (service) {
        setSelectedService(service);
        setFocusStopAndCampus(service.stops[0]);
      }
    } else if (type === undefined) {
      setSelectedService(null);
      setFocusStop(null);
    }
  }, [type, slug]);

  // // if focusStop is in different campus, switch campus
  // useEffect(() => {
  //   if (focusStop && campus === 'KRC' && BTCStops.includes(focusStop)) {
  //     setCampus('BTC');
  //   } else if (focusStop && campus === 'BTC' && !BTCStops.includes(focusStop)) {
  //     setCampus('KRC');
  //   }
  // }, [focusStop, campus]);

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
