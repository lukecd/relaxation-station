import { useEffect, useCallback } from 'react';
import * as Tone from 'tone';
import { NodePosition } from './types';

export const useAutoModulation = (
  nodePositions: NodePosition[],
  setNodePositions: React.Dispatch<React.SetStateAction<NodePosition[]>>,
  isPlaying: boolean
) => {
  const modulate = useCallback(() => {
    setNodePositions(prev => {
      return prev.map(node => {
        // Random value between -10 and +10
        const change = (Math.random() * 20 - 10) / 100;
        
        // Calculate new probability
        const newProbability = Math.max(0, Math.min(1, node.probability + change));
        
        // Calculate new radius based on probability
        const isDesktop = window.innerWidth >= 768;
        const baseRadius = isDesktop ? 240 : 140;
        const maxRadius = isDesktop ? 336 : 200;
        const radiusRange = maxRadius - baseRadius;
        
        return {
          radius: baseRadius + (radiusRange * newProbability),
          probability: newProbability
        };
      });
    });
  }, [setNodePositions]);

  useEffect(() => {
    if (!isPlaying) return;

    // Schedule modulation every 8 bars
    const modulationId = Tone.Transport.scheduleRepeat((time) => {
      modulate();
    }, '8m');

    return () => {
      Tone.Transport.clear(modulationId);
    };
  }, [isPlaying, modulate]);
}; 