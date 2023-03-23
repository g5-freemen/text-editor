import React from 'react';
import { createPortal } from 'react-dom';

import { Note } from '../App';
import styles from './Modal.module.scss';

interface IProps {
  note?: Note;
  setIsOpenModal: (value: string) => void;
}

export default function Modal({ note, setIsOpenModal }: IProps) {
  const closeModal = () => setIsOpenModal('');

  return note
    ? createPortal(
        <div className={styles.modal}>
          <div className={styles.container}>
            <button
              type="button"
              className={styles.closeBtn}
              title="Close Modal"
              onClick={closeModal}
            >
              ✖
            </button>
            <p>{note.date}</p>
            <p className={styles.text}>{note.text}</p>
            <ul className="tagslist">
              {[...new Set(note.tags)].map((tag) => (
                <li key={tag} className="tag">
                  {tag.replace('#', '')}
                </li>
              ))}
            </ul>
          </div>
        </div>,
        document.body,
      )
    : null;
}
