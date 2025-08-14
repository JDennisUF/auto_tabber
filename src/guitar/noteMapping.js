class NoteMapper {
    constructor() {
        this.fretFrequencies = GuitarTuning.getAllFretFrequencies();
    }

    findBestFretPosition(frequency, tolerance = 10) {
        if (!GuitarTuning.isInGuitarRange(frequency)) {
            return null;
        }

        const matches = [];

        // Check all string/fret combinations
        for (let stringNum = 1; stringNum <= 6; stringNum++) {
            for (let fret = 0; fret <= 24; fret++) {
                const fretFreq = this.fretFrequencies[stringNum][fret];
                const difference = Math.abs(frequency - fretFreq);
                const percentDiff = (difference / fretFreq) * 100;

                if (percentDiff <= tolerance) {
                    matches.push({
                        string: stringNum,
                        fret: fret,
                        frequency: fretFreq,
                        difference: difference,
                        percentDiff: percentDiff
                    });
                }
            }
        }

        if (matches.length === 0) {
            return null;
        }

        // Sort by accuracy (smallest percentage difference)
        matches.sort((a, b) => a.percentDiff - b.percentDiff);

        // Prefer lower frets if multiple options exist
        const bestMatches = matches.filter(m => m.percentDiff === matches[0].percentDiff);
        bestMatches.sort((a, b) => a.fret - b.fret);

        return bestMatches[0];
    }

    findAllPossiblePositions(frequency, tolerance = 5) {
        const matches = [];

        for (let stringNum = 1; stringNum <= 6; stringNum++) {
            for (let fret = 0; fret <= 24; fret++) {
                const fretFreq = this.fretFrequencies[stringNum][fret];
                const difference = Math.abs(frequency - fretFreq);
                const percentDiff = (difference / fretFreq) * 100;

                if (percentDiff <= tolerance) {
                    matches.push({
                        string: stringNum,
                        fret: fret,
                        frequency: fretFreq,
                        difference: difference,
                        percentDiff: percentDiff
                    });
                }
            }
        }

        return matches.sort((a, b) => a.percentDiff - b.percentDiff);
    }

    getOptimalFingering(notes) {
        // For multiple notes, choose positions that minimize hand movement
        if (!Array.isArray(notes) || notes.length === 0) {
            return [];
        }

        if (notes.length === 1) {
            const position = this.findBestFretPosition(notes[0]);
            return position ? [position] : [];
        }

        // For chords, try to find positions within reasonable fret span
        const allPositions = notes.map(freq => this.findAllPossiblePositions(freq, 8));
        
        // Simple heuristic: minimize fret span
        let bestCombination = null;
        let minSpan = Infinity;

        const generateCombinations = (index, currentCombo) => {
            if (index === allPositions.length) {
                const frets = currentCombo.map(pos => pos.fret);
                const span = Math.max(...frets) - Math.min(...frets);
                
                if (span < minSpan && span <= 5) { // Reasonable hand span
                    minSpan = span;
                    bestCombination = [...currentCombo];
                }
                return;
            }

            for (const position of allPositions[index]) {
                // Check if this string is already used
                const stringUsed = currentCombo.some(pos => pos.string === position.string);
                if (!stringUsed) {
                    currentCombo.push(position);
                    generateCombinations(index + 1, currentCombo);
                    currentCombo.pop();
                }
            }
        };

        generateCombinations(0, []);
        return bestCombination || [];
    }
}