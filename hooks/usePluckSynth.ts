import { useRef, useEffect } from 'react';
import * as Tone from 'tone';

export const usePluckSynth = () => {
  const pluckSynthRef = useRef<Tone.PluckSynth | null>(null);
  const lastTriggerTimeRef = useRef<number>(0);

  useEffect(() => {
    // Create effects chain
    const reverb = new Tone.Reverb({
      decay: 5,
      wet: 0.6
    }).toDestination();

    const delay = new Tone.FeedbackDelay({
      delayTime: "4n",
      feedback: 0.6,
      wet: 0.5
    }).connect(reverb);

    // Add a filter to shape the sound
    const filter = new Tone.Filter({
      frequency: 800,
      type: "lowpass",
      rolloff: -24
    }).connect(delay);

    // Create pluck synth with bongo-like settings
    const pluck = new Tone.PluckSynth({
      attackNoise: 1,     // Less initial noise
      dampening: 1800,    // Lower dampening for less high end
      resonance: 0.98,    // More resonance for body
      volume: -30
    }).connect(filter);

    // Store refs
    pluckSynthRef.current = pluck;

    // Cleanup
    return () => {
      pluck.dispose();
      delay.dispose();
      reverb.dispose();
      filter.dispose();
    };
  }, []);

  const triggerNote = (note: string) => {
    if (pluckSynthRef.current) {
      const now = Tone.now();
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