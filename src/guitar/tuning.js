class GuitarTuning {
    static STANDARD_TUNING = {
        strings: [
            { note: 'E', octave: 4, frequency: 329.63, stringNumber: 1 }, // High E
            { note: 'B', octave: 3, frequency: 246.94, stringNumber: 2 },
            { note: 'G', octave: 3, frequency: 196.00, stringNumber: 3 },
            { note: 'D', octave: 3, frequency: 146.83, stringNumber: 4 },
            { note: 'A', octave: 2, frequency: 110.00, stringNumber: 5 },
            { note: 'E', octave: 2, frequency: 82.41, stringNumber: 6 }   // Low E
        ]
    };

    static getStringFrequency(stringNumber, fret = 0) {
        const string = this.STANDARD_TUNING.strings.find(s => s.stringNumber === stringNumber);
        if (!string) return null;
        
        // Each fret increases frequency by 2^(1/12)
        return string.frequency * Math.pow(2, fret / 12);
    }

    static getAllFretFrequencies() {
        const frequencies = {};
        
        for (let stringNum = 1; stringNum <= 6; stringNum++) {
            frequencies[stringNum] = {};
            for (let fret = 0; fret <= 24; fret++) {
                frequencies[stringNum][fret] = this.getStringFrequency(stringNum, fret);
            }
        }
        
        return frequencies;
    }

    static frequencyToNote(frequency) {
        const A4 = 440;
        const noteNames = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
        
        if (frequency <= 0) return null;
        
        const semitoneFromA4 = Math.round(12 * Math.log2(frequency / A4));
        const octave = Math.floor((semitoneFromA4 + 9) / 12) + 4;
        const noteIndex = ((semitoneFromA4 % 12) + 12 + 9) % 12;
        
        return {
            note: noteNames[noteIndex],
            octave: octave,
            frequency: frequency
        };
    }

    static isInGuitarRange(frequency) {
        return frequency >= 80 && frequency <= 1200; // Typical guitar frequency range
    }
}