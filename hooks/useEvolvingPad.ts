import { useRef, useEffect, useState, useCallback } from 'react';
import * as Tone from 'tone';
import { AudioRefs, OscillatorPair } from './types';
import { AUDIO_SETTINGS, PHRYGIAN_CHORDS, sliderToGain } from './constants';
import { VOLUME_LEVELS } from './config';

export const useEvolvingPad = () => {
  const [isInitialized, setIsInitialized] = useState(false);
  const [isStarted, setIsStarted] = useState(false);
  const hasInitialized = useRef(false);
  const cleanupInProgress = useRef(false);

  const audioRefs: AudioRefs = {
    player: useRef<Tone.Player | null>(null),
    birdsGain: useRef<Tone.Gain | null>(null),
    droneGains: useRef<Tone.Gain[]>([]),
    oscillators: useRef<OscillatorPair[]>([]),
    detunedOscillators: useRef<OscillatorPair[]>([]),
    panners: useRef<Tone.Panner[]>([]),
    panLFOs: useRef<(Tone.LFO | null)[]>([]),
    reverb: useRef<Tone.Reverb | null>(null),
    reverbLFO: useRef<Tone.LFO | null>(null),
    delay: useRef<Tone.FeedbackDelay | null>(null),
    delayLFO: useRef<Tone.LFO | null>(null),
    filters: useRef<Tone.Filter[]>([]),
    filterLFOs: useRef<(Tone.LFO | null)[]>([]),
    envelopes: useRef<Tone.AmplitudeEnvelope[]>([]),
    ampLFOs: useRef<Tone.LFO[]>([]),
    birdsLFO: useRef<Tone.LFO | null>(null),
    chorus: useRef<Tone.Chorus | null>(null),
    chorusLFO: useRef<Tone.LFO | null>(null),
    samplePlayers: useRef<Tone.Player[]>([]),
    sampleEnvelopes: useRef<Tone.AmplitudeEnvelope[]>([]),
    sampleGains: useRef<Tone.Gain[]>([]),
    pluckSynth: useRef<Tone.PluckSynth | null>(null),
  };

  const initializeAudio = useCallback(async () => {
    if (hasInitialized.current || cleanupInProgress.current) {
      console.log('🎵 Audio already initialized or cleanup in progress');
      return false;
    }

    console.log('🎵 Starting audio initialization...');

    try {
      // First, ensure we have user interaction
      if (Tone.context.state !== 'running') {
        console.log('⏳ Waiting for user gesture to start audio context...');
        await Tone.start();
        console.log('✓ Audio context started:', Tone.context.state);
      }

      // Initialize effects chain
      audioRefs.reverb.current = new Tone.Reverb({
        decay: 4,
        wet: 0.4
      }).toDestination();
      await audioRefs.reverb.current.generate();

      audioRefs.delay.current = new Tone.FeedbackDelay({
        delayTime: 0.3,
        feedback: 0.4,
        wet: 0.3
      }).connect(audioRefs.reverb.current);

      audioRefs.chorus.current = new Tone.Chorus({
        frequency: 0.2,
        delayTime: 4,
        depth: 0.4,
        spread: 180,
        wet: 0.3
      }).connect(audioRefs.delay.current);

      // Initialize ambient sounds
      audioRefs.birdsGain.current = new Tone.Gain();
      audioRefs.birdsGain.current.gain.value = 0.5;
      audioRefs.birdsGain.current.connect(audioRefs.reverb.current);
      
      // Create and configure ambient player
      audioRefs.player.current = new Tone.Player();
      audioRefs.player.current.loop = true;
      audioRefs.player.current.volume.value = 20 * Math.log10(VOLUME_LEVELS.AMBIENT);
      audioRefs.player.current.connect(audioRefs.birdsGain.current);
      
      // Load ambient sound
      await audioRefs.player.current.load("/samples/birds.mp3");
      console.log('✓ Ambient sound loaded');
      
      // Start the ambient player immediately after loading
      audioRefs.player.current.start();
      console.log('✓ Started ambient player');

      // Initialize drone gains with proper initial volume
      const droneGains = [
        new Tone.Gain(0.5),
        new Tone.Gain(0.5),
        new Tone.Gain(0.5)
      ];

      // Initialize filters with gentler settings
      const filters = [
        new Tone.Filter(1800, "lowpass", -12),
        new Tone.Filter(1800, "lowpass", -12),
        new Tone.Filter(1800, "lowpass", -12)
      ];

      filters.forEach(filter => {
        filter.Q.value = 0.3;
      });

      // Initialize panners for stereo field
      const panners = [
        new Tone.Panner(-0.3),
        new Tone.Panner(0),
        new Tone.Panner(0.3)
      ];

      // Initialize envelopes for smooth transitions
      const envelopes = PHRYGIAN_CHORDS[0].flatMap(() => [
        new Tone.AmplitudeEnvelope({
          attack: 2,
          decay: 0,
          sustain: 1,
          release: 4,
          attackCurve: 'linear',
          releaseCurve: 'linear'
        }),
        new Tone.AmplitudeEnvelope({
          attack: 2,
          decay: 0,
          sustain: 1,
          release: 4,
          attackCurve: 'linear',
          releaseCurve: 'linear'
        })
      ]);

      // Connect the audio chain in reverse order
      droneGains.forEach(gain => gain.connect(audioRefs.chorus.current!));
      filters.forEach((filter, i) => filter.connect(droneGains[i]));
      panners.forEach((panner, i) => panner.connect(filters[i]));
      envelopes.forEach((env, i) => env.connect(panners[Math.floor(i / 2)]));

      // Store refs
      audioRefs.droneGains.current = droneGains;
      audioRefs.filters.current = filters;
      audioRefs.panners.current = panners;
      audioRefs.envelopes.current = envelopes;

      // Create oscillators with proper tuning
      const oscillators: OscillatorPair[] = PHRYGIAN_CHORDS[0].map((note, i) => {
        if (i === 0) {
          // Main oscillator with custom partials
          const osc = new Tone.Oscillator({
            type: "custom",
            partials: [0, 0.5, 0.2, 0.1, 0.05, 0.025],
            frequency: note,
            volume: -12
          });

          // Detuned oscillator with slightly different partials
          const detuned = new Tone.Oscillator({
            type: "custom",
            partials: [0, 0.4, 0.16, 0.08, 0.04, 0.02], // 20% less amplitude
            frequency: note,
            volume: -21,
            detune: 3
          });

          return [osc, detuned];
        }

        // Other drones remain sine waves
        const osc = new Tone.Oscillator({
          type: "sine",
          frequency: note,
          volume: -12
        });

        const detuned = new Tone.Oscillator({
          type: "sine",
          frequency: note,
          volume: -21,
          detune: 3
        });

        return [osc, detuned];
      });

      const detunedOscillators: OscillatorPair[] = PHRYGIAN_CHORDS[0].map((note, i) => {
        // Additional detuned pair for richness
        const oscDown = new Tone.Oscillator({
          type: "sine",
          frequency: note,
          volume: -18,
          detune: -3
        });

        const oscUp = new Tone.Oscillator({
          type: "sine",
          frequency: note,
          volume: -24,
          detune: 3
        });

        return [oscDown, oscUp];
      });

      // Store refs
      audioRefs.oscillators.current = oscillators;
      audioRefs.detunedOscillators.current = detunedOscillators;

      // Connect oscillators to envelopes
      oscillators.forEach((pair, i) => {
        pair[0].connect(envelopes[i * 2]);
        pair[1].connect(envelopes[i * 2]);
      });

      detunedOscillators.forEach((pair, i) => {
        pair[0].connect(envelopes[i * 2 + 1]);
        pair[1].connect(envelopes[i * 2 + 1]);
      });

      // Start all oscillators
      oscillators.forEach(pair => {
        pair[0].start();
        pair[1].start();
      });

      detunedOscillators.forEach(pair => {
        pair[0].start();
        pair[1].start();
      });

      // Trigger all envelopes
      envelopes.forEach(env => env.triggerAttack());

      // Create pluck synth effects chain
      const pluckReverb = new Tone.Reverb({
        decay: 5,
        wet: 0.6
      }).toDestination();

      const pluckDelay = new Tone.FeedbackDelay({
        delayTime: "4n",
        feedback: 0.6,
        wet: 0.5
      }).connect(pluckReverb);

      const pluckFilter = new Tone.Filter({
        frequency: 800,
        type: "lowpass",
        rolloff: -24
      }).connect(pluckDelay);

      // Initialize pluck synth with original settings
      const pluck = new Tone.PluckSynth({
        attackNoise: 1,     // Less initial noise
        dampening: 1800,    // Lower dampening for less high end
        resonance: 0.98,    // More resonance for body
        volume: 20 * Math.log10(VOLUME_LEVELS.MELODY)
      }).connect(pluckFilter);  // Connect to filter instead of chorus

      audioRefs.pluckSynth.current = pluck;

      // Set initialized state
      hasInitialized.current = true;
      setIsInitialized(true);
      setIsStarted(true);

      console.log('✓ Audio engine initialized with pads');
      return true;
    } catch (error) {
      console.error('❌ Error during audio initialization:', error);
      hasInitialized.current = false;
      setIsInitialized(false);
      setIsStarted(false);
      throw error;
    }
  }, []);

  const startAudio = useCallback(async () => {
    if (!hasInitialized.current || !isInitialized) {
      console.log('⚠️ Cannot start - not initialized');
      return;
    }

    if (isStarted) {
      console.log('⚠️ Already started');
      return;
    }

    if (cleanupInProgress.current) {
      console.log('⚠️ Cannot start - cleanup in progress');
      return;
    }

    try {
      // Ensure context is running
      if (Tone.context.state !== 'running') {
        console.log('⚠️ Context not running, resuming...');
        await Tone.context.resume();
        console.log('✓ Context resumed:', Tone.context.state);
      }

      // Start oscillators and envelopes
      audioRefs.oscillators.current.forEach((oscPair, i) => {
        try {
          const mainEnv = audioRefs.envelopes.current[i * 2];
          const detunedEnv = audioRefs.envelopes.current[i * 2 + 1];
          const droneGain = audioRefs.droneGains.current[i];
          const filter = audioRefs.filters.current[i];
          const panner = audioRefs.panners.current[i];
          const detunedPair = audioRefs.detunedOscillators.current[i];

          // Start oscillators if not already started
          oscPair[0].start();
          oscPair[1].start();
          detunedPair[0].start();
          detunedPair[1].start();

          // Trigger envelopes
          mainEnv.triggerAttack();
          detunedEnv.triggerAttack();
          
          console.log(`✓ Restarted oscillator pair ${i}:`, {
            mainEnvValue: mainEnv.value,
            detunedEnvValue: detunedEnv.value
          });
        } catch (error) {
          console.error(`❌ Error restarting oscillator pair ${i}:`, error);
        }
      });

      // Start ambient if not already playing
      if (audioRefs.player.current?.state !== 'started') {
        audioRefs.player.current?.start();
      }

      setIsStarted(true);
      console.log('✓ Audio restarted!');
    } catch (error) {
      console.error('❌ Error starting audio:', error);
      setIsStarted(false);
    }
  }, [isInitialized, isStarted]);

  const stopAudio = useCallback(() => {
    console.log('⏹️ Stopping audio...');
    
    if (!isInitialized || !isStarted) {
      console.log('❌ Cannot stop audio - not running');
      return;
    }

    try {
      audioRefs.player.current?.stop();
      console.log('✓ Stopped ambient player');

      audioRefs.envelopes.current.forEach((env, i) => {
        env.triggerRelease();
        console.log(`✓ Released envelope ${i}`);
      });
      
      setTimeout(() => {
        audioRefs.oscillators.current.forEach((oscPair, i) => {
          oscPair[0].stop();
          oscPair[1].stop();
          audioRefs.detunedOscillators.current[i][0].stop();
          audioRefs.detunedOscillators.current[i][1].stop();
          console.log(`✓ Stopped oscillator pair ${i}`);
        });
      }, 4500);

      setIsStarted(false);
      console.log('⏹️ All audio stopped!');
    } catch (error) {
      console.error('❌ Error during audio stop:', error);
    }
  }, [isInitialized, isStarted]);

  // Cleanup only when component unmounts
  useEffect(() => {
    // Return cleanup function
    return () => {
      // Only run cleanup if we're actually unmounting
      if (!hasInitialized.current || !isInitialized || !document.body.contains(document.querySelector('[data-drone-station]'))) {
        return;
      }

      console.log('🧹 Starting audio cleanup...');
      cleanupInProgress.current = true;

      try {
        if (isStarted) {
          stopAudio();
        }

        // Cleanup
        console.log('Disposing audio nodes...');
        audioRefs.player.current?.dispose();
        audioRefs.birdsGain.current?.dispose();
        audioRefs.reverb.current?.dispose();
        audioRefs.delay.current?.dispose();
        audioRefs.chorus.current?.dispose();
        audioRefs.reverbLFO.current?.dispose();
        audioRefs.delayLFO.current?.dispose();
        audioRefs.chorusLFO.current?.dispose();
        audioRefs.birdsLFO.current?.dispose();
        
        // Cleanup arrays
        audioRefs.droneGains.current.forEach(gain => gain.dispose());
        audioRefs.oscillators.current.forEach(oscPair => {
          oscPair[0].dispose();
          oscPair[1].dispose();
        });
        audioRefs.detunedOscillators.current.forEach(oscPair => {
          oscPair[0].dispose();
          oscPair[1].dispose();
        });
        audioRefs.panners.current.forEach(panner => panner.dispose());
        audioRefs.panLFOs.current.forEach(lfo => lfo?.dispose());
        audioRefs.filters.current.forEach(filter => filter.dispose());
        audioRefs.filterLFOs.current.forEach(lfo => lfo?.dispose());
        audioRefs.envelopes.current.forEach(env => env.dispose());
        audioRefs.ampLFOs.current.forEach(lfo => lfo.dispose());
        audioRefs.samplePlayers.current.forEach(player => player.dispose());
        audioRefs.sampleEnvelopes.current.forEach(env => env.dispose());
        audioRefs.sampleGains.current.forEach(gain => gain.dispose());

        hasInitialized.current = false;
        setIsInitialized(false);
        setIsStarted(false);
        console.log('✓ Audio cleanup complete');
      } catch (error) {
        console.error('❌ Error during cleanup:', error);
      } finally {
        cleanupInProgress.current = false;
      }
    };
  }, []);

  return {
    audioRefs,
    isInitialized,
    isStarted,
    initializeAudio,
    startAudio,
    stopAudio
  };
}; 