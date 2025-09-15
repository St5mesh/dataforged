// Character Management System
class Character {
    constructor() {
        this.stats = {
            edge: 1,
            heart: 1,
            iron: 1,
            shadow: 1,
            wits: 1
        };
        
        this.meters = {
            health: 5,
            spirit: 5,
            supply: 5
        };
        
        this.momentum = 2;
        this.momentumMax = 10;
        this.momentumReset = 2;
        this.nextMoveBonus = 0; // Temporary bonus for next move
        
        this.assets = [];
        this.vows = [];
        this.connections = [];
        
        this.truths = [];
        
        // Legacy tracks
        this.legacyTracks = {
            quests: { ticks: 0, completed: false },
            bonds: { ticks: 0, completed: false },
            discoveries: { ticks: 0, completed: false }
        };
        
        this.experience = 0; // Available experience to spend
        
        this.sessionComplete = false;
        
        this.loadFromStorage();
    }

    // Save character to localStorage
    saveToStorage() {
        const data = {
            stats: this.stats,
            meters: this.meters,
            momentum: this.momentum,
            momentumMax: this.momentumMax,
            momentumReset: this.momentumReset,
            nextMoveBonus: this.nextMoveBonus,
            assets: this.assets,
            vows: this.vows,
            connections: this.connections,
            truths: this.truths,
            sessionComplete: this.sessionComplete
        };
        localStorage.setItem('starforged-character', JSON.stringify(data));
    }

    // Load character from localStorage
    loadFromStorage() {
        const saved = localStorage.getItem('starforged-character');
        if (saved) {
            try {
                const data = JSON.parse(saved);
                Object.assign(this, data);
                // Ensure nextMoveBonus is initialized for existing saves
                if (typeof this.nextMoveBonus === 'undefined') {
                    this.nextMoveBonus = 0;
                }
            } catch (error) {
                console.error('Error loading character:', error);
            }
        }
    }

    // Reset character (new character)
    reset() {
        this.stats = { edge: 1, heart: 1, iron: 1, shadow: 1, wits: 1 };
        this.meters = { health: 5, spirit: 5, supply: 5 };
        this.momentum = 2;
        this.momentumMax = 10;
        this.momentumReset = 2;
        this.assets = [];
        this.vows = [];
        this.connections = [];
        this.truths = [];
        this.sessionComplete = false;
        this.saveToStorage();
    }

    // Stat management
    setStat(stat, value) {
        if (this.stats.hasOwnProperty(stat) && value >= 1 && value <= 3) {
            this.stats[stat] = value;
            this.saveToStorage();
        }
    }

    getStat(stat) {
        return this.stats[stat] || 0;
    }

    // Validate stat distribution (must be 3,2,2,1,1)
    validateStats() {
        const values = Object.values(this.stats).sort((a, b) => b - a);
        const expected = [3, 2, 2, 1, 1];
        return JSON.stringify(values) === JSON.stringify(expected);
    }

    // Meter management
    setMeter(meter, value) {
        if (this.meters.hasOwnProperty(meter) && value >= 0 && value <= 5) {
            this.meters[meter] = value;
            this.saveToStorage();
        }
    }

    getMeter(meter) {
        return this.meters[meter] || 0;
    }

    // Adjust meters (for moves)
    adjustMeter(meter, change) {
        if (this.meters.hasOwnProperty(meter)) {
            this.meters[meter] = Math.max(0, Math.min(5, this.meters[meter] + change));
            this.saveToStorage();
        }
    }

    // Momentum management
    setMomentum(value) {
        this.momentum = Math.max(-6, Math.min(this.momentumMax, value));
        this.saveToStorage();
    }

    adjustMomentum(change) {
        this.setMomentum(this.momentum + change);
    }

    // Burn momentum (only on action moves)
    burnMomentum() {
        const burned = this.momentum;
        this.momentum = this.momentumReset;
        this.saveToStorage();
        return burned;
    }

    // Reset momentum
    resetMomentum() {
        this.momentum = this.momentumReset;
        this.saveToStorage();
    }

    // Asset management
    addAsset(asset) {
        this.assets.push({
            id: asset.$id,
            name: asset.Name,
            type: asset['Asset Type'],
            abilities: asset.Abilities || [],
            inputs: {},
            enabledAbilities: [true, false, false] // First ability always enabled
        });
        this.saveToStorage();
    }

    removeAsset(assetId) {
        this.assets = this.assets.filter(asset => asset.id !== assetId);
        this.saveToStorage();
    }

    hasAsset(assetId) {
        return this.assets.some(asset => asset.id === assetId);
    }

    getAsset(assetId) {
        return this.assets.find(asset => asset.id === assetId);
    }

    // Update asset input (like naming a starship)
    updateAssetInput(assetId, inputId, value) {
        const asset = this.getAsset(assetId);
        if (asset) {
            asset.inputs[inputId] = value;
            this.saveToStorage();
        }
    }

    // Vow management
    addVow(vow) {
        const vowObj = {
            id: Date.now().toString(),
            description: vow.description,
            rank: vow.rank, // troublesome, dangerous, formidable, extreme, epic
            progress: 0, // 0-10
            ticks: 0 // For partial progress within a box
        };
        this.vows.push(vowObj);
        this.saveToStorage();
        return vowObj;
    }

    removeVow(vowId) {
        this.vows = this.vows.filter(vow => vow.id !== vowId);
        this.saveToStorage();
    }

