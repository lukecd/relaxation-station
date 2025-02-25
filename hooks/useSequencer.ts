import { useState, useEffect } from 'react';
import { NodePosition } from './types';

/**
 * Hook for managing the 16-step sequencer
 * @param nodePositions Array of node positions and probabilities
 * @param availableNotes Array of possible notes to play
 * @param triggerNote Function to trigger note playback
 * @param getNextNote Function to select next note based on probability
 * @param isRunning Whether sequencer is currently active
 */
export const useSequencer = (
  nodePositions: NodePosition[],
  availableNotes: string[],
  triggerNote: (note: string) => void,
  getNextNote: (probability: number) => string,
  isRunning: boolean
) => {
  const [activeStep, setActiveStep] = useState(0);

  // Advance sequencer and trigger notes
  useEffect(() => {
    if (!isRunning) return;

    const interval = setInterval(() => {
      setActiveStep(prev => {
        const next = (prev + 1) % 16;
        
        // Check if note should trigger based on node probability
        const { probability } = nodePositions[next];
        const roll = Math.random();
        const willTrigger = probability > 0 && roll < probability;
        
        // Trigger note if probability check passes
        if (willTrigger && availableNotes.length > 0) {
          const note = getNextNote(probability);
          triggerNote(note);
        }
        
        return next;
      });
    }, (60 / 90) * 1000); // Step every beat at 90 BPM

    return () => clearInterval(interval);
  }, [nodePositions, availableNotes, triggerNote, getNextNote, isRunning]);

  return {
    activeStep
  };
}; 