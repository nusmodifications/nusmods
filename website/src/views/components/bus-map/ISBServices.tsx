import { useEffect, useMemo, useState } from 'react';
import { DivIcon, LatLngBoundsExpression } from 'leaflet';
import { Marker, SVGOverlay, useMapEvents } from 'react-leaflet';
import classnames from 'classnames';

import isbStopJson from 'data/isb-stops.json';
import isbServicesJSON from 'data/isb-services.json';
import { getRouteSegments, segmentsToClasses } from 'utils/mobility';
import styles from './ISBServices.scss';

// these eslint warnings are disabled because we're doing some convoluted svg importing as react components :,)
// SHOULD be changed into using polyline instead, as that's the correct way to do it
// but i am but a stupid graphic designer who knows how to use illustrator and not how to use GIS software

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import KRC from './routes/KRC.svg?svgr';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import BTC from './routes/BTC.svg?svgr';

const BTCStops = ['CG', 'OTH', 'BG-MRT'];

type Props =
  | {
      mapMode: 'all';
      onStopClicked: (stop: string | null) => void;
      focusStop: string | null;
      campus: 'KRC' | 'BTC';
    }
  | {
      mapMode: 'selected';
      selectedSegments: {
        start: string;
        end: string;
        color: string;
      }[];
      selectedStops: {
        name: string;
        color: string;
      }[];
      onStopClicked: (stop: string | null) => void;
      focusStop: string | null;
      campus: 'KRC' | 'BTC';
    };

const KRCBounds: LatLngBoundsExpression = [
  [1.2895613206953571, 103.76316305148976],
  [1.3124787799888964, 103.80900978943075],
];
const BTCBounds: LatLngBoundsExpression = [
  [1.3059855198252486, 103.79309078105972],
  [1.3289028289795464, 103.83893751900072],
];

const isbServices = isbServicesJSON;

