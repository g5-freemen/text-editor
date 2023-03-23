/* eslint-disable jsx-a11y/no-noninteractive-element-to-interactive-role */
import './style/main.scss';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import uuid from 'react-uuid';

import Modal from './components/Modal';

export type Note = {
  id?: string;
  date?: string;
  text: string;
  tags: Array<string>;
};

const highlightRegex = /#\w+/g;

export default function App() {
  const inputRef = useRef(null);
  const [openNote, setOpenNote] = useState('');
  const [notes, setNotes] = useState<Note[]>([]);
  const [currentNote, setCurrentNote] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [filters, setFilters] = useState<string[]>([]);

  const allTags = useMemo(() => [...new Set(notes.flatMap((note) => note.tags))], [notes]);

  const focusOnInput = () => {
    if (inputRef.current) {
      const input: HTMLElement = inputRef.current;
      input.focus();
    }
  };

  useEffect(focusOnInput, [inputRef, currentNote]);

  useEffect(() => setFilters([]), [allTags, notes]);

  const createTags = (value: string) => setTags(value.match(highlightRegex) || []);

  useEffect(() => {
    createTags(currentNote);
  }, [currentNote]);

  const handleSaveNote = () => {
    if (currentNote) {
      const newNote = {
        id: uuid(),
        date: `${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}`,
        text: currentNote,
        tags,
      };

      setNotes((prev) => [...prev, newNote]);
      setCurrentNote('');
      setTags([]);
    }
  };

  const handleNoteInputKeyDown = (e: React.KeyboardEvent) => {
    if (e.keyCode === 13) {
      handleSaveNote();
    } else if (e.keyCode === 8) {
      setCurrentNote((prev) => prev.slice(0, -1));
    } else if (e.key.length === 1) {
      setCurrentNote((prev) => prev + e.key);
    }
  };

  const highlightNote = (note: Note) => {
    const { text } = note;

    return text.split(' ').map((word: string) => {
      if (!word) return <React.Fragment key={uuid()}>&nbsp;</React.Fragment>;

      if (note.tags.includes(word)) {
        return (
          <b key={uuid()}>
            {word.replace('#', '')}
            &nbsp;
          </b>
        );
      }

      return <span key={uuid()}>{word}&nbsp;</span>;
    });
  };

  const handleEditNote = (text: string) => {
    setCurrentNote(text);
    createTags(text);
    focusOnInput();
  };

  const handleDeleteNote = (id: string) => {
    setNotes((prev) => prev.filter((note) => note.id !== id));
  };

  const handleDeleteTag = (text: string) => {
    setNotes((prev) =>
      prev.map((note) => ({
        ...note,
        text: note.text.replaceAll(text, text.slice(1)),
        tags: note.tags.filter((tag) => tag !== text),
      })),
    );
  };

  const toggleFilterTag = (tag: string) => {
    if (filters.includes(tag)) {
      setFilters((prev) => prev.filter((el) => el !== tag));
    } else {
      setFilters((prev) => [...prev, tag]);
    }
  };

  const clearThis = () => {
    const method = filters.length > 0 ? setFilters : setNotes;
    method([]);
  };

  return (
    <div className="wrapper">
      {openNote && <Modal note={notes.find((note) => note.id === openNote)} setIsOpenModal={setOpenNote} />}
      <h1>Text Editor</h1>
      <div className="editor">
        <div className="row">
          <div role="textbox" tabIndex={0} onKeyDown={handleNoteInputKeyDown} className="input" ref={inputRef}>
            {highlightNote({ text: currentNote, tags })}
            <span className="cursor">█</span>
          </div>
          <button type="button" onClick={handleSaveNote} onKeyDown={handleSaveNote} title="Save this note">
            Add
          </button>
        </div>
        <ul className="tagslist">
          {[...new Set(tags)].map((tag) => (
            <li key={tag} className="tag">
              {tag.replace('#', '')}
            </li>
          ))}
        </ul>
      </div>

      {notes.length > 0 ? (
        <>
          {allTags.length > 0 && (
            <ul className="row">
              All Tags (Click on tag to filter)
              {allTags.map((tag) => (
                <li
                  role="button"
                  key={tag}
                  className={`tag ${filters.includes(tag) && 'green'}`}
                  onClick={() => toggleFilterTag(tag)}
                  onKeyDown={() => toggleFilterTag(tag)}
                >
                  {tag.replace('#', '')}
                  <button type="button" className="deleteBtn" onClick={() => handleDeleteTag(tag)}>
                    ✖
                  </button>
                </li>
              ))}
            </ul>
          )}
          <ul>
            <div className="row">
              {filters.length > 0 ? 'Filtered notes' : 'All notes'}
              <button
                type="button"
                className="deleteBtn"
                title={filters.length > 0 ? 'Clear filters' : 'Clear all notes'}
                onClick={clearThis}
              >
                ✖
              </button>
            </div>
            {notes
              .filter((note) => (filters.length > 0 ? filters.every((tag) => note.tags.includes(tag)) : note.tags))
              .map((note) => (
                <li className="row" key={note.id}>
                  <button
                    type="button"
                    className="note"
                    onClick={() => note.id && setOpenNote(note.id)}
                    onKeyDown={() => note.id && setOpenNote(note.id)}
                  >
                    {highlightNote(note)}
                  </button>
                  <button
                    type="button"
                    className="editBtn"
                    onClick={() => handleEditNote(note.text)}
                    title="Edit this note"
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    className="deleteBtn"
                    onClick={() => note.id && handleDeleteNote(note.id)}
                    title="Delete this note"
                  >
                    ✖
                  </button>
                </li>
              ))}
          </ul>
        </>
      ) : (
        <p style={{ textAlign: 'center' }}>Notes not found...</p>
      )}
    </div>
  );
}
