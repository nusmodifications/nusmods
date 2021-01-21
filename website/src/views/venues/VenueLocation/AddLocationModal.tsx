import type { FC } from 'react';

import Modal from 'views/components/Modal';
import CloseButton from 'views/components/CloseButton';

import ImproveVenueForm from './ImproveVenueForm';
import styles from './VenueLocation.scss';

type Props = {
  venue: string;
  isOpen: boolean;
  onRequestClose: () => void;
};

const AddLocationModal: FC<Props> = ({ venue, isOpen, onRequestClose }) => (
  <Modal isOpen={isOpen} onRequestClose={onRequestClose} animate>
    <CloseButton onClick={onRequestClose} />
    <h2 className={styles.feedbackTitle}>Improve {venue}</h2>
    <ImproveVenueForm venue={venue} />
  </Modal>
);

export default AddLocationModal;