export default function ISBStops(props: Props) {
  const { mapMode } = props;
  const [currentZoom, setCurrentZoom] = useState(0);
  const [currentFocusStop, setCurrentFocusStop] = useState<string | null>(null);

  useEffect(() => {
    setCurrentFocusStop(props.focusStop);
  }, [props.focusStop]);

  const map = useMapEvents({
    zoom: () => {
      setCurrentZoom(map.getZoom());
    },
  });

  const selection = useMemo(() => {
    let selectedSegments: { classes: string[]; color: string }[] = [];
    let selectedStops: { name: string; color: string; subtext?: string }[] = [];
    if (props.mapMode === 'selected') {
      selectedSegments = segmentsToClasses(props.selectedSegments);
      selectedStops = props.selectedStops;
    } else if (props.mapMode === 'all' && currentFocusStop) {
      const currentFocusStopDetails = isbStopJson.find((stop) => stop.name === currentFocusStop);
      if (currentFocusStopDetails) {
        const passingServices = currentFocusStopDetails.shuttles
          .map((service) => {
            const serviceDetails = isbServices.find((s) => s.name === service.name);
            if (!serviceDetails) return null;
            return serviceDetails;
          })
          .filter(Boolean) as (typeof isbServices)[number][];
        passingServices.forEach((service) => {
          selectedSegments = selectedSegments.concat(
            segmentsToClasses(getRouteSegments(service.stops, '#3087d8')),
          );
        });
      }
    }
    return { selectedSegments, selectedStops };
  }, [props, currentFocusStop]);

  const { selectedSegments, selectedStops } = selection;

  return (
    <>
      {isbStopJson.map((stop) => {
        const collapsedStop = currentZoom <= (stop?.collapse || 0);
        if (mapMode === 'all' && collapsedStop && stop?.collapseBehavior === 'hide') {
          return null;
        }

        if (
          (props.campus === 'KRC' && BTCStops.includes(stop.name)) ||
          (props.campus === 'BTC' && !BTCStops.includes(stop.name))
        ) {
          return null;
        }

        let hasPairAndIsTheOpposite = false;
        let displayType: 'normal' | 'interchange' | 'no-label' | 'hidden' = 'normal';
        let subtext = '';
        switch (mapMode) {
          case 'all':
            if (collapsedStop && stop?.collapseBehavior === 'hide') {
              displayType = 'hidden';
            } else if (collapsedStop && stop?.collapseBehavior === 'interchange') {
              displayType = 'interchange';
            }
            if (stop?.collapseLabel && currentZoom <= stop.collapseLabel) {
              displayType = 'no-label';
            }
            break;
          case 'selected':
            if (!selectedStops.map((stops) => stops.name).includes(stop.name)) {
              displayType = 'hidden';
            } else {
              subtext = selectedStops.find((stops) => stops.name === stop.name)?.subtext || '';
              if (
                selectedStops.map((stops) => stops.name).includes(stop.name) &&
                selectedStops.map((stops) => stops.name).includes(stop.collapsePair || '')
              ) {
                if (collapsedStop && stop?.collapseBehavior === 'hide') {
                  displayType = 'hidden';
                } else if (collapsedStop && stop?.collapseBehavior === 'interchange') {
                  displayType = 'interchange';
                }
              } else if (
                stop.collapsePair && // has a pair
                stop.collapseBehavior === 'hide' // pair is the other pair
              ) {
                hasPairAndIsTheOpposite = true;
              }
            }
            break;
          default:
            break;
        }

        if (displayType === 'hidden') {
          return null;
        }

        // The hit area is an invisible circle that covers the original
        // OSM bus stop so that it is clickable
        const hitAreaClass = classnames(styles.hitArea);

        const stopIconClass = classnames(
          styles.stopIcon,
          displayType === 'interchange' && styles.interchange,
          mapMode === 'all' && styles.allRoutes,
        );

        const isLeft = hasPairAndIsTheOpposite ? !stop.leftLabel : stop.leftLabel;
        const isFocused = currentFocusStop === stop.name;

        // Routes are displayed to the left or right of the hit area
        const routeWrapperClass = classnames(
          styles.routeWrapper,
          isLeft && styles.left,
          isFocused && styles.focused,
        );

        const routeNameClass = classnames(styles.stopName);

        const subtextHTML = subtext ? `<div class="${styles.subtext}">${subtext}</div>` : '';

        const dedupedShuttles = stop.shuttles.filter(
          (service, i, arr) => arr.findIndex((s) => s.name === service.name) === i,
        );

        const services = dedupedShuttles
          .map((service) => {
            const serviceDetails = isbServices.find((s) => s.name === service.name);
            if (!serviceDetails) return null;
            return serviceDetails;
          })
          .filter(Boolean) as (typeof isbServices)[number][];
        const servicesHTML =
          mapMode === 'all' && isFocused
            ? `<div class="${styles.stopServicesList}">${services
                .map((service) => {
                  const serviceDetails = isbServices.find((s) => s.name === service.name);
                  if (!serviceDetails) return null;
                  return `<div class="${styles.stopService}" style="--svc-color:${serviceDetails.color}">${serviceDetails.name}</div>`;
                })
                .join('')}</div>`
            : '';

        // for the love of god if anyone knows a better way that defining RAW HTML
        const icon = new DivIcon({
          // language=HTML
          html: `
              <div
                class="${hitAreaClass}"
              ></div>

              <div
                data-code="${stop.name}"
                class="${stopIconClass}"
              ></div>

             ${
               displayType !== 'no-label'
                 ? `<div class="${routeWrapperClass}">
                <div class="${routeNameClass} ${isFocused ? styles.focused : ''}">${
                     stop.ShortName
                   }</div>${subtextHTML}${servicesHTML}
                </div>`
                 : ''
             }`,
          className: styles.iconWrapper,
          iconSize: [30, 30],
        });

        return (
          <Marker
            key={stop.name}
            icon={icon}
            position={[stop.latitude, stop.longitude]}
            eventHandlers={{
              click: () => {
                if (props.onStopClicked) {
                  props.onStopClicked(stop.name);
                  map.flyTo([stop.latitude, stop.longitude], 16);
                }
              },
            }}
          />
        );
      })}

      <style>
        {selectedSegments
          .map((route) =>
            route.classes
              .map(
                (className) => `.leaflet-overlay-pane .overlay_fg ${className} path {
            color: ${route.color};
            stroke-opacity: 1;
          }`,
              )
              .join(' '),
          )
          .join(' ')}

        {selectedSegments
          .map((route) =>
            route.classes
              .map(
                (
                  className,
                ) => `.leaflet-overlay-pane .overlay_fg [class*="stroke"]${className} path {

            stroke-opacity: 1;
          }`,
              )
              .join(''),
          )
          .join(' ')}
      </style>
      <style>
        {selectedStops
          .map(
            (stop) => `.${styles.stopIcon}[data-code="${stop.name}"] {
        background-color: ${stop.color};
      }`,
          )
          .join(' ')}
      </style>

      {/* background (lines' stroke) */}
      <SVGOverlay bounds={KRCBounds} className="overlay_bg">
        <KRC className={mapMode === 'all' && !currentFocusStop ? 'allRoutes' : ''} />
      </SVGOverlay>

      <SVGOverlay bounds={BTCBounds} className="overlay_bg">
        <BTC className={mapMode === 'all' && !currentFocusStop ? 'allRoutes' : ''} />
      </SVGOverlay>

      {/* foreground (lines fill) */}
      <SVGOverlay bounds={KRCBounds} className="overlay_fg">
        <KRC className={mapMode === 'all' && !currentFocusStop ? 'allRoutes' : ''} />
      </SVGOverlay>

      <SVGOverlay bounds={BTCBounds} className="overlay_fg">
        <BTC className={mapMode === 'all' && !currentFocusStop ? 'allRoutes' : ''} />
      </SVGOverlay>
    </>
  );
}
