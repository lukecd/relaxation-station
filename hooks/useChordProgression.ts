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
    
    // Add chord tones with higher weight (duplicate them for higher probability)
    for (let octave = BASE_OCTAVE; octave <= BASE_OCTAVE + 1; octave++) {
      chordNotes.forEach(note => {
        // Add each chord tone three times for higher probability
        notes.push(`${note}${octave}`);
        notes.push(`${note}${octave}`);
        notes.push(`${note}${octave}`);
      });
    }
    
    // Add scale tones with lower weight
    for (let octave = BASE_OCTAVE; octave <= BASE_OCTAVE + 1; octave++) {
      PHRYGIAN_SCALE.forEach(note => {
        if (!chordNotes.includes(note)) {
          // Add each scale tone once for lower probability
          notes.push(`${note}${octave}`);
        }
      });
    }
    
    setAvailableNotes(notes);
  }, []);

  useEffect(() => {
    updateAvailableNotes(currentChordIndex);
  }, [currentChordIndex, updateAvailableNotes]);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentChordIndex(prev => {
        const next = (prev + 1) % PHRYGIAN_CHORDS.length;
        return next;
      });
    }, (60 / 90) * 1000 * 32); // 32 beats = 8 bars at 90 BPM

    return () => clearInterval(interval);
  }, []);

  const getNextNote = (probability: number): string => {
    if (!lastNote || availableNotes.length === 0) {
      const note = availableNotes[Math.floor(Math.random() * availableNotes.length)];
      setLastNote(note);
      return note;
    }

    // Get the current note's info
    const [noteName, octave] = lastNote.split(/(\d+)/);
    const currentIndex = availableNotes.indexOf(lastNote);

    // Higher probability = more likely to move by larger intervals
    const maxStep = Math.floor(1 + (probability * 4)); // 1-5 steps
    
    // Choose direction (-1 or 1) with slight upward bias for more melodic movement
    const direction = Math.random() > 0.4 ? 1 : -1;
    
    // Calculate the step size based on probability
    const step = Math.floor(Math.random() * maxStep) + 1;
    
    // Calculate target index with wrapping
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