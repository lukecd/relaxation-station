# To Pause In Preignac
![](/assets/ui.png)

>Gentle birdsong floats  
Through ancient village whispers  
Time dissolves in peace

An ambient generative synthesizer for finding flow, focus, and tranquility in your daily work. Created in the heart of Bordeaux, this app weaves together evolving drone sounds, bird songs recorded in the village of Preignac, and carefully crafted frequencies to create a sonic environment conducive to deep work and meditation.

🎧 **Best experienced with headphones** for full stereo immersion.

## Overview

This web application creates an evolving soundscape using:
- Three drone oscillators with independent volume control
- Ambient bird sounds that fade in and out
- A 16-step probabilistic sequencer for melodic patterns
- All sounds are processed through reverb, delay, and modulation effects

## Usage Guide

>Touch the glowing orbs  
>Sound ripples through space and time  
Find your flow state here

## Getting Started

1. Visit [To Pause In Preignac](https://relax.luke.gallery/)
2. Click "Start Audio" to initialize the sound engine
3. Adjust volumes and experiment with the sequencer nodes
4. Use the pause/play button to stop and start the audio

## Controls

### Volume Controls
- **Vertical Sliders**: Control individual drone oscillator volumes
- **Top Horizontal Slider**: Controls ambient bird sound volume
- **Bottom Horizontal Slider**: Controls melody sequence volume
- **Mute Buttons**: Below each vertical slider to silence individual drones

### Sequencer
- **Circular Nodes**: Drag nodes outward to increase their probability of triggering
- The further out a node is placed, the:
  - More likely it is to trigger a note
  - Larger intervals it can create in the melody
  - More intense its color becomes

### Global Controls
- **Random**: Safely randomizes all parameters
  - Sets volumes between 10-85% to avoid sudden loud changes
  - Randomizes node positions and probabilities
  - Maintains musical coherence while creating variation
- **Pause/Play**: Toggles the entire soundscape
- **GitHub**: Links to this repository

### Tips for Best Experience
- Use headphones to experience the full stereo field
- Start with lower volumes and adjust to taste
- Try different combinations of drones for varied textures
- Let the sounds evolve naturally over time

## Musical Structure

>Ancient modes unfold  
Like petals in morning light  
Each note finds its place

The piece is in E Phrygian mode, progressing through a series of chords:
- Em (root chord)
- F (flat II)
- Gm (minor III)
- Am (minor IV)
- Bdim (diminished V)
- C (flat VI)
- Dm (minor VII)

The melody favors chord tones (3x probability) over scale tones, creating a consonant but evolving pattern.

## Sound Design Research

>Ancient wisdom meets  
Modern understanding of  
How sound heals minds

The sound design in this project is informed by research into the effects of different frequencies and sound patterns on cognitive states:

### Drone Frequencies
- **Root Chord (Em)**: E2 (82.41 Hz), G2 (98 Hz), B2 (123.47 Hz)
- Each note has slightly detuned pairs (-3 and +3 cents) for richer texture
- Chord progression moves through the Phrygian mode, maintaining these harmonic relationships

### Ambient Elements
- Bird songs recorded in Preignac - Studies show nature sounds reduce stress
- Gentle amplitude modulation (0.1-0.5 Hz) - Mimics natural breathing patterns
- Spatial movement through stereo field - Creates sense of space and openness

### Processing
- Long reverb tails (8s) with modulation - Promotes theta brainwave states
- Soft high-cut filtering - Reduces listening fatigue
- Careful gain staging - Maintains consistent, comfortable volume levels

## Technical Details

>Silicon dreams flow  
>Through circuits of light and code  
>Music takes new form

Built with:
- Next.js
- Tone.js
- Tailwind CSS
- TypeScript

## License

>Free as birdsong flows  
Through morning mist in spring time  
Share and help life bloom

MIT
