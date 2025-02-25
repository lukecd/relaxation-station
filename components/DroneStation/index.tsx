'use client';

import React, { useEffect, useState } from 'react';
import { useEvolvingPad } from '../../hooks/useEvolvingPad';
import { useChordProgression } from '../../hooks/useChordProgression';
import { usePluckSynth } from '../../hooks/usePluckSynth';
import { useSequencer } from '../../hooks/useSequencer';
import { NodePosition } from '../../hooks/types';
import { ModulationButton } from './ModulationButton';
import { VerticalSlider } from './VerticalSlider';
import { HorizontalSlider } from './HorizontalSlider';
import { sliderToGain } from '../../hooks/constants';
import { VOLUME_LEVELS } from '../../hooks/config';
import { useAutoModulation } from '../../hooks/useAutoModulation';

const NUM_NODES = 16;
const BASE_NODE_SIZE = 12;                // Base size for mobile
const MAX_SCALE = 2.5;                    // Scale multiplier
const BASE_RADIUS = 140;                  // Base radius for mobile
const MAX_RADIUS = BASE_RADIUS + 60;      // Max radius for mobile
const DESKTOP_BASE_RADIUS = 240;          // Base radius for desktop
const DESKTOP_MAX_RADIUS = DESKTOP_BASE_RADIUS + 96;  // Max radius for desktop

