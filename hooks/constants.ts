import { Scale } from '@tonaljs/tonal';
import { VOLUME_LEVELS } from './config';

export const MAX_DRONE_VOLUME = 0.125; // -18dB, reduced from -12dB

// Musical constants
export const PHRYGIAN_CHORDS = [
  ['E2', 'G2', 'B2'],    // Em - root chord
  ['F2', 'A2', 'C3'],    // F - flat II
  ['G2', 'B2', 'D3'],    // Gm - minor III
  ['A2', 'C3', 'E3'],    // Am - minor IV
  ['B2', 'D3', 'F3'],    // Bdim - diminished V
  ['C2', 'E3', 'G3'],    // C - flat VI
  ['D2', 'F3', 'A3'],    // Dm - minor VII
] as const;

export const PHRYGIAN_SCALE = Scale.get('E phrygian').notes;
export const BASE_OCTAVE = 4; // Octave for sequencer notes

// Audio settings
export const AUDIO_SETTINGS = {
  BPM: 90,
  REVERB: {
    decay: 8,      // Reverb tail length in seconds
    wet: 0.7       // Reverb mix level (70% wet)
  },
  DELAY: {
    delayTime: "8n",     // Delay time in musical notation (eighth note)
    feedback: 0.6,       // Delay feedback amount (60%)
    wet: 0.4            // Delay mix level (40% wet)
  },
  PLUCK: {
    attackNoise: 2,      // Initial transient intensity
    dampening: 4000,     // Frequency cutoff for string damping
    resonance: 0.95,     // String resonance amount
    volume: -30         // Base volume in dB
  }
} as const;

/**
 * Converts a linear slider value (0-100) to an exponential gain value
 * @param sliderValue Linear value between 0-100
 * @param isAmbient Whether this is for ambient sound (uses different max volume)
 * @returns Gain value between 0 and max volume
 */
export const sliderToGain = (sliderValue: number, isAmbient: boolean = false) => {
  if (sliderValue <= 0) return 0;
  
  const minDb = -60;  // Minimum volume (-60dB)
  const maxDb = isAmbient ? 
    20 * Math.log10(VOLUME_LEVELS.AMBIENT) : 
    20 * Math.log10(VOLUME_LEVELS.DRONES);
    
  const normalizedValue = sliderValue / 100;
  const dbValue = minDb + (Math.pow(normalizedValue, 2) * (maxDb - minDb));
  return Math.pow(10, dbValue / 20);
}; 