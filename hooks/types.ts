import * as Tone from 'tone';

export interface NodePosition {
  radius: number;
  probability: number;
}

export type OscillatorPair = [Tone.Oscillator & { stop: () => void }, Tone.Oscillator & { stop: () => void }];

export interface AudioRefs {
  player: React.RefObject<Tone.Player | null>;
  birdsGain: React.RefObject<Tone.Gain | null>;
  droneGains: React.RefObject<Tone.Gain[]>;
  oscillators: React.RefObject<OscillatorPair[]>;
  detunedOscillators: React.RefObject<OscillatorPair[]>;
  panners: React.RefObject<Tone.Panner[]>;
  panLFOs: React.RefObject<(Tone.LFO | null)[]>;
  reverb: React.RefObject<Tone.Reverb | null>;
  reverbLFO: React.RefObject<Tone.LFO | null>;
  delay: React.RefObject<Tone.FeedbackDelay | null>;
  delayLFO: React.RefObject<Tone.LFO | null>;
  filters: React.RefObject<Tone.Filter[]>;
  filterLFOs: React.RefObject<(Tone.LFO | null)[]>;
  envelopes: React.RefObject<Tone.AmplitudeEnvelope[]>;
  ampLFOs: React.RefObject<Tone.LFO[]>;
  birdsLFO: React.RefObject<Tone.LFO | null>;
  chorus: React.RefObject<Tone.Chorus | null>;
  chorusLFO: React.RefObject<Tone.LFO | null>;
  samplePlayers: React.RefObject<Tone.Player[]>;
  sampleEnvelopes: React.RefObject<Tone.AmplitudeEnvelope[]>;
  sampleGains: React.RefObject<Tone.Gain[]>;
} 