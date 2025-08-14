# Auto Tabber - Guitar Tablature Generator

A real-time web application that listens to guitar music and automatically generates tablature notation.

## Features

- **Real-time audio processing** using Web Audio API
- **Pitch detection** with autocorrelation algorithm
- **Automatic tablature generation** for standard guitar tuning
- **Interactive tablature display** with real-time visualization
- **Export functionality** to ASCII tab format
- **Keyboard shortcuts** for easy control

## Quick Start

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```
4. Open your browser to `http://localhost:8080`
5. Click "Start Listening" and allow microphone access
6. Play guitar and watch the tablature generate in real-time!

## How It Works

1. **Audio Capture**: Captures audio from your microphone using Web Audio API
2. **Pitch Detection**: Analyzes the audio using autocorrelation to detect fundamental frequencies
3. **Note Mapping**: Maps detected frequencies to guitar fret positions using standard tuning
4. **Tablature Display**: Visualizes the detected notes on a guitar tablature in real-time

## Browser Requirements

- Chrome 66+ (recommended)
- Firefox 60+
- Safari 14+
- Microphone access required

## Keyboard Shortcuts

- **Space** - Start/Stop listening
- **Ctrl+C** - Clear tablature
- **Ctrl+E** - Export tablature as text file
- **F1** - Show help

## Guitar Tuning

Currently supports standard guitar tuning:
- String 1 (High E): 329.63 Hz
- String 2 (B): 246.94 Hz  
- String 3 (G): 196.00 Hz
- String 4 (D): 146.83 Hz
- String 5 (A): 110.00 Hz
- String 6 (Low E): 82.41 Hz

## Usage Tips

- Play single notes clearly for best detection accuracy
- Ensure good microphone quality and minimal background noise
- The app works best with electric guitar through an amplifier
- Acoustic guitars may require closer microphone positioning

## Technical Details

- **Frontend**: Vanilla JavaScript, HTML5, CSS3
- **Audio Processing**: Web Audio API with autocorrelation pitch detection
- **Real-time Rendering**: Canvas API for tablature visualization
- **No external dependencies** for core functionality

## Contributing

This project is designed for educational and personal use. Feel free to fork and modify for your own needs.

## License

MIT License - see LICENSE file for details