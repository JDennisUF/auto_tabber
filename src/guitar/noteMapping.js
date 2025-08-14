class NoteMapper {
    constructor() {
        this.fretFrequencies = GuitarTuning.getAllFretFrequencies();
    }

    findBestFretPosition(frequency, tolerance = 10) {
        if (!GuitarTuning.isInGuitarRange(frequency)) {
            return null;
        }

        // First, check if this is very close to an open string frequency
        const openStrings = [
            { string: 6, frequency: 82.41 },   // Low E
            { string: 5, frequency: 110.00 },  // A
            { string: 4, frequency: 146.83 },  // D
            { string: 3, frequency: 196.00 },  // G
            { string: 2, frequency: 246.94 },  // B
            { string: 1, frequency: 329.63 }   // High E
        ];

        // Check for exact open string matches first
        for (const openString of openStrings) {
            const percentDiff = Math.abs(frequency - openString.frequency) / openString.frequency * 100;
            if (percentDiff <= 2.0) { // Very tight tolerance for open strings
                console.log(`Direct open string match: ${frequency.toFixed(1)}Hz -> String ${openString.string}, Fret 0 (${percentDiff.toFixed(2)}% diff)`);
                return {
                    string: openString.string,
                    fret: 0,
                    frequency: openString.frequency,
                    difference: Math.abs(frequency - openString.frequency),
                    percentDiff: percentDiff,
                    preferenceScore: percentDiff * 0.001
                };
            }
        }

        const matches = [];

        // ONLY check frets 0-5 to keep tablature in open position
        for (let stringNum = 1; stringNum <= 6; stringNum++) {
            for (let fret = 0; fret <= 5; fret++) { // STRICT: Only first 5 frets
                const fretFreq = this.fretFrequencies[stringNum][fret];
                const difference = Math.abs(frequency - fretFreq);
                const percentDiff = (difference / fretFreq) * 100;

                if (percentDiff <= tolerance) {
                    // Calculate preference score heavily favoring lower frets
                    let preferenceScore = percentDiff;
                    
                    // Massive preference for open strings (fret 0)
                    if (fret === 0) {
                        preferenceScore *= 0.01; // Huge bonus for open strings
                    }
                    // Preference for frets 1-5
                    else {
                        preferenceScore *= 1.0; // Normal scoring for frets 1-5
                    }

                    matches.push({
                        string: stringNum,
                        fret: fret,
                        frequency: fretFreq,
                        difference: difference,
                        percentDiff: percentDiff,
                        preferenceScore: preferenceScore
                    });
                }
            }
        }

        if (matches.length === 0) {
            return null;
        }

        // Sort by preference score (lower is better)
        matches.sort((a, b) => a.preferenceScore - b.preferenceScore);

        // Debug logging to see what's being chosen
        if (matches.length > 0) {
            console.log(`Frequency ${frequency.toFixed(1)}Hz matches:`, 
                matches.slice(0, 3).map(m => 
                    `String ${m.string} Fret ${m.fret} (${m.percentDiff.toFixed(2)}% diff, score: ${m.preferenceScore.toFixed(4)})`
                )
            );
            console.log(`Chosen: String ${matches[0].string}, Fret ${matches[0].fret}`);
        }

        return matches[0];
    }

    findAllPossiblePositions(frequency, tolerance = 5) {
        const matches = [];

        // ONLY check frets 0-5 to keep tablature in open position
        for (let stringNum = 1; stringNum <= 6; stringNum++) {
            for (let fret = 0; fret <= 5; fret++) { // STRICT: Only first 5 frets
                const fretFreq = this.fretFrequencies[stringNum][fret];
                const difference = Math.abs(frequency - fretFreq);
                const percentDiff = (difference / fretFreq) * 100;

                if (percentDiff <= tolerance) {
                    // Apply same preference scoring as findBestFretPosition
                    let preferenceScore = percentDiff;
                    
                    if (fret === 0) {
                        preferenceScore *= 0.01;
                    } else {
                        preferenceScore *= 1.0;
                    }

                    matches.push({
                        string: stringNum,
                        fret: fret,
                        frequency: fretFreq,
                        difference: difference,
                        percentDiff: percentDiff,
                        preferenceScore: preferenceScore
                    });
                }
            }
        }

        return matches.sort((a, b) => a.preferenceScore - b.preferenceScore);
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