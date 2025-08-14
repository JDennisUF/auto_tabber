class TablatureDisplay {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');
        this.width = this.canvas.width;
        this.height = this.canvas.height;
        
        this.notes = [];
        this.currentPosition = 50; // Starting x position
        this.stringSpacing = 25;
        this.stringYPositions = this.calculateStringPositions();
        
        this.setupCanvas();
        this.drawStaticElements();
    }

    setupCanvas() {
        // Set up high DPI canvas
        const rect = this.canvas.getBoundingClientRect();
        const dpr = window.devicePixelRatio || 1;
        
        this.canvas.width = rect.width * dpr;
        this.canvas.height = rect.height * dpr;
        this.ctx.scale(dpr, dpr);
        
        this.canvas.style.width = rect.width + 'px';
        this.canvas.style.height = rect.height + 'px';
        
        this.width = rect.width;
        this.height = rect.height;
    }

    calculateStringPositions() {
        const centerY = this.height / 2;
        const totalHeight = 5 * this.stringSpacing;
        const startY = centerY - totalHeight / 2;
        
        return [
            startY,                    // String 1 (high E)
            startY + this.stringSpacing,     // String 2 (B)
            startY + this.stringSpacing * 2, // String 3 (G)
            startY + this.stringSpacing * 3, // String 4 (D)
            startY + this.stringSpacing * 4, // String 5 (A)
            startY + this.stringSpacing * 5  // String 6 (low E)
        ];
    }

    drawStaticElements() {
        this.ctx.clearRect(0, 0, this.width, this.height);
        
        // Draw string lines
        this.ctx.strokeStyle = '#333';
        this.ctx.lineWidth = 1;
        
        this.stringYPositions.forEach((y, index) => {
            this.ctx.beginPath();
            this.ctx.moveTo(30, y);
            this.ctx.lineTo(this.width - 30, y);
            this.ctx.stroke();
        });
        
        // Draw string labels
        this.ctx.fillStyle = '#666';
        this.ctx.font = '14px Arial';
        this.ctx.textAlign = 'right';
        
        const stringNames = ['E', 'B', 'G', 'D', 'A', 'E'];
        this.stringYPositions.forEach((y, index) => {
            this.ctx.fillText(stringNames[index], 25, y + 5);
        });
        
        // Draw fret markers at regular intervals
        this.ctx.fillStyle = '#ddd';
        for (let x = 100; x < this.width - 30; x += 60) {
            this.ctx.fillRect(x - 1, this.stringYPositions[0] - 10, 2, this.stringYPositions[5] - this.stringYPositions[0] + 20);
        }
    }

    addNote(fretPosition) {
        if (!fretPosition) return;
        
        const note = {
            string: fretPosition.string,
            fret: fretPosition.fret,
            x: this.currentPosition,
            timestamp: Date.now(),
            frequency: fretPosition.frequency
        };
        
        this.notes.push(note);
        this.drawNote(note);
        
        // Move cursor forward
        this.currentPosition += 40;
        
        // Scroll if needed
        if (this.currentPosition > this.width - 100) {
            this.scrollLeft();
        }
        
        this.drawCursor();
    }

    drawNote(note) {
        const y = this.stringYPositions[note.string - 1];
        const x = note.x;
        
        // Draw fret number
        this.ctx.fillStyle = '#000';
        this.ctx.font = 'bold 16px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText(note.fret.toString(), x, y + 5);
        
        // Draw note circle for open strings
        if (note.fret === 0) {
            this.ctx.strokeStyle = '#000';
            this.ctx.lineWidth = 2;
            this.ctx.beginPath();
            this.ctx.arc(x, y, 8, 0, 2 * Math.PI);
            this.ctx.stroke();
        }
    }

    drawCursor() {
        // Clear previous cursor
        this.drawStaticElements();
        
        // Redraw all notes
        this.notes.forEach(note => this.drawNote(note));
        
        // Draw current position cursor
        this.ctx.strokeStyle = '#ff0000';
        this.ctx.lineWidth = 2;
        this.ctx.beginPath();
        this.ctx.moveTo(this.currentPosition, this.stringYPositions[0] - 15);
        this.ctx.lineTo(this.currentPosition, this.stringYPositions[5] + 15);
        this.ctx.stroke();
    }

    scrollLeft() {
        const scrollAmount = 200;
        
        // Remove notes that are too far left
        this.notes = this.notes.filter(note => note.x > -50);
        
        // Shift all notes left
        this.notes.forEach(note => {
            note.x -= scrollAmount;
        });
        
        this.currentPosition -= scrollAmount;
        
        this.redraw();
    }

    redraw() {
        this.drawStaticElements();
        this.notes.forEach(note => this.drawNote(note));
        this.drawCursor();
    }

    clear() {
        this.notes = [];
        this.currentPosition = 50;
        this.drawStaticElements();
        this.drawCursor();
    }

    exportAsASCII() {
        // Create ASCII tablature representation
        const lines = ['e|', 'B|', 'G|', 'D|', 'A|', 'E|'];
        const sortedNotes = [...this.notes].sort((a, b) => a.x - b.x);
        
        let currentX = 0;
        sortedNotes.forEach(note => {
            const spacing = Math.max(1, Math.floor((note.x - currentX) / 20));
            
            lines.forEach((line, index) => {
                const stringNum = index + 1;
                if (stringNum === note.string) {
                    lines[index] += '-'.repeat(spacing - 1) + note.fret;
                } else {
                    lines[index] += '-'.repeat(spacing);
                }
            });
            
            currentX = note.x;
        });
        
        return lines.join('\n');
    }
}