import { Scale } from '@tonaljs/tonal';

export const MAX_DRONE_VOLUME = 0.125; // -18dB, reduced from -12dB

// Musical constants
export const PHRYGIAN_CHORDS = [
  ['E2', 'G2', 'B2'],    // Em
  ['F2', 'A2', 'C3'],    // F
  ['G2', 'B2', 'D3'],    // Gm
  ['A2', 'C3', 'E3'],    // Am
  ['B2', 'D3', 'F3'],    // Bdim
  ['C2', 'E3', 'G3'],    // C
  ['D2', 'F3', 'A3'],    // Dm
] as const;

export const PHRYGIAN_SCALE = Scale.get('E phrygian').notes;
export const BASE_OCTAVE = 4; // Starting octave for sequencer notes

// Audio settings
export const AUDIO_SETTINGS = {
  BPM: 90,
  REVERB: {
    decay: 8,      // Increased from 4 to 8 for longer trails
    wet: 0.7       // Increased from 0.5 for more spaciousness
  },
  DELAY: {
    delayTime: "8n",
    feedback: 0.6,  // Increased from 0.4 for more echoes
    wet: 0.4       // Increased from 0.3
  },
  PLUCK: {
    attackNoise: 2,
    dampening: 4000,
    resonance: 0.95,
    volume: -30
  }
} as const;

// Convert linear slider value (0-100) to exponential gain value
export const sliderToGain = (sliderValue: number, isAmbient: boolean = false) => {
  if (sliderValue <= 0) return 0;
  
  const minDb = -60;
  const maxDb = isAmbient ? -6 : -6; // Increased drone volume from -12dB to -6dB
  const normalizedValue = sliderValue / 100;
  const dbValue = minDb + (Math.pow(normalizedValue, 2) * (maxDb - minDb));
  return Math.pow(10, dbValue / 20);
}; 