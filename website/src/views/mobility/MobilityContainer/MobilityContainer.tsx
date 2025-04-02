import { useState, useEffect, useMemo, useCallback } from 'react';
import classnames from 'classnames';
import { Link, useRouteMatch, match as Match, useHistory } from 'react-router-dom';

import { ArrowDownLeft, ArrowUpRight, ChevronLeft } from 'react-feather';
import useScrollToTop from 'views/hooks/useScrollToTop';

import LocationMap from 'views/components/bus-map/LocationMap';
import { getRouteSegments, getServiceStatus } from 'utils/mobility';
import NUSModerator from 'nusmoderator';
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

const BTCStops = ['CG', 'OTH', 'BG-MRT'];

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

  const busPeriod = useMemo(
    () =>
      acadWeekInfo.sem === 'Semester 1' || acadWeekInfo.sem === 'Semester 2' ? 'term' : 'vacation',
    [acadWeekInfo.sem],
  );

  const setFocusStopAndCampus = useCallback(
    (stop: string) => {
      if (campus === 'KRC' && BTCStops.includes(stop)) {
        setCampus('BTC');
      } else if (campus === 'BTC' && !BTCStops.includes(stop)) {
        setCampus('KRC');
      }
      // add a little delay so the map actually animates to the stop
      setTimeout(() => setFocusStop(stop), 100);
    },
    [campus, setCampus, setFocusStop],
  );

  useEffect(() => {
    setServiceStatus(getServiceStatus(busPeriod));
    const interval = setInterval(() => {
      setServiceStatus(getServiceStatus(busPeriod));
    }, 1000 * 60 * 0.25);
    return () => clearInterval(interval);
  }, [busPeriod]);

  useEffect(() => {
    window.scrollTo(0, 0);
    if (type === 'stop') {
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
  }, [type, slug, setFocusStopAndCampus]);

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
          <CampusToggleButton campus={campus} setCampus={setCampus} type={type} />
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
    </>
  );
};

export default MobilityContainer;

function CampusToggleButton({
  campus,
  setCampus,
  type,
}: {
  campus: 'KRC' | 'BTC';
  setCampus: (c: 'KRC' | 'BTC') => void;
  type?: 'service' | 'stop';
}) {
  if (type === 'stop' || type === 'service') return null;

  return (
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
  );
}
