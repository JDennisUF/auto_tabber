class AutoTabber {
    constructor() {
        this.audioCapture = null;
        this.noteMapper = null;
        this.tablatureDisplay = null;
        this.uiControls = null;
        
        this.init();
    }

    async init() {
        try {
            console.log('Initializing Auto Tabber...');
            
            // Initialize core components
            this.audioCapture = new AudioCapture();
            this.noteMapper = new NoteMapper();
            this.tablatureDisplay = new TablatureDisplay('tabCanvas');
            
            // Initialize UI controls
            this.uiControls = new UIControls(
                this.audioCapture,
                this.noteMapper,
                this.tablatureDisplay
            );
            
            console.log('Auto Tabber initialized successfully');
            
            // Add keyboard shortcuts
            this.setupKeyboardShortcuts();
            
        } catch (error) {
            console.error('Failed to initialize Auto Tabber:', error);
            this.showError('Initialization failed: ' + error.message);
        }
    }

    setupKeyboardShortcuts() {
        document.addEventListener('keydown', (event) => {
            // Space bar to start/stop
            if (event.code === 'Space' && !event.target.matches('input, textarea')) {
                event.preventDefault();
                if (this.uiControls.isListening) {
                    this.uiControls.stopListening();
                } else {
                    this.uiControls.startListening();
                }
            }
            
            // 'C' to clear
            if (event.code === 'KeyC' && event.ctrlKey) {
                event.preventDefault();
                this.uiControls.clearTablature();
            }
            
            // 'E' to export
            if (event.code === 'KeyE' && event.ctrlKey) {
                event.preventDefault();
                this.uiControls.exportTablature();
            }
        });
    }

    showError(message) {
        const errorDiv = document.createElement('div');
        errorDiv.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #f44336;
            color: white;
            padding: 15px;
            border-radius: 5px;
            z-index: 1000;
            max-width: 300px;
        `;
        errorDiv.textContent = message;
        
        document.body.appendChild(errorDiv);
        
        setTimeout(() => {
            document.body.removeChild(errorDiv);
        }, 5000);
    }

    // Public API methods
    startListening() {
        return this.uiControls.startListening();
    }

    stopListening() {
        return this.uiControls.stopListening();
    }

    clearTablature() {
        return this.uiControls.clearTablature();
    }

    exportTablature() {
        return this.uiControls.exportTablature();
    }

    getDetectedNotes() {
        return this.tablatureDisplay.notes;
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.autoTabber = new AutoTabber();
});

// Add help information
document.addEventListener('keydown', (event) => {
    if (event.code === 'F1') {
        event.preventDefault();
        alert(`Auto Tabber Keyboard Shortcuts:
        
Space - Start/Stop listening
Ctrl+C - Clear tablature
Ctrl+E - Export tablature
F1 - Show this help`);
    }
});