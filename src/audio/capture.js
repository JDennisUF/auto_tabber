class AudioCapture {
    constructor() {
        this.audioContext = null;
        this.mediaStream = null;
        this.sourceNode = null;
        this.pitchDetector = null;
        this.isListening = false;
        this.onPitchDetected = null;
        
        this.setupAudioContext();
    }

    async setupAudioContext() {
        try {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            this.pitchDetector = new PitchDetector(this.audioContext);
        } catch (error) {
            console.error('Failed to create audio context:', error);
            throw new Error('Web Audio API not supported');
        }
    }

    async requestMicrophoneAccess() {
        try {
            const constraints = {
                audio: {
                    echoCancellation: false,
                    noiseSuppression: false,
                    autoGainControl: false,
                    sampleRate: 44100
                }
            };

            this.mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
            return true;
        } catch (error) {
            console.error('Microphone access denied:', error);
            return false;
        }
    }

    async startListening() {
        if (this.isListening) return;

        // Resume audio context if suspended
        if (this.audioContext.state === 'suspended') {
            await this.audioContext.resume();
        }

        const hasAccess = await this.requestMicrophoneAccess();
        if (!hasAccess) {
            throw new Error('Microphone access required');
        }

        // Create audio source from microphone
        this.sourceNode = this.audioContext.createMediaStreamSource(this.mediaStream);
        
        // Connect to pitch detector
        this.pitchDetector.connectInput(this.sourceNode);
        
        this.isListening = true;
        this.startPitchDetectionLoop();
        
        console.log('Audio capture started');
    }

    stopListening() {
        if (!this.isListening) return;

        this.isListening = false;

        // Stop media stream
        if (this.mediaStream) {
            this.mediaStream.getTracks().forEach(track => track.stop());
            this.mediaStream = null;
        }

        // Disconnect audio nodes
        if (this.sourceNode) {
            this.sourceNode.disconnect();
            this.sourceNode = null;
        }

        console.log('Audio capture stopped');
    }

    startPitchDetectionLoop() {
        const detectLoop = () => {
            if (!this.isListening) return;

            const pitchData = this.pitchDetector.detectPitch();
            
            if (pitchData && this.onPitchDetected) {
                this.onPitchDetected(pitchData);
            }

            // Continue loop
            requestAnimationFrame(detectLoop);
        };

        detectLoop();
    }

    setPitchCallback(callback) {
        this.onPitchDetected = callback;
    }

    getAudioContext() {
        return this.audioContext;
    }

    isSupported() {
        return !!(navigator.mediaDevices && 
                 navigator.mediaDevices.getUserMedia && 
                 (window.AudioContext || window.webkitAudioContext));
    }

    async testMicrophone() {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            stream.getTracks().forEach(track => track.stop());
            return true;
        } catch (error) {
            return false;
        }
    }
}