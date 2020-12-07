import { FC, useCallback, useState } from 'react';
import classnames from 'classnames';

import { VenueLocation } from 'types/venues';
import Modal from 'views/components/Modal';
import CloseButton from 'views/components/CloseButton';
import ExternalLink from 'views/components/ExternalLink';
import { MapPin, Map as MapIcon } from 'react-feather';

import ImproveVenueForm from './ImproveVenueForm';
import styles from './VenueLocation.scss';

type Page = 'menu' | 'form';

type Props = {
  readonly venue: string;
  readonly isOpen: boolean;
  readonly onRequestClose: () => void;
  readonly existingLocation: VenueLocation | null;
};

const FeedbackModal: FC<Props> = ({ venue, isOpen, onRequestClose, existingLocation }) => {
  const [page, setPage] = useState<Page>('menu');

  const handleRequestClose = useCallback(() => {
    setPage('menu');
    onRequestClose();
  }, [onRequestClose]);

  const goToForm = useCallback(() => setPage('form'), []);
  const goToMenu = useCallback(() => setPage('menu'), []);

  function renderPage() {
    switch (page) {
      case 'menu':
        return (
          <div className={classnames('row flex-fill text-center', styles.feedback)}>
            <div className="col-sm-6">
              <ExternalLink
                className="btn btn-outline-secondary"
                href="https://www.openstreetmap.org/fixthemap"
              >
                <MapIcon />
                <h3>Problem with map data</h3>
                <p>eg. incorrect building outline, missing walkways</p>
              </ExternalLink>
            </div>

            <div className="col-sm-6">
              <button type="button" className="btn btn-outline-secondary" onClick={goToForm}>
                <MapPin />
                <h3>Problem with venue data</h3>
                <p>eg. incorrect room name, floor, location of the map pin</p>
              </button>
            </div>
          </div>
        );

      case 'form':
        return (
          <ImproveVenueForm venue={venue} existingLocation={existingLocation} onBack={goToMenu} />
        );

      default:
        throw new Error(`Unknown page ${page}`);
    }
  }

  return (
    <Modal isOpen={isOpen} onRequestClose={handleRequestClose} animate>
      <CloseButton onClick={handleRequestClose} />
      <h2 className={styles.feedbackTitle}>Improve {venue}</h2>
      {renderPage()}
    </Modal>
  );
};

export default FeedbackModal;
