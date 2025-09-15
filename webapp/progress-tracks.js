// Progress Track Management System
class ProgressTrack {
    constructor(options = {}) {
        this.id = options.id || this.generateId();
        this.label = options.label || 'New Progress Track';
        this.type = options.type || 'vow'; // vow, expedition, combat, connection, legacy
        this.rank = options.rank || 'troublesome'; // troublesome, dangerous, formidable, extreme, epic
        this.ticks = options.ticks || 0;
        this.completed = options.completed || false;
        this.description = options.description || '';
        this.createdAt = options.createdAt || Date.now();
        this.updatedAt = options.updatedAt || Date.now();
    }

    generateId() {
        return 'track_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    // Get progress in full boxes (4 ticks = 1 box)
    get progressBoxes() {
        return Math.floor(this.ticks / 4);
    }

    // Get remaining ticks in current box
    get remainingTicks() {
        return this.ticks % 4;
    }

    // Get progress unit based on rank
    get progressUnit() {
        const progressUnits = {
            'troublesome': 12,
            'dangerous': 8,
            'formidable': 4,
            'extreme': 2,
            'epic': 1
        };
        return progressUnits[this.rank] || 4;
    }

    // Mark progress
    markProgress(times = 1) {
        this.ticks += this.progressUnit * times;
        this.ticks = Math.min(this.ticks, 40); // Max 10 boxes * 4 ticks
        this.updatedAt = Date.now();
        return this;
    }

    // Erase progress
    eraseProgress(times = 1) {
        this.ticks -= this.progressUnit * times;
        this.ticks = Math.max(this.ticks, 0);
        this.updatedAt = Date.now();
        return this;
    }

    // Get progress score for progress moves
    getProgressScore() {
        return this.progressBoxes;
    }

    // Complete the track
    complete() {
        this.completed = true;
        this.updatedAt = Date.now();
        return this;
    }

    // Convert to JSON for storage
    toJSON() {
        return {
            id: this.id,
            label: this.label,
            type: this.type,
            rank: this.rank,
            ticks: this.ticks,
            completed: this.completed,
            description: this.description,
            createdAt: this.createdAt,
            updatedAt: this.updatedAt
        };
    }

    // Create from JSON data
    static fromJSON(data) {
        return new ProgressTrack(data);
    }
}

class ProgressTrackManager {
    constructor() {
        this.tracks = [];
        this.loadFromStorage();
    }

    // Add a new progress track
    addTrack(options = {}) {
        const track = new ProgressTrack(options);
        this.tracks.push(track);
        this.saveToStorage();
        return track;
    }

    // Get track by ID
    getTrack(id) {
        return this.tracks.find(track => track.id === id);
    }

    // Get tracks by type
    getTracksByType(type) {
        return this.tracks.filter(track => track.type === type && !track.completed);
    }

    // Get all active tracks
    getActiveTracks() {
        return this.tracks.filter(track => !track.completed);
    }

    // Get completed tracks
    getCompletedTracks() {
        return this.tracks.filter(track => track.completed);
    }

    // Update track
    updateTrack(id, updates) {
        const track = this.getTrack(id);
        if (track) {
            Object.assign(track, updates);
            track.updatedAt = Date.now();
            this.saveToStorage();
            return track;
        }
        return null;
    }

    // Delete track
    deleteTrack(id) {
        const index = this.tracks.findIndex(track => track.id === id);
        if (index !== -1) {
            this.tracks.splice(index, 1);
            this.saveToStorage();
            return true;
        }
        return false;
    }

    // Mark progress on a track
    markProgress(id, times = 1) {
        const track = this.getTrack(id);
        if (track) {
            track.markProgress(times);
            this.saveToStorage();
            return track;
        }
        return null;
    }

    // Make progress roll
    makeProgressRoll(id) {
        const track = this.getTrack(id);
        if (track) {
            const progressScore = track.getProgressScore();
            const roll = diceRoller.progressRoll(progressScore);
            return {
                track,
                roll,
                progressScore
            };
        }
        return null;
    }

    // Save to localStorage
    saveToStorage() {
        const data = this.tracks.map(track => track.toJSON());
        localStorage.setItem('starforged-progress-tracks', JSON.stringify(data));
    }

    // Load from localStorage
    loadFromStorage() {
        try {
            const data = localStorage.getItem('starforged-progress-tracks');
            if (data) {
                const tracks = JSON.parse(data);
                this.tracks = tracks.map(trackData => ProgressTrack.fromJSON(trackData));
            }
        } catch (error) {
            console.error('Error loading progress tracks from storage:', error);
            this.tracks = [];
        }
    }

    // Get track types with descriptions
    getTrackTypes() {
        return [
            { value: 'vow', label: 'Vow', description: 'A solemn promise or commitment' },
            { value: 'expedition', label: 'Expedition', description: 'A journey to explore or discover' },
            { value: 'combat', label: 'Combat', description: 'A fight or battle' },
            { value: 'connection', label: 'Connection', description: 'A relationship with an NPC' },
            { value: 'legacy', label: 'Legacy', description: 'Long-term advancement track' },
            { value: 'other', label: 'Other', description: 'Custom progress track' }
        ];
    }

    // Get challenge ranks
    getChallengeRanks() {
        return [
            { value: 'troublesome', label: 'Troublesome', ticks: 12 },
            { value: 'dangerous', label: 'Dangerous', ticks: 8 },
            { value: 'formidable', label: 'Formidable', ticks: 4 },
            { value: 'extreme', label: 'Extreme', ticks: 2 },
            { value: 'epic', label: 'Epic', ticks: 1 }
        ];
    }
}

// Global instance
const progressTrackManager = new ProgressTrackManager();