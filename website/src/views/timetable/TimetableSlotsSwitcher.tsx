import { FC, FormEvent, useCallback, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Downshift from 'downshift';
import classnames from 'classnames';
import { Columns, Copy, Edit2, FilePlus, MoreHorizontal, Plus, Trash2 } from 'react-feather';

import type { Semester } from 'types/modules';
import type { TimetableSlot } from 'types/reducers';

import {
  addTimetableSlot,
  deleteTimetableSlot,
  renameTimetableSlot,
  switchTimetableSlot,
} from 'actions/timetables';
import { getActiveSlotId, getTimetableSlots } from 'selectors/timetables';
import Modal from 'views/components/Modal';
import CloseButton from 'views/components/CloseButton';

import styles from './TimetableSlotsSwitcher.scss';

type AddAction = 'NEW' | 'DUPLICATE';
type ManageAction = 'RENAME' | 'DELETE' | 'COMPARE';

type Props = {
  slots: TimetableSlot[];
  activeSlotId: string;
  onSwitchSlot: (slotId: string) => void;
  onAddSlot: (options: { title?: string; duplicateCurrent?: boolean }) => void;
  onRenameSlot: (slotId: string, title: string) => void;
  onDeleteSlot: (slotId: string) => void;
  onCompare?: () => void;
};

export const TimetableSlotsSwitcherComponent: FC<Props> = ({
  slots,
  activeSlotId,
  onSwitchSlot,
  onAddSlot,
  onRenameSlot,
  onDeleteSlot,
  onCompare,
}) => {
  const [isRenameOpen, setRenameOpen] = useState(false);
  const [isDeleteOpen, setDeleteOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');

  const activeSlot = slots.find((slot) => slot.id === activeSlotId) ?? slots[0];
  const canDelete = slots.length > 1;

  const openRenameModal = useCallback(() => {
    setNewTitle(activeSlot.title);
    setRenameOpen(true);
  }, [activeSlot]);

  const submitRename = useCallback(
    (evt: FormEvent) => {
      evt.preventDefault();
      onRenameSlot(activeSlot.id, newTitle);
      setRenameOpen(false);
    },
    [activeSlot, newTitle, onRenameSlot],
  );

  const confirmDelete = useCallback(() => {
    onDeleteSlot(activeSlot.id);
    setDeleteOpen(false);
  }, [activeSlot, onDeleteSlot]);

  const onSelectAddAction = useCallback(
    (item: AddAction | null) => {
      if (item === 'NEW') onAddSlot({});
      if (item === 'DUPLICATE') onAddSlot({ duplicateCurrent: true });
    },
    [onAddSlot],
  );

  const canCompare = slots.length > 1 && !!onCompare;

  const onSelectManageAction = useCallback(
    (item: ManageAction | null) => {
      if (item === 'RENAME') openRenameModal();
      if (item === 'DELETE' && canDelete) setDeleteOpen(true);
      if (item === 'COMPARE') onCompare?.();
    },
    [canDelete, onCompare, openRenameModal],
  );

  return (
    <div className={styles.slotsSwitcher} role="tablist" aria-label="Saved timetables">
      {slots.map((slot) => {
        const isActive = slot.id === activeSlotId;
        return (
          <button
            key={slot.id}
            type="button"
            role="tab"
            aria-selected={isActive}
            className={classnames(styles.tab, 'btn btn-sm', {
              'btn-primary': isActive,
              'btn-outline-primary': !isActive,
            })}
            onClick={() => {
              if (!isActive) onSwitchSlot(slot.id);
            }}
          >
            {slot.title}
          </button>
        );
      })}

      <Downshift onSelect={onSelectAddAction}>
        {({ isOpen, getItemProps, getMenuProps, toggleMenu, highlightedIndex }) => (
          <div className={styles.menu}>
            <button
              type="button"
              aria-label="Add timetable"
              className={classnames(styles.iconButton, 'btn btn-sm btn-outline-primary btn-svg')}
              onClick={() => toggleMenu()}
            >
              <Plus className="svg svg-small" />
            </button>

            <div
              className={classnames('dropdown-menu', styles.dropdownMenu, { show: isOpen })}
              {...getMenuProps()}
            >
              <button
                type="button"
                className={classnames('dropdown-item', {
                  'dropdown-selected': highlightedIndex === 0,
                })}
                {...getItemProps({ item: 'NEW' })}
              >
                <FilePlus className="svg svg-small" /> New empty timetable
              </button>
              <button
                type="button"
                className={classnames('dropdown-item', {
                  'dropdown-selected': highlightedIndex === 1,
                })}
                {...getItemProps({ item: 'DUPLICATE' })}
              >
                <Copy className="svg svg-small" /> Duplicate current timetable
              </button>
            </div>
          </div>
        )}
      </Downshift>

      <Downshift onSelect={onSelectManageAction}>
        {({ isOpen, getItemProps, getMenuProps, toggleMenu, highlightedIndex }) => (
          <div className={styles.menu}>
            <button
              type="button"
              aria-label="Timetable options"
              className={classnames(styles.iconButton, 'btn btn-sm btn-outline-primary btn-svg')}
              onClick={() => toggleMenu()}
            >
              <MoreHorizontal className="svg svg-small" />
            </button>

            <div
              className={classnames('dropdown-menu', styles.dropdownMenu, { show: isOpen })}
              {...getMenuProps()}
            >
              <button
                type="button"
                className={classnames('dropdown-item', {
                  'dropdown-selected': highlightedIndex === 0,
                })}
                {...getItemProps({ item: 'RENAME' })}
              >
                <Edit2 className="svg svg-small" /> Rename
              </button>
              {canCompare && (
                <button
                  type="button"
                  className={classnames('dropdown-item', {
                    'dropdown-selected': highlightedIndex === 1,
                  })}
                  {...getItemProps({ item: 'COMPARE' })}
                >
                  <Columns className="svg svg-small" /> Compare&hellip;
                </button>
              )}
              <button
                type="button"
                disabled={!canDelete}
                title={canDelete ? undefined : 'The last timetable cannot be deleted'}
                className={classnames('dropdown-item', {
                  'dropdown-selected': highlightedIndex === (canCompare ? 2 : 1),
                })}
                {...getItemProps({ item: 'DELETE', disabled: !canDelete })}
              >
                <Trash2 className="svg svg-small" /> Delete
              </button>
            </div>
          </div>
        )}
      </Downshift>

      <Modal isOpen={isRenameOpen} onRequestClose={() => setRenameOpen(false)} animate>
        <CloseButton absolutePositioned onClick={() => setRenameOpen(false)} />
        <div className={styles.modalHeader}>
          <Edit2 />
          <h3>Rename timetable</h3>
        </div>
        <form onSubmit={submitRename}>
          <input
            type="text"
            className="form-control"
            value={newTitle}
            onChange={(evt) => setNewTitle(evt.target.value)}
            maxLength={40}
            // eslint-disable-next-line jsx-a11y/no-autofocus
            autoFocus
          />
          <button
            type="submit"
            className={classnames(styles.modalAction, 'btn btn-primary btn-block')}
            disabled={!newTitle.trim()}
          >
            Rename
          </button>
        </form>
      </Modal>

      <Modal isOpen={isDeleteOpen} onRequestClose={() => setDeleteOpen(false)} animate>
        <CloseButton absolutePositioned onClick={() => setDeleteOpen(false)} />
        <div className={styles.modalHeader}>
          <Trash2 />
          <h3>Delete &lsquo;{activeSlot.title}&rsquo;?</h3>
          <p>
            This will permanently remove this timetable and all courses in it. You can undo this
            immediately afterwards, but it cannot be recovered later.
          </p>
        </div>
        <button
          type="button"
          className={classnames(styles.modalAction, 'btn btn-primary btn-block')}
          onClick={confirmDelete}
        >
          Delete
        </button>
      </Modal>
    </div>
  );
};

type OwnProps = {
  semester: Semester;
  onCompare?: () => void;
};

/**
 * Tab row for switching between saved timetable arrangements ("slots") of a
 * semester. See https://github.com/nusmodifications/nusmods/issues/4455
 */
const TimetableSlotsSwitcher: FC<OwnProps> = ({ semester, onCompare }) => {
  const slots = useSelector(getTimetableSlots)(semester);
  const activeSlotId = useSelector(getActiveSlotId)(semester);
  const dispatch = useDispatch();

  const onSwitchSlot = useCallback(
    (slotId: string) => dispatch(switchTimetableSlot(semester, slotId)),
    [dispatch, semester],
  );
  const onAddSlot = useCallback(
    (options: { title?: string; duplicateCurrent?: boolean }) =>
      dispatch(addTimetableSlot(semester, options)),
    [dispatch, semester],
  );
  const onRenameSlot = useCallback(
    (slotId: string, title: string) => dispatch(renameTimetableSlot(semester, slotId, title)),
    [dispatch, semester],
  );
  const onDeleteSlot = useCallback(
    (slotId: string) => dispatch(deleteTimetableSlot(semester, slotId)),
    [dispatch, semester],
  );

  return (
    <TimetableSlotsSwitcherComponent
      slots={slots}
      activeSlotId={activeSlotId}
      onSwitchSlot={onSwitchSlot}
      onAddSlot={onAddSlot}
      onRenameSlot={onRenameSlot}
      onDeleteSlot={onDeleteSlot}
      onCompare={onCompare}
    />
  );
};

export default TimetableSlotsSwitcher;
