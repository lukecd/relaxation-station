# To Pause In Preignac

*Gentle birdsong floats  
Through ancient village whispers  
Time dissolves in peace*

An ambient generative synthesizer for finding flow, focus, and tranquility in your daily work. Created in the heart of Bordeaux wine country, this application weaves together evolving drone sounds, bird songs recorded in the village of Preignac, and carefully crafted frequencies to create a sonic environment conducive to deep work and meditation.

🎧 **Best experienced with headphones** for full stereo immersion.

🌐 [Visit the Live Site](https://relaxation-station.vercel.app)

## Built With

- [Tone.js](https://tonejs.github.io/) - A framework for creating interactive music in the browser
- [Tonal.js](https://github.com/tonaljs/tonal) - A functional music theory library
- [Next.js](https://nextjs.org/) - The React framework for production
- [TypeScript](https://www.typescriptlang.org/) - Type safety for complex audio systems
- [Tailwind CSS](https://tailwindcss.com/) - A utility-first CSS framework
- [shadcn/ui](https://ui.shadcn.com/) - Re-usable UI components

## The Vision

*Morning mist rises  
Over Preignac's old stones  
Nature's symphony*

This project was born in a small village in the Sauternes region of France, where the morning chorus of birds and the gentle pace of life inspired a different way of working. The ambient sounds were recorded during dawn in Preignac, capturing a moment of natural tranquility that now forms the foundation of this generative soundscape.

Research has shown that certain types of ambient sound can enhance focus and creativity:
- Natural sounds like birdsong have been linked to improved cognitive function and stress reduction
- Gentle, evolving drones help maintain a consistent state of focus without causing audio fatigue
- Subtle stereo movement in sound can create a more immersive, meditation-like listening experience

## Technical Architecture

*Code flows like water  
Through circuits of light and sound  
Music from logic*

Built with modern web audio technologies, this application combines a sophisticated audio engine with an intuitive user interface. The architecture is designed to be modular and extensible, with each component handling a specific aspect of the sound generation and processing.

### Audio Engine
- Custom wavetable synthesis for rich, evolving drones
- Multi-layered oscillator system with subtle detuning
- Spatial audio design with careful stereo field placement
- Modulation system for organic evolution of sound

### Musical Theory
The application is centered around the E Phrygian mode, chosen for its contemplative and meditative qualities. The Phrygian mode, with its characteristic lowered second degree, creates a sense of gentle tension and resolution that's particularly suited for ambient music. In our implementation:

- The root E provides a stable foundation
- The F-E movement creates a subtle, meditative tension
- The modal mixture allows for evolving harmonic textures
- The scale's minor qualities blend naturally with environmental sounds

### Key Components

#### Evolving Pad Synthesizer
- Three distinct voices using custom wavetable synthesis
- Each voice consists of four oscillators (two pairs with subtle detuning)
- Careful harmonic spacing across the stereo field
- Individual envelope control for organic evolution

#### Ambient Sound Integration
- High-quality bird recordings from Preignac
- Dynamic playback system with randomized timing
- Spatial positioning to match natural sound staging
- Gentle volume modulation for natural feel

#### Interactive Melody System
- Probability-based note triggering
- Node-based interface for user interaction
- Musical constraints ensuring harmonic coherence
- Velocity-sensitive timing for organic feel

#### Effects Processing
- Reverb with carefully tuned decay and diffusion
- Tempo-synced delay for spatial enhancement
- Subtle chorus for additional width
- Master bus processing for cohesive sound

### Technical Implementation
The audio engine is built around several key React hooks that manage different aspects of the sound:

```typescript
useEvolvingPad    // Manages the main drone sounds
useChordProgression // Handles harmonic progression
usePluckSynth     // Controls the melodic elements
useSequencer      // Manages timing and triggering
```

Each component is designed to be modular and self-contained, while working together to create a cohesive sonic environment.

## Usage Guide

*Touch the glowing orbs  
Sound ripples through space and time  
Find your flow state here*

### Getting Started
1. Click the "Start Audio" button to initialize the sound engine
2. Allow a moment for the ambient sounds to fade in
3. Use the three vertical sliders to control the volume of each drone voice
4. The horizontal slider controls the ambient bird sounds

### Interactive Nodes
- Drag the nodes outward to increase their probability of triggering
- Nodes closer to the center are less likely to trigger
- Each node represents a potential note in the current chord
- The melody evolves based on your node arrangement

### Controls
- **Vertical Sliders**: Control individual drone volumes
- **Horizontal Slider**: Adjust bird song volume
- **Mute Buttons**: Below each slider to silence individual voices
- **Random Button**: Randomize all settings for new variations
- **Play/Pause**: Toggle the generative melody system

### Tips for Best Experience
- Use headphones to experience the full stereo field
- Start with lower volumes and adjust to taste
- Try different combinations of drones for varied textures
- Let the sounds evolve naturally over time

## Installation

*New code takes root now  
Dependencies align true  
Ready to begin*

### Prerequisites
- Node.js 18.17 or later
- npm or yarn
- Git

### Local Development
1. Clone the repository:
```bash
git clone https://github.com/lukecd/relaxation-station.git
cd relaxation-station
```

2. Install dependencies:
```bash
npm install
# or
yarn
```

3. Start the development server:
```bash
npm run dev
# or
yarn dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

### Building for Production
```bash
npm run build
# or
yarn build
```

## Contributing

*Many hands create  
Symphonies of ones and zeroes  
Join our flowing stream*

Contributions are welcome! Here's how you can help:

### Areas for Contribution
- 🎵 New sound design ideas
- 🎨 UI/UX improvements
- 🐛 Bug fixes
- 📝 Documentation
- ✨ New features

### Development Process
1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

### Code Style
- Use TypeScript for all new code
- Follow the existing project structure
- Add comments for complex audio processing
- Include types for all functions and variables

### Audio Guidelines
- Maintain the peaceful, ambient nature of the application
- Test all audio changes with headphones
- Consider CPU performance with audio processing
- Document any new audio parameters

## License

MIT License - feel free to use this code for your own projects.

---

Created with love, code, and birdsong in Preignac, France. 🍷 🎵 ✨

*In the morning mist  
Code and music intertwine  
Peace flows endlessly*
