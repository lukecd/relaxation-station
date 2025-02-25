import { useState, useEffect, useCallback } from 'react';
import { Chord } from '@tonaljs/tonal';
import { PHRYGIAN_SCALE, PHRYGIAN_CHORDS, BASE_OCTAVE } from './constants';

export const useChordProgression = () => {
  const [currentChordIndex, setCurrentChordIndex] = useState(0);
  const [availableNotes, setAvailableNotes] = useState<string[]>([]);
  const [lastNote, setLastNote] = useState<string | null>(null);

  const updateAvailableNotes = useCallback((chordIndex: number) => {
    const currentChord = PHRYGIAN_CHORDS[chordIndex];
    const chordNotes = Chord.get(currentChord.join(' ')).notes;
    
    const notes: string[] = [];
    
    // Add chord tones with higher probability (3x weight)
    for (let octave = BASE_OCTAVE; octave <= BASE_OCTAVE + 1; octave++) {
      chordNotes.forEach(note => {
        notes.push(`${note}${octave}`);
        notes.push(`${note}${octave}`);
        notes.push(`${note}${octave}`);
      });
    }
    
    // Add scale tones with lower probability (1x weight)
    for (let octave = BASE_OCTAVE; octave <= BASE_OCTAVE + 1; octave++) {
      PHRYGIAN_SCALE.forEach(note => {
        if (!chordNotes.includes(note)) {
          notes.push(`${note}${octave}`);
        }
      });
    }
    
    setAvailableNotes(notes);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentChordIndex(prev => {
        const next = (prev + 1) % PHRYGIAN_CHORDS.length;
        return next;
      });
    }, (60 / 90) * 1000 * 32); // Change every 8 bars at 90 BPM

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    updateAvailableNotes(currentChordIndex);
  }, [currentChordIndex, updateAvailableNotes]);

  const getNextNote = (probability: number): string => {
    if (!lastNote || availableNotes.length === 0) {
      const note = availableNotes[Math.floor(Math.random() * availableNotes.length)];
      setLastNote(note);
      return note;
    }

    const currentIndex = availableNotes.indexOf(lastNote);
    const maxStep = Math.floor(1 + (probability * 4)); // Higher probability = larger intervals
    const direction = Math.random() > 0.4 ? 1 : -1;    // Slight upward bias
    const step = Math.floor(Math.random() * maxStep) + 1;
    
    let targetIndex = currentIndex + (direction * step);
    targetIndex = ((targetIndex % availableNotes.length) + availableNotes.length) % availableNotes.length;
    
    const note = availableNotes[targetIndex];
    setLastNote(note);
    return note;
  };

  return {
    currentChord: PHRYGIAN_CHORDS[currentChordIndex],
    availableNotes,
    getNextNote,
    PHRYGIAN_SCALE,
    PHRYGIAN_CHORDS
  };
}; 