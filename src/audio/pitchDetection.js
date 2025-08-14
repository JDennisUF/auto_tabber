class PitchDetector {
    constructor(audioContext, bufferSize = 4096) {
        this.audioContext = audioContext;
        this.bufferSize = bufferSize;
        this.sampleRate = audioContext.sampleRate;
        
        // Lower threshold for better open string detection
        this.threshold = 0.05;
        this.probabilityThreshold = 0.01;
        
        // Open string frequencies for reference
        this.openStringFreqs = [82.41, 110.00, 146.83, 196.00, 246.94, 329.63];
        
        this.setupAnalyser();
    }

    setupAnalyser() {
        this.analyser = this.audioContext.createAnalyser();
        this.analyser.fftSize = this.bufferSize;
        this.analyser.smoothingTimeConstant = 0.8;
        
        this.dataArray = new Float32Array(this.bufferSize);
        this.frequencyData = new Uint8Array(this.analyser.frequencyBinCount);
    }

    connectInput(inputNode) {
        inputNode.connect(this.analyser);
    }

    // Autocorrelation-based pitch detection
    detectPitch() {
        this.analyser.getFloatTimeDomainData(this.dataArray);
        
        const pitch = this.autoCorrelate(this.dataArray);
        
        // Validate pitch is in guitar range
        if (pitch && GuitarTuning.isInGuitarRange(pitch)) {
            return {
                frequency: pitch,
                confidence: this.calculateConfidence(this.dataArray, pitch),
                timestamp: Date.now()
            };
        }
        
        return null;
    }

    autoCorrelate(buffer) {
        const SIZE = buffer.length;
        const MAX_SAMPLES = Math.floor(SIZE / 2);
        let bestOffset = -1;
        let bestCorrelation = 0;
        let rms = 0;
        let foundGoodCorrelation = false;
        const correlations = new Array(MAX_SAMPLES);

        // Calculate RMS
        for (let i = 0; i < SIZE; i++) {
            const val = buffer[i];
            rms += val * val;
        }
        rms = Math.sqrt(rms / SIZE);
        
        if (rms < 0.01) return null; // Signal too quiet

        // Autocorrelation
        let lastCorrelation = 1;
        for (let offset = 0; offset < MAX_SAMPLES; offset++) {
            let correlation = 0;

            for (let i = 0; i < MAX_SAMPLES; i++) {
                correlation += Math.abs((buffer[i]) - (buffer[i + offset]));
            }
            correlation = 1 - (correlation / MAX_SAMPLES);
            correlations[offset] = correlation;

            // Check for good correlation
            if (correlation > this.threshold && correlation > lastCorrelation) {
                foundGoodCorrelation = true;
                if (correlation > bestCorrelation) {
                    bestCorrelation = correlation;
                    bestOffset = offset;
                }
            } else if (foundGoodCorrelation) {
                // Past the peak, stop looking
                break;
            }
            lastCorrelation = correlation;
        }

        if (bestCorrelation > this.threshold && bestOffset !== -1) {
            const frequency = this.sampleRate / bestOffset;
            return frequency;
        }
        
        return null;
    }

    calculateConfidence(buffer, frequency) {
        if (!frequency) return 0;
        
        // Signal strength component
        let rms = 0;
        for (let i = 0; i < buffer.length; i++) {
            rms += buffer[i] * buffer[i];
        }
        rms = Math.sqrt(rms / buffer.length);
        
        let confidence = Math.min(rms * 10, 1);
        
        // Boost confidence for open string frequencies
        const isNearOpenString = this.openStringFreqs.some(openFreq => 
            Math.abs(frequency - openFreq) / openFreq < 0.05
        );
        
        if (isNearOpenString) {
            confidence *= 1.5; // Boost confidence for open strings
        }
        
        return Math.min(confidence, 1);
    }

    // FFT-based frequency analysis for validation
    getFrequencySpectrum() {
        this.analyser.getByteFrequencyData(this.frequencyData);
        
        const spectrum = [];
        const binWidth = this.sampleRate / (2 * this.frequencyData.length);
        
        for (let i = 0; i < this.frequencyData.length; i++) {
            const frequency = i * binWidth;
            const magnitude = this.frequencyData[i];
            
            if (magnitude > 0 && GuitarTuning.isInGuitarRange(frequency)) {
                spectrum.push({ frequency, magnitude });
            }
        }
        
        return spectrum.sort((a, b) => b.magnitude - a.magnitude);
    }

    findPeaks(spectrum, minMagnitude = 50) {
        return spectrum.filter(bin => bin.magnitude > minMagnitude)
                      .slice(0, 5); // Top 5 peaks
    }
}