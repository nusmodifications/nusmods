import { FC, useState } from 'react';
import { XSquare } from 'react-feather';
import CloseButton from 'views/components/CloseButton';
import Modal from 'views/components/Modal';

import styles from './PlannerClearButton.scss';

type Props = {
  clearPlanner: () => void;
};

const PlannerClearButton: FC<Props> = (props: Props) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);

  const closeModal = () => setIsOpen(false);

  return (
    <>
      <button
        className="btn btn-svg btn-outline-primary"
        type="button"
        onClick={() => setIsOpen(true)}
      >
        <XSquare className="svg" />
        <p>Reset</p>
      </button>

      <Modal isOpen={isOpen} onRequestClose={closeModal} animate>
        <CloseButton absolutePositioned onClick={closeModal} />
        <div className={styles.header}>
          <XSquare />

          <h3>Do you want to reset your planner?</h3>
          <p>
            This will permanently reset all courses and settings. <hr />
            <strong>Tip:</strong> If you are unsure, you can make a backup by exporting the current
            plan.
          </p>
        </div>

        <button
          type="button"
          className="btn btn-primary btn-block"
          onClick={() => {
            props.clearPlanner();
            closeModal();
          }}
        >
          Reset
        </button>
      </Modal>
    </>
  );
};

export default PlannerClearButton;