    // Mark progress on a vow
    markVowProgress(vowId, rank = null) {
        const vow = this.vows.find(v => v.id === vowId);
        if (!vow) return false;

        const progressRank = rank || vow.rank;
        let progressToAdd = 0;

        // Progress amounts based on rank
        switch (progressRank.toLowerCase()) {
            case 'troublesome':
                progressToAdd = 12; // 3 boxes
                break;
            case 'dangerous':
                progressToAdd = 8; // 2 boxes
                break;
            case 'formidable':
                progressToAdd = 4; // 1 box
                break;
            case 'extreme':
                progressToAdd = 8; // 2 ticks
                break;
            case 'epic':
                progressToAdd = 4; // 1 tick
                break;
        }

        vow.ticks += progressToAdd;
        
        // Convert ticks to full boxes (4 ticks = 1 box)
        while (vow.ticks >= 4 && vow.progress < 10) {
            vow.progress++;
            vow.ticks -= 4;
        }

        // Cap progress at 10 boxes
        if (vow.progress >= 10) {
            vow.progress = 10;
            vow.ticks = 0;
        }

        this.saveToStorage();
        return true;
    }

    // Get progress score for progress rolls (boxes * 4 + ticks, max 40)
    getVowProgressScore(vowId) {
        const vow = this.vows.find(v => v.id === vowId);
        if (!vow) return 0;
        return Math.min(40, vow.progress * 4 + vow.ticks);
    }

    // Legacy track management
    markLegacyTrack(trackName, amount) {
        if (!this.legacyTracks[trackName]) return false;

        const track = this.legacyTracks[trackName];
        track.ticks += amount;

        // Check for completed boxes (4 ticks = 1 box)
        while (track.ticks >= 4) {
            track.ticks -= 4;
            
            // Each completed box earns 2 experience (or 1 if track is completed)
            const experienceGained = track.completed ? 1 : 2;
            this.experience += experienceGained;
            
            // Check if track is now complete (10 boxes)
            if (!track.completed) {
                const boxes = Math.floor((track.ticks + (track.ticks >= 4 ? 4 : 0)) / 4);
                if (boxes >= 10) {
                    track.completed = true;
                    sceneLog.logNarrative(`${trackName} legacy track completed! Future progress earns 1 experience instead of 2.`, 'legacy-complete');
                }
            }
        }

        this.saveToStorage();
        return true;
    }

    getLegacyTrackScore(trackName) {
        if (!this.legacyTracks[trackName]) return 0;
        const track = this.legacyTracks[trackName];
        const boxes = Math.floor(track.ticks / 4);
        const bonus = track.completed ? 10 : 0;
        return Math.min(40, boxes * 4 + (track.ticks % 4) + bonus);
    }

    // Endure stress method
    endureStress(amount) {
        this.meters.spirit = Math.max(0, this.meters.spirit - amount);
        this.saveToStorage();
        
        // Check if spirit is 0 and handle debilities
        if (this.meters.spirit === 0) {
            // TODO: Handle debilities and face desolation
            console.log('Spirit is 0 - face desolation or mark debility');
        }
    }

    // Add momentum
    addMomentum(amount) {
        this.momentum = Math.min(this.momentumMax, this.momentum + amount);
        this.saveToStorage();
    }

    // Add next move bonus
    addNextMoveBonus(amount) {
        this.nextMoveBonus += amount;
        this.saveToStorage();
    }

    // Use and clear next move bonus
    useNextMoveBonus() {
        const bonus = this.nextMoveBonus;
        this.nextMoveBonus = 0;
        this.saveToStorage();
        return bonus;
    }

    // Truth management
    addTruth(truth) {
        this.truths.push(truth);
        this.saveToStorage();
    }

    clearTruths() {
        this.truths = [];
        this.saveToStorage();
    }

    // Session 0 validation
    validateSession0() {
        // Check truths (should have one for each category)
        const truthCategories = ['Cataclysm', 'Exodus', 'Communities', 'Iron', 'Laws', 'Religion', 'Magic', 'Communication and Data', 'Medicine', 'Artificial Intelligence', 'War', 'Lifeforms', 'Precursors', 'Horrors'];
        const hasTruths = truthCategories.every(cat => 
            this.truths.some(truth => truth.category === cat)
        );

        // Check assets (2 paths + 1 command vehicle + 1 other)
        const pathAssets = this.assets.filter(asset => asset.type && asset.type.includes('Path'));
        const commandVehicles = this.assets.filter(asset => asset.type && asset.type.includes('Command_Vehicle'));
        const hasRequiredAssets = pathAssets.length >= 2 && commandVehicles.length >= 1 && this.assets.length >= 4;

        // Check stats distribution
        const hasValidStats = this.validateStats();

        // Check background vow (either in vows array or in the UI field)
        const backgroundVowField = document.getElementById('background-vow');
        const hasBackgroundVow = this.vows.some(vow => vow.rank === 'epic') || 
                                 (backgroundVowField && backgroundVowField.value.trim().length > 0);

        return {
            hasTruths,
            hasRequiredAssets,
            hasValidStats,
            hasBackgroundVow,
            valid: hasTruths && hasRequiredAssets && hasValidStats && hasBackgroundVow
        };
    }

    completeSession0() {
        const validation = this.validateSession0();
        if (validation.valid) {
            this.sessionComplete = true;
            this.saveToStorage();
            return true;
        }
        return false;
    }
}

// Create global instance
window.character = new Character();