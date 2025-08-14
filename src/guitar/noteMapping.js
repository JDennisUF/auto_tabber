class NoteMapper {
    constructor() {
        // NO MORE CACHED FREQUENCIES - calculate everything on demand
        // This eliminates any possibility of high fret numbers
        console.log("NoteMapper initialized - ONLY frets 0-4 allowed");
    }

    findBestFretPosition(frequency, tolerance = 10) {
        if (!GuitarTuning.isInGuitarRange(frequency)) {
            return null;
        }

        console.log(`\n=== ANALYZING FREQUENCY: ${frequency.toFixed(1)}Hz ===`);

        // Manually calculate frequencies for frets 0-4 ONLY
        const openStringFreqs = [82.41, 110.00, 146.83, 196.00, 246.94, 329.63];
        const matches = [];

        for (let stringNum = 1; stringNum <= 6; stringNum++) {
            const openFreq = openStringFreqs[stringNum - 1];
            
            for (let fret = 0; fret <= 4; fret++) { // ABSOLUTELY NO FRETS ABOVE 4
                // Calculate frequency for this fret position
                const fretFreq = openFreq * Math.pow(2, fret / 12);
                const difference = Math.abs(frequency - fretFreq);
                const percentDiff = (difference / fretFreq) * 100;

                if (percentDiff <= tolerance) {
                    console.log(`  Match: String ${stringNum}, Fret ${fret} = ${fretFreq.toFixed(1)}Hz (${percentDiff.toFixed(2)}% diff)`);
                    
                    // Simple scoring: heavily favor open strings
                    let score = percentDiff;
                    if (fret === 0) {
                        score *= 0.01; // Huge preference for open strings
                    }

                    matches.push({
                        string: stringNum,
                        fret: fret,
                        frequency: fretFreq,
                        difference: difference,
                        percentDiff: percentDiff,
                        preferenceScore: score
                    });
                }
            }
        }

        if (matches.length === 0) {
            console.log("  NO MATCHES FOUND");
            return null;
        }

        // Sort by preference score
        matches.sort((a, b) => a.preferenceScore - b.preferenceScore);
        
        const chosen = matches[0];
        console.log(`  CHOSEN: String ${chosen.string}, Fret ${chosen.fret} (score: ${chosen.preferenceScore.toFixed(4)})`);
        
        // SAFETY CHECK: Ensure fret is never above 4
        if (chosen.fret > 4) {
            console.error("CRITICAL ERROR: Fret above 4 detected!");
            return null;
        }

        return chosen;
    }

    findAllPossiblePositions(frequency, tolerance = 5) {
        // Use the same logic as findBestFretPosition but return all matches
        const openStringFreqs = [82.41, 110.00, 146.83, 196.00, 246.94, 329.63];
        const matches = [];

        for (let stringNum = 1; stringNum <= 6; stringNum++) {
            const openFreq = openStringFreqs[stringNum - 1];
            
            for (let fret = 0; fret <= 4; fret++) { // ABSOLUTELY NO FRETS ABOVE 4
                const fretFreq = openFreq * Math.pow(2, fret / 12);
                const difference = Math.abs(frequency - fretFreq);
                const percentDiff = (difference / fretFreq) * 100;

                if (percentDiff <= tolerance) {
                    let score = percentDiff;
                    if (fret === 0) {
                        score *= 0.01;
                    }

                    matches.push({
                        string: stringNum,
                        fret: fret,
                        frequency: fretFreq,
                        difference: difference,
                        percentDiff: percentDiff,
                        preferenceScore: score
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