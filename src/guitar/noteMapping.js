class NoteMapper {
    constructor() {
        this.fretFrequencies = GuitarTuning.getAllFretFrequencies();
    }

    findBestFretPosition(frequency, tolerance = 10) {
        if (!GuitarTuning.isInGuitarRange(frequency)) {
            return null;
        }

        const matches = [];

        // Check all string/fret combinations, prioritizing lower frets
        for (let stringNum = 1; stringNum <= 6; stringNum++) {
            for (let fret = 0; fret <= 24; fret++) {
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
                    // Strong preference for first 5 frets
                    else if (fret <= 5) {
                        preferenceScore *= 0.1; // Strong bonus for low frets
                    }
                    // Moderate preference for frets 6-12
                    else if (fret <= 12) {
                        preferenceScore *= 1.0; // Normal scoring
                    }
                    // Heavy penalty for high frets
                    else {
                        preferenceScore *= 10.0; // Heavy penalty for high frets
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
                    `String ${m.string} Fret ${m.fret} (${m.percentDiff.toFixed(2)}% diff, score: ${m.preferenceScore.toFixed(3)})`
                )
            );
            console.log(`Chosen: String ${matches[0].string}, Fret ${matches[0].fret}`);
        }

        return matches[0];
    }

    findAllPossiblePositions(frequency, tolerance = 5) {
        const matches = [];

        for (let stringNum = 1; stringNum <= 6; stringNum++) {
            for (let fret = 0; fret <= 24; fret++) {
                const fretFreq = this.fretFrequencies[stringNum][fret];
                const difference = Math.abs(frequency - fretFreq);
                const percentDiff = (difference / fretFreq) * 100;

                if (percentDiff <= tolerance) {
                    // Apply same preference scoring as findBestFretPosition
                    let preferenceScore = percentDiff;
                    
                    if (fret === 0) {
                        preferenceScore *= 0.01;
                    } else if (fret <= 5) {
                        preferenceScore *= 0.1;
                    } else if (fret <= 12) {
                        preferenceScore *= 1.0;
                    } else {
                        preferenceScore *= 10.0;
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