'use client';

import React, { useEffect, useState } from 'react';
import * as Tone from 'tone';
import { useEvolvingPad } from '../../hooks/useEvolvingPad';
import { useChordProgression } from '../../hooks/useChordProgression';
import { usePluckSynth } from '../../hooks/usePluckSynth';
import { useSequencer } from '../../hooks/useSequencer';
import { NodePosition } from '../../hooks/types';
import { ModulationButton } from './ModulationButton';
import { VerticalSlider } from './VerticalSlider';
import { HorizontalSlider } from './HorizontalSlider';
import { sliderToGain } from '../../hooks/constants';

const NUM_NODES = 16;
const BASE_NODE_SIZE = 16;
const MAX_SCALE = 3;
const BASE_RADIUS = 192; // Inner circle radius
const MAX_RADIUS = BASE_RADIUS + 96; // Outer circle radius

const DroneStation: React.FC = () => {
  const { audioRefs, isInitialized, initializeAudio, startAudio, stopAudio } = useEvolvingPad();
  const { availableNotes, getNextNote } = useChordProgression();
  const { triggerNote } = usePluckSynth();
  const [nodePositions, setNodePositions] = useState<NodePosition[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [isPaused, setIsPaused] = useState(true);
  const [oscillatorValues, setOscillatorValues] = useState([50, 50, 50]);
  const [ambientValue, setAmbientValue] = useState(50);
  const [isPlaying, setIsPlaying] = useState(false);

  // Initialize sequencer with node positions and note triggering
  const { activeStep } = useSequencer(nodePositions, availableNotes, triggerNote, getNextNote, !isPaused);

  useEffect(() => {
    // Initialize node positions in a circle
    const positions: NodePosition[] = [];
    for (let i = 0; i < NUM_NODES; i++) {
      positions.push({
        radius: BASE_RADIUS,
        probability: 0
      });
    }
    setNodePositions(positions);
  }, []);

  const handleStartClick = async () => {
    console.log('🎵 Starting audio...');
    try {
      await initializeAudio();
      setIsPlaying(true);
      setIsPaused(false);
      console.log('✓ Audio started!');
    } catch (error) {
      console.error('❌ Error starting audio:', error);
      setIsPlaying(false);
      setIsPaused(true);
    }
  };

  const handlePlayPause = async () => {
    console.log('🎮 Play/Pause triggered:', { isPaused });
    try {
      if (isPaused) {
        await startAudio();
        console.log('✓ Audio restarted');
        setIsPaused(false);
      } else {
        stopAudio();
        console.log('✓ Audio stopped');
        setIsPaused(true);
      }
    } catch (error) {
      console.error('❌ Error in play/pause:', error);
    }
  };

  const handleMouseDown = (index: number, event: React.MouseEvent) => {
    event.preventDefault();
    setIsDragging(true);
    setDragIndex(index);
    document.body.style.cursor = 'grabbing';
    document.body.style.userSelect = 'none';
  };

  const handleMouseMove = (event: React.MouseEvent) => {
    if (!isDragging || dragIndex === null) return;

    const rect = event.currentTarget.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    const mouseX = event.clientX - centerX;
    const mouseY = event.clientY - centerY;
    
    // Calculate angle of the node (fixed for the dragging node)
    const angle = (dragIndex / NUM_NODES) * 2 * Math.PI - Math.PI / 2;
    
    // Calculate the vector from center to mouse
    const mouseDistance = Math.sqrt(mouseX * mouseX + mouseY * mouseY);
    
    // Project the mouse position onto the node's radius line
    const nodeX = Math.cos(angle);
    const nodeY = Math.sin(angle);
    const projection = mouseX * nodeX + mouseY * nodeY;
    
    // Calculate normalized distance along the radius line
    const radiusRange = MAX_RADIUS - BASE_RADIUS;
    const clampedProjection = Math.max(BASE_RADIUS, Math.min(MAX_RADIUS, projection));
    const probability = (clampedProjection - BASE_RADIUS) / radiusRange;

    setNodePositions(prev => {
      const newPositions = [...prev];
      newPositions[dragIndex] = {
        radius: clampedProjection,
        probability
      };
      return newPositions;
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    setDragIndex(null);
    document.body.style.cursor = '';
    document.body.style.userSelect = '';
  };

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mouseup', handleMouseUp);
      window.addEventListener('mouseleave', handleMouseUp);
      return () => {
        window.removeEventListener('mouseup', handleMouseUp);
        window.removeEventListener('mouseleave', handleMouseUp);
      };
    }
  }, [isDragging]);

  const handleDroneMute = (index: number) => {
    console.log(`Muting drone ${index}`);
    if (audioRefs.envelopes.current) {
      audioRefs.envelopes.current[index]?.triggerRelease();
      audioRefs.envelopes.current[index + 3]?.triggerRelease();
      
      setTimeout(() => {
        if (audioRefs.oscillators.current && audioRefs.detunedOscillators.current) {
          audioRefs.oscillators.current[index]?.stop();
          audioRefs.detunedOscillators.current[index]?.stop();
        }
      }, 4500);
    }
  };

  // Update oscillator gains when values change
  useEffect(() => {
    if (!isInitialized || !audioRefs.droneGains.current) {
      console.log('Skipping gain update - not initialized');
      return;
    }

    console.log('Updating oscillator gains:', oscillatorValues);
    oscillatorValues.forEach((value, i) => {
      if (audioRefs.droneGains.current[i]) {
        const gain = sliderToGain(value, false);
        console.log(`Setting oscillator ${i} gain:`, { value, calculatedGain: gain });
        audioRefs.droneGains.current[i].gain.rampTo(gain, 0.1);
      }
    });
  }, [oscillatorValues, isInitialized, audioRefs.droneGains]);

  // Update ambient gain when value changes
  useEffect(() => {
    if (!isInitialized || !audioRefs.birdsGain.current) {
      console.log('Skipping ambient gain update - not initialized');
      return;
    }

    const gain = sliderToGain(ambientValue, true);
    console.log('Setting ambient gain:', { value: ambientValue, calculatedGain: gain });
    audioRefs.birdsGain.current.gain.rampTo(gain, 0.1);
  }, [ambientValue, isInitialized, audioRefs.birdsGain]);

  const handleRandomize = () => {
    // Randomize oscillator values
    const newOscillatorValues = oscillatorValues.map(() => 
      Math.floor(Math.random() * 101)
    );
    setOscillatorValues(newOscillatorValues);

    // Randomize ambient value
    setAmbientValue(Math.floor(Math.random() * 101));

    // Randomize node positions
    const newPositions = nodePositions.map(() => {
      const radius = BASE_RADIUS + (Math.random() * (MAX_RADIUS - BASE_RADIUS));
      return {
        radius,
        probability: (radius - BASE_RADIUS) / (MAX_RADIUS - BASE_RADIUS)
      };
    });
    setNodePositions(newPositions);
  };

  return (
    <div 
      data-drone-station
      className="min-h-screen bg-cover bg-center relative flex flex-col justify-end pb-16"
      style={{ backgroundImage: 'url(/chateau.png)' }}
    >
      {!isPlaying && !isInitialized && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm z-20">
          <button 
            className="px-8 py-4 bg-white/90 rounded-full text-lg font-medium shadow-lg hover:bg-white hover:scale-105 transition-all"
            onClick={handleStartClick}
          >
            Click to Start Audio
          </button>
        </div>
      )}
      
      <div className="absolute inset-0 bg-black/10 backdrop-blur-[2px]" />
      
      <div className="absolute top-0 left-0 right-0 text-center p-8">
        <h1 className="text-6xl text-white/90 tracking-wide">
          To Pause In Preignac
        </h1>
      </div>

      <div className="absolute inset-0 flex items-center justify-center">
        {/* Circular Nodes */}
        <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
          <div 
            className="relative w-[440px] h-[440px] pointer-events-auto"
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
          >
            {/* Draw the outer circle guide */}
            <div 
              className="absolute rounded-full border border-white/20"
              style={{
                width: `${MAX_RADIUS * 2}px`,
                height: `${MAX_RADIUS * 2}px`,
                left: '50%',
                top: '50%',
                transform: 'translate(-50%, -50%)'
              }}
            />
            
            {/* Draw the inner circle guide */}
            <div 
              className="absolute rounded-full border border-white/20"
              style={{
                width: `${BASE_RADIUS * 2}px`,
                height: `${BASE_RADIUS * 2}px`,
                left: '50%',
                top: '50%',
                transform: 'translate(-50%, -50%)'
              }}
            />

            {nodePositions.map((node, index) => {
              const angle = (index / NUM_NODES) * 2 * Math.PI - Math.PI / 2;
              const x = node.radius * Math.cos(angle);
              const y = node.radius * Math.sin(angle);
              
              const nodeSize = BASE_NODE_SIZE + (node.probability * (BASE_NODE_SIZE * MAX_SCALE - BASE_NODE_SIZE));
              const hitAreaSize = Math.max(nodeSize * 1.5, 24);

              return (
                <div
                  key={index}
                  className={`absolute rounded-full backdrop-blur-sm shadow-lg pointer-events-auto select-none ${
                    index === activeStep ? 'ring-2 ring-white' : ''
                  } ${isDragging && dragIndex === index ? 'scale-125 z-10' : ''}`}
                  style={{
                    width: `${hitAreaSize}px`,
                    height: `${hitAreaSize}px`,
                    left: '50%',
                    top: '50%',
                    transform: `translate(-50%, -50%) translate(${x}px, ${y}px)`,
                    cursor: isDragging && dragIndex === index ? 'grabbing' : 'grab',
                    touchAction: 'none',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: isDragging && dragIndex === index ? 10 : 1
                  }}
                  onMouseDown={(e) => handleMouseDown(index, e)}
                >
                  <div
                    className="rounded-full backdrop-blur-sm shadow-lg"
                    style={{
                      width: `${nodeSize}px`,
                      height: `${nodeSize}px`,
                      backgroundColor: `rgb(${255 - node.probability * 123}, ${229 - node.probability * 125}, ${217 - node.probability * 157})`,
                      transition: isDragging && dragIndex === index ? 'none' : 'all 0.1s ease-out'
                    }}
                  />
                </div>
              );
            })}
          </div>
        </div>
        
        {/* Controls */}
        <div className="absolute max-w-xl w-full px-8 space-y-8">
          <div className="flex justify-center gap-8">
            {oscillatorValues.map((value, i) => (
              <VerticalSlider
                key={i}
                value={value}
                onChange={(newValue) => {
                  const newValues = [...oscillatorValues];
                  newValues[i] = newValue;
                  setOscillatorValues(newValues);
                  
                  // Don't try to start oscillators here - they should already be running
                  // Just let the gain effect hook handle the volume
                }}
                color={[
                  'bg-sunrise-clouds/90',
                  'bg-sunrise-sun/90',
                  'bg-sunrise-accent/90'
                ][i]}
                index={i}
                onMute={handleDroneMute}
              />
            ))}
          </div>

          <HorizontalSlider value={ambientValue} onChange={setAmbientValue} />
        </div>
      </div>

      {isInitialized && (
        <div className="fixed bottom-8 right-8 z-20 flex gap-4 items-center">
          <ModulationButton
            label="random"
            color="bg-white/90"
            active={false}
            onClick={handleRandomize}
            title="Randomize all values"
          />
          <ModulationButton
            label="github"
            color="bg-white/90"
            active={false}
            onClick={() => window.open('https://github.com/lukecd/relaxation-station', '_blank')}
            title="View source on GitHub"
          />
          <ModulationButton
            label={!isPaused ? 'pause' : 'jouer'}
            color="bg-white/90"
            active={false}
            onClick={handlePlayPause}
            title={isPaused ? 'Play' : 'Pause'}
          />
        </div>
      )}
    </div>
  );
};

export default DroneStation; 