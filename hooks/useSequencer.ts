import { useState, useEffect } from 'react';
import { NodePosition } from './types';

export const useSequencer = (
  nodePositions: NodePosition[],
  availableNotes: string[],
  triggerNote: (note: string) => void,
  getNextNote: (probability: number) => string,
  isRunning: boolean
) => {
  const [activeStep, setActiveStep] = useState(0);

  useEffect(() => {
    if (!isRunning) return;

    const interval = setInterval(() => {
      setActiveStep(prev => {
        const next = (prev + 1) % 16;
        
        const { probability } = nodePositions[next];
        const roll = Math.random();
        const willTrigger = probability > 0 && roll < probability;
        
        if (willTrigger && availableNotes.length > 0) {
          // Use the new getNextNote function that considers melodic movement
          const note = getNextNote(probability);
          triggerNote(note);
        }
        
        return next;
      });
    }, (60 / 90) * 1000); // 90 BPM

    return () => clearInterval(interval);
  }, [nodePositions, availableNotes, triggerNote, getNextNote, isRunning]);

  return {
    activeStep
  };
}; 