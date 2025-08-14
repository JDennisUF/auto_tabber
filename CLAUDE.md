# Auto Tabber - Guitar Tablature Generator

A web-based application that listens to music and automatically generates guitar tablature in real-time.

## Project Overview

This app uses Web Audio API to capture audio, analyzes it for guitar notes using pitch detection algorithms, and converts those notes into guitar tablature format showing string and fret positions.

## Technology Stack

- **Frontend**: HTML5, CSS3, JavaScript (ES6+)
- **Audio Processing**: Web Audio API, AudioContext
- **Pitch Detection**: YIN algorithm implementation or FFT-based analysis
- **UI Framework**: Vanilla JS or lightweight framework (TBD)
- **Visualization**: Canvas API or SVG for tablature display

## Key Components

### 1. Audio Capture Module
- Real-time microphone input via `getUserMedia()`
- Audio buffer processing with Web Audio API
- Configurable sample rate and buffer size

### 2. Pitch Detection Engine
- FFT analysis for frequency domain conversion
- YIN algorithm for fundamental frequency detection
- Guitar frequency range filtering (80Hz - 5kHz)
- Noise reduction and signal cleaning

### 3. Note-to-Tablature Mapper
- Standard guitar tuning: E2(82Hz), A2(110Hz), D3(147Hz), G3(196Hz), B3(247Hz), E4(330Hz)
- Fret position calculation algorithm
- Multiple position handling (choose optimal fingering)
- Chord detection and mapping

### 4. Tablature Display
- Real-time tablature visualization
- 6-string guitar representation
- Fret number display
- Timing and rhythm indicators

## Development Commands

```bash
# Start development server
npm run dev

# Run tests
npm test

# Build for production
npm run build

# Lint code
npm run lint

# Type check (if using TypeScript)
npm run typecheck
```

## File Structure

```
auto_tabber/
├── src/
│   ├── audio/
│   │   ├── capture.js          # Audio input handling
│   │   ├── processor.js        # Audio signal processing
│   │   └── pitchDetection.js   # Pitch detection algorithms
│   ├── guitar/
│   │   ├── tuning.js          # Guitar tuning definitions
│   │   ├── noteMapping.js     # Note-to-fret conversion
│   │   └── tablature.js       # Tablature generation logic
│   ├── ui/
│   │   ├── display.js         # Tablature visualization
│   │   ├── controls.js        # User interface controls
│   │   └── styles.css         # Application styling
│   └── main.js                # Application entry point
├── tests/
├── docs/
├── package.json
└── README.md
```

## Guitar Theory Reference

### Standard Tuning Frequencies (Hz)
- E2: 82.41 Hz (6th string, low E)
- A2: 110.00 Hz (5th string)
- D3: 146.83 Hz (4th string)
- G3: 196.00 Hz (3rd string)
- B3: 246.94 Hz (2nd string)
- E4: 329.63 Hz (1st string, high E)

### Fret Calculation
Each fret increases pitch by a semitone (factor of 2^(1/12) ≈ 1.059463)
Formula: frequency = open_string_freq × (2^(fret/12))

## Development Phases

### Phase 1: MVP (Minimum Viable Product)
- [ ] Basic audio capture
- [ ] Simple pitch detection
- [ ] Single note tablature display
- [ ] Standard tuning only

### Phase 2: Enhanced Features
- [ ] Improved pitch detection accuracy
- [ ] Chord detection
- [ ] Multiple tuning support
- [ ] Recording and playback

### Phase 3: Advanced Features
- [ ] Export functionality (PDF, Guitar Pro)
- [ ] Rhythm detection
- [ ] Multiple guitar parts
- [ ] Machine learning improvements

## Testing Strategy

- Unit tests for pitch detection algorithms
- Integration tests for audio processing pipeline
- Browser compatibility testing
- Performance testing with real audio samples

## Performance Considerations

- Use Web Workers for heavy audio processing
- Optimize FFT size for real-time performance
- Implement audio buffer recycling
- Consider WebAssembly for pitch detection algorithms

## Browser Requirements

- Modern browser with Web Audio API support
- Microphone access permissions
- Minimum Chrome 66+, Firefox 60+, Safari 14+

## Security Notes

- Requires user permission for microphone access
- No audio data stored or transmitted
- Client-side processing only