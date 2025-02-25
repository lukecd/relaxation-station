import * as Tone from 'tone';

// Node position in the circular sequencer
export interface NodePosition {
  radius: number;      // Distance from center
  probability: number; // Chance of triggering (0-1)
}

// Pair of oscillators for richer sound
export type OscillatorPair = [
  Tone.Oscillator & { stop: () => void }, 
  Tone.Oscillator & { stop: () => void }
];

// Audio engine references
export interface AudioRefs {
  player: React.RefObject<Tone.Player | null>;              // Ambient sound player
  birdsGain: React.RefObject<Tone.Gain | null>;            // Ambient volume control
  droneGains: React.RefObject<Tone.Gain[]>;                // Volume controls for each drone
  oscillators: React.RefObject<OscillatorPair[]>;          // Main drone oscillators
  detunedOscillators: React.RefObject<OscillatorPair[]>;   // Detuned drone oscillators
  panners: React.RefObject<Tone.Panner[]>;                 // Stereo position controls
  panLFOs: React.RefObject<(Tone.LFO | null)[]>;          // Panning modulators
  reverb: React.RefObject<Tone.Reverb | null>;             // Main reverb effect
  reverbLFO: React.RefObject<Tone.LFO | null>;            // Reverb modulator
  delay: React.RefObject<Tone.FeedbackDelay | null>;       // Main delay effect
  delayLFO: React.RefObject<Tone.LFO | null>;             // Delay modulator
  filters: React.RefObject<Tone.Filter[]>;                 // Tone filters
  filterLFOs: React.RefObject<(Tone.LFO | null)[]>;       // Filter modulators
  envelopes: React.RefObject<Tone.AmplitudeEnvelope[]>;   // Volume envelopes
  ampLFOs: React.RefObject<Tone.LFO[]>;                   // Amplitude modulators
  birdsLFO: React.RefObject<Tone.LFO | null>;             // Ambient modulator
  chorus: React.RefObject<Tone.Chorus | null>;             // Chorus effect
  chorusLFO: React.RefObject<Tone.LFO | null>;            // Chorus modulator
  samplePlayers: React.RefObject<Tone.Player[]>;          // Additional sound players
  sampleEnvelopes: React.RefObject<Tone.AmplitudeEnvelope[]>; // Sample volume envelopes
  sampleGains: React.RefObject<Tone.Gain[]>;              // Sample volume controls
  pluckSynth: React.RefObject<Tone.PluckSynth | null>;    // Melody synthesizer
} 