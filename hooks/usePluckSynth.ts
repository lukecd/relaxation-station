import { useRef } from 'react';
import * as Tone from 'tone';
import { VOLUME_LEVELS } from './config';

/**
 * Hook for managing the melody synthesizer
 * @param pluckSynthRef Reference to the pluck synth from audio engine
 */
export const usePluckSynth = (pluckSynthRef: React.RefObject<Tone.PluckSynth | null>) => {
  // Track timing between notes to prevent too rapid triggering
  const lastTriggerTimeRef = useRef<number>(0);

  /**
   * Trigger a note with rate limiting
   * @param note Note to play (e.g. "C4")
   */
  const triggerNote = (note: string) => {
    if (pluckSynthRef.current) {
      const now = Tone.now();
      // Minimum 100ms between notes
      if (now - lastTriggerTimeRef.current >= 0.1) {
        pluckSynthRef.current.triggerAttackRelease(note, "16n", now);
        lastTriggerTimeRef.current = now;
      }
    }
  };

  return {
    triggerNote
  };
}; 