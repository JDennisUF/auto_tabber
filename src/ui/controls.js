class UIControls {
    constructor(audioCapture, noteMapper, tablatureDisplay) {
        this.audioCapture = audioCapture;
        this.noteMapper = noteMapper;
        this.tablatureDisplay = tablatureDisplay;
        
        this.startBtn = document.getElementById('startBtn');
        this.stopBtn = document.getElementById('stopBtn');
        this.clearBtn = document.getElementById('clearBtn');
        
        this.statusDisplay = document.getElementById('statusDisplay');
        this.frequencyDisplay = document.getElementById('frequencyDisplay');
        this.noteDisplay = document.getElementById('noteDisplay');
        
        this.isListening = false;
        this.lastDetectedTime = 0;
        this.noteBuffer = [];
        
        this.setupEventListeners();
        this.checkBrowserSupport();
    }

    setupEventListeners() {
        this.startBtn.addEventListener('click', () => this.startListening());
        this.stopBtn.addEventListener('click', () => this.stopListening());
        this.clearBtn.addEventListener('click', () => this.clearTablature());
        
        // Set up pitch detection callback
        this.audioCapture.setPitchCallback((pitchData) => this.handlePitchDetection(pitchData));
    }

    async checkBrowserSupport() {
        if (!this.audioCapture.isSupported()) {
            this.updateStatus('Browser not supported', 'error');
            this.startBtn.disabled = true;
            return;
        }

        const micAvailable = await this.audioCapture.testMicrophone();
        if (!micAvailable) {
            this.updateStatus('Microphone access required', 'warning');
        } else {
            this.updateStatus('Ready to listen');
        }
    }

    async startListening() {
        try {
            this.updateStatus('Starting audio capture...');
            
            await this.audioCapture.startListening();
            
            this.isListening = true;
            this.startBtn.disabled = true;
            this.stopBtn.disabled = false;
            
            this.updateStatus('Listening for guitar notes...', 'success');
        } catch (error) {
            console.error('Failed to start listening:', error);
            this.updateStatus(`Error: ${error.message}`, 'error');
        }
    }

    stopListening() {
        this.audioCapture.stopListening();
        
        this.isListening = false;
        this.startBtn.disabled = false;
        this.stopBtn.disabled = true;
        
        this.updateStatus('Stopped listening');
        this.updateFrequencyDisplay('--');
        this.updateNoteDisplay('--');
    }

    clearTablature() {
        this.tablatureDisplay.clear();
        this.noteBuffer = [];
        this.updateStatus(this.isListening ? 'Listening for guitar notes...' : 'Ready to listen');
    }

    handlePitchDetection(pitchData) {
        if (!this.isListening) return;

        const { frequency, confidence, timestamp } = pitchData;
        
        // Update frequency display
        this.updateFrequencyDisplay(`${frequency.toFixed(1)} Hz`);
        
        // Convert frequency to note
        const noteInfo = GuitarTuning.frequencyToNote(frequency);
        if (noteInfo) {
            this.updateNoteDisplay(`${noteInfo.note}${noteInfo.octave}`);
        }
        
        // Only process if confidence is high enough
        if (confidence < 0.3) return;
        
        // Debounce rapid detections
        if (timestamp - this.lastDetectedTime < 200) return;
        
        // Find best fret position
        const fretPosition = this.noteMapper.findBestFretPosition(frequency, 15);
        
        if (fretPosition) {
            console.log(`Detected: ${frequency.toFixed(1)}Hz -> String ${fretPosition.string}, Fret ${fretPosition.fret}`);
            
            // Add to tablature
            this.tablatureDisplay.addNote(fretPosition);
            
            // Update status with detected note
            this.updateStatus(`Note detected: String ${fretPosition.string}, Fret ${fretPosition.fret}`, 'success');
            
            this.lastDetectedTime = timestamp;
        }
    }

    updateStatus(message, type = 'info') {
        this.statusDisplay.textContent = message;
        this.statusDisplay.className = `status-${type}`;
        
        // Auto-clear success messages after 3 seconds
        if (type === 'success') {
            setTimeout(() => {
                if (this.isListening) {
                    this.updateStatus('Listening for guitar notes...');
                }
            }, 3000);
        }
    }

    updateFrequencyDisplay(text) {
        this.frequencyDisplay.textContent = `Frequency: ${text}`;
    }

    updateNoteDisplay(text) {
        this.noteDisplay.textContent = `Note: ${text}`;
    }

    exportTablature() {
        const ascii = this.tablatureDisplay.exportAsASCII();
        
        // Create download link
        const blob = new Blob([ascii], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = `tablature_${new Date().toISOString().slice(0, 10)}.txt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        
        URL.revokeObjectURL(url);
    }
}