const DroneStation: React.FC = () => {
  const { audioRefs, isInitialized, initializeAudio, startAudio, stopAudio } = useEvolvingPad();
  const { availableNotes, getNextNote } = useChordProgression();
  const { triggerNote } = usePluckSynth(audioRefs.pluckSynth);
  const [nodePositions, setNodePositions] = useState<NodePosition[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [isPaused, setIsPaused] = useState(true);
  const [oscillatorValues, setOscillatorValues] = useState([50, 50, 50]);
  const [ambientValue, setAmbientValue] = useState(50);
  const [melodyValue, setMelodyValue] = useState(50);
  const [isPlaying, setIsPlaying] = useState(false);

  // Initialize sequencer with node positions and note triggering
  const { activeStep } = useSequencer(nodePositions, availableNotes, triggerNote, getNextNote, !isPaused);

  // Add auto-modulation
  useAutoModulation(nodePositions, setNodePositions, !isPaused);

  useEffect(() => {
    // Get initial radius based on screen size
    const isDesktop = window.innerWidth >= 768;
    const initialRadius = isDesktop ? DESKTOP_BASE_RADIUS : BASE_RADIUS;

    // Initialize node positions in a circle
    const positions: NodePosition[] = [];
    for (let i = 0; i < NUM_NODES; i++) {
      positions.push({
        radius: initialRadius,
        probability: 0
      });
    }
    setNodePositions(positions);
  }, []);

  const handleStartClick = async () => {
    await initializeAudio();
    setIsPlaying(true);
    setIsPaused(false);
  };

  const handlePlayPause = async () => {
    if (isPaused) {
      await startAudio();
      setIsPaused(false);
    } else {
      stopAudio();
      setIsPaused(true);
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
    const isDesktop = rect.width >= 500;
    
    const currentBaseRadius = isDesktop ? DESKTOP_BASE_RADIUS : BASE_RADIUS;
    const currentMaxRadius = isDesktop ? DESKTOP_MAX_RADIUS : MAX_RADIUS;
    
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    const mouseX = event.clientX - centerX;
    const mouseY = event.clientY - centerY;
    
    const angle = (dragIndex / NUM_NODES) * 2 * Math.PI - Math.PI / 2;
    
    const nodeX = Math.cos(angle);
    const nodeY = Math.sin(angle);
    const projection = mouseX * nodeX + mouseY * nodeY;
    
    const radiusRange = currentMaxRadius - currentBaseRadius;
    const clampedProjection = Math.max(currentBaseRadius, Math.min(currentMaxRadius, projection));
    const probability = (clampedProjection - currentBaseRadius) / radiusRange;

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
    if (audioRefs.envelopes.current) {
      audioRefs.envelopes.current[index]?.triggerRelease();
      audioRefs.envelopes.current[index + 3]?.triggerRelease();
      
      setTimeout(() => {
        if (audioRefs.oscillators.current && audioRefs.detunedOscillators.current) {
          audioRefs.oscillators.current[index]?.[0]?.stop();
          audioRefs.oscillators.current[index]?.[1]?.stop();
          audioRefs.detunedOscillators.current[index]?.[0]?.stop();
          audioRefs.detunedOscillators.current[index]?.[1]?.stop();
        }
      }, 4500);
    }
  };

  // Update oscillator gains when values change
  useEffect(() => {
    if (!isInitialized || !audioRefs.droneGains.current) return;

    oscillatorValues.forEach((value, i) => {
      if (audioRefs.droneGains.current[i]) {
        const gain = sliderToGain(value, false);
        audioRefs.droneGains.current[i].gain.rampTo(gain, 0.1);
      }
    });
  }, [oscillatorValues, isInitialized, audioRefs.droneGains]);

  // Update ambient gain when value changes
  useEffect(() => {
    if (!isInitialized || !audioRefs.birdsGain.current) return;

    const gain = sliderToGain(ambientValue, true);
    audioRefs.birdsGain.current.gain.rampTo(gain, 0.1);
  }, [ambientValue, isInitialized, audioRefs.birdsGain]);

  // Update effect for melody volume
  useEffect(() => {
    if (!isInitialized || !audioRefs.pluckSynth.current) return;
    
    const gain = sliderToGain(melodyValue, false);
    audioRefs.pluckSynth.current.volume.rampTo(20 * Math.log10(VOLUME_LEVELS.MELODY * gain), 0.1);
  }, [melodyValue, isInitialized, audioRefs.pluckSynth]);

  const handleRandomize = () => {
    // Helper function to get random value between 10-85
    const safeRandomValue = () => Math.floor(Math.random() * 76) + 10; // 76 + 10 = max of 85

    // Randomize oscillator values
    const newOscillatorValues = oscillatorValues.map(() => safeRandomValue());
    setOscillatorValues(newOscillatorValues);

    // Randomize ambient value
    setAmbientValue(safeRandomValue());

    // Randomize melody value
    setMelodyValue(safeRandomValue());

    // Get current radius values based on screen size
    const isDesktop = window.innerWidth >= 768;
    const currentBaseRadius = isDesktop ? DESKTOP_BASE_RADIUS : BASE_RADIUS;
    const currentMaxRadius = isDesktop ? DESKTOP_MAX_RADIUS : MAX_RADIUS;

    // Randomize node positions
    const newPositions = nodePositions.map(() => {
      const radius = currentBaseRadius + (Math.random() * (currentMaxRadius - currentBaseRadius));
      return {
        radius,
        probability: (radius - currentBaseRadius) / (currentMaxRadius - currentBaseRadius)
      };
    });
    setNodePositions(newPositions);
  };

  // Add touch handlers for nodes
  const handleTouchStart = (index: number, event: React.TouchEvent) => {
    event.preventDefault();
    setIsDragging(true);
    setDragIndex(index);
    document.body.style.userSelect = 'none';
  };

  const handleTouchMove = (event: React.TouchEvent) => {
    if (!isDragging || dragIndex === null) return;

    const rect = event.currentTarget.getBoundingClientRect();
    const isDesktop = rect.width >= 500;
    
    const currentBaseRadius = isDesktop ? DESKTOP_BASE_RADIUS : BASE_RADIUS;
    const currentMaxRadius = isDesktop ? DESKTOP_MAX_RADIUS : MAX_RADIUS;
    
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    const touch = event.touches[0];
    const mouseX = touch.clientX - centerX;
    const mouseY = touch.clientY - centerY;
    
    const angle = (dragIndex / NUM_NODES) * 2 * Math.PI - Math.PI / 2;
    
    const nodeX = Math.cos(angle);
    const nodeY = Math.sin(angle);
    const projection = mouseX * nodeX + mouseY * nodeY;
    
    const radiusRange = currentMaxRadius - currentBaseRadius;
    const clampedProjection = Math.max(currentBaseRadius, Math.min(currentMaxRadius, projection));
    const probability = (clampedProjection - currentBaseRadius) / radiusRange;

    setNodePositions(prev => {
      const newPositions = [...prev];
      newPositions[dragIndex] = {
        radius: clampedProjection,
        probability
      };
      return newPositions;
    });
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
      
      <div className="absolute top-0 left-0 right-0 text-center p-8 z-30">
        <h1 className="text-4xl md:text-6xl text-white/90 tracking-wide">
          To Pause In Preignac
        </h1>
      </div>

      <div className="absolute inset-0 flex items-center justify-center min-h-[600px]">
        {/* Circular Nodes */}
        <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
          <div 
            className="relative w-[300px] h-[300px] md:w-[500px] md:h-[500px] pointer-events-auto"
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleMouseUp}
            onTouchCancel={handleMouseUp}
          >
            {/* Draw the outer circle guide */}
            <div 
              className="absolute rounded-full border border-white/20 w-[400px] h-[400px] md:w-[672px] md:h-[672px]"
              style={{
                left: '50%',
                top: '50%',
                transform: 'translate(-50%, -50%)'
              }}
            />
            
            {/* Draw the inner circle guide */}
            <div 
              className="absolute rounded-full border border-white/20 w-[280px] h-[280px] md:w-[480px] md:h-[480px]"
              style={{
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
              const hitAreaSize = Math.max(nodeSize * 1.5, 20);

              return (
                <div
                  key={index}
                  className={`absolute rounded-full backdrop-blur-sm shadow-lg pointer-events-auto select-none 
                    ${index === activeStep ? 'ring ring-white md:ring-2' : ''} 
                    ${isDragging && dragIndex === index ? 'scale-110 md:scale-125 z-10' : ''}`}
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
                  onTouchStart={(e) => handleTouchStart(index, e)}
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
        <div className="absolute max-w-xl w-full px-4 md:px-8 space-y-4 md:space-y-8">
          <div className="flex justify-center gap-4 md:gap-8">
            {oscillatorValues.map((value, i) => (
              <VerticalSlider
                key={i}
                value={value}
                onChange={(newValue) => {
                  const newValues = [...oscillatorValues];
                  newValues[i] = newValue;
                  setOscillatorValues(newValues);
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

          <div className="space-y-2 md:space-y-4">
            <HorizontalSlider 
              value={ambientValue} 
              onChange={setAmbientValue}
              variant="ambient"
            />
            <HorizontalSlider 
              value={melodyValue} 
              onChange={setMelodyValue}
              variant="melody"
            />
          </div>
        </div>
      </div>

      {isInitialized && (
        <div className="fixed bottom-4 md:bottom-8 right-4 md:right-8 z-20 flex gap-2 md:gap-4 items-center">
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