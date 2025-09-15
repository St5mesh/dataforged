// Scene Log Management System
class SceneLog {
    constructor() {
        this.scenes = [];
        this.currentSceneId = null;
        this.loadFromStorage();
    }

    generateId() {
        return 'scene_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    generateEntryId() {
        return 'entry_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    // Create a new scene
    createScene(description = '') {
        const scene = {
            id: this.generateId(),
            description: description || 'New Scene',
            entries: [],
            timestamp: Date.now(),
            active: true
        };

        this.scenes.push(scene);
        this.currentSceneId = scene.id;
        
        // Mark all other scenes as inactive
        this.scenes.forEach(s => {
            if (s.id !== scene.id) {
                s.active = false;
            }
        });

        this.saveToStorage();
        return scene;
    }

    // Get current active scene
    getCurrentScene() {
        if (!this.currentSceneId) {
            return this.createScene('Opening Scene');
        }
        return this.scenes.find(scene => scene.id === this.currentSceneId);
    }

    // Add an entry to the current scene
    addEntry(type, data) {
        const currentScene = this.getCurrentScene();
        const entry = {
            id: this.generateEntryId(),
            type: type, // 'move', 'oracle', 'narrative', 'state-change'
            timestamp: Date.now(),
            ...data
        };

        currentScene.entries.push(entry);
        this.saveToStorage();
        return entry;
    }

    // Log a move resolution
    logMove(move, options, result) {
        return this.addEntry('move', {
            moveId: move.$id,
            moveName: move.Name,
            options: options,
            result: result,
            description: `${move.Name} - ${result.roll?.outcome || 'resolved'}`
        });
    }

    // Log an oracle roll
    logOracle(oracle, result, question = null) {
        return this.addEntry('oracle', {
            oracleId: oracle.$id,
            oracleName: oracle.Name || oracle.Title,
            question: question,
            result: result,
            description: question ? 
                `Asked: "${question}" - ${result.result}` : 
                `${oracle.Name || oracle.Title}: ${result.result}`
        });
    }

    // Log narrative text or state changes
    logNarrative(text, category = 'narrative') {
        return this.addEntry('narrative', {
            text: text,
            category: category,
            description: text
        });
    }

    // Log state changes (character status, progress, etc.)
    logStateChange(changeType, details) {
        return this.addEntry('state-change', {
            changeType: changeType,
            details: details,
            description: this.formatStateChange(changeType, details)
        });
    }

    formatStateChange(changeType, details) {
        switch (changeType) {
            case 'progress':
                return `Progress marked on ${details.trackName}: ${details.newProgress}/${details.maxProgress}`;
            case 'meter':
                return `${details.meterName.charAt(0).toUpperCase() + details.meterName.slice(1)} changed to ${details.newValue}`;
            case 'momentum':
                return `Momentum: ${details.newValue >= 0 ? '+' : ''}${details.newValue}`;
            case 'vow':
                if (details.action === 'swear') {
                    return `Swore ${details.rank} vow: ${details.description}`;
                } else if (details.action === 'fulfill') {
                    return `Fulfilled vow: ${details.description}`;
                }
                break;
            default:
                return `${changeType}: ${JSON.stringify(details)}`;
        }
    }

    // Update current scene description
    updateSceneDescription(description) {
        const currentScene = this.getCurrentScene();
        if (currentScene) {
            currentScene.description = description;
            this.saveToStorage();
        }
    }

    // Get all scenes
    getScenes() {
        return this.scenes.slice().reverse(); // Most recent first
    }

    // Get entries for a specific scene
    getSceneEntries(sceneId) {
        const scene = this.scenes.find(s => s.id === sceneId);
        return scene ? scene.entries : [];
    }

    // Get recent entries across all scenes
    getRecentEntries(count = 20) {
        const allEntries = [];
        
        this.scenes.forEach(scene => {
            scene.entries.forEach(entry => {
                allEntries.push({
                    ...entry,
                    sceneId: scene.id,
                    sceneDescription: scene.description
                });
            });
        });

        return allEntries
            .sort((a, b) => b.timestamp - a.timestamp)
            .slice(0, count);
    }

    // Filter entries by type
    getEntriesByType(type) {
        const allEntries = [];
        
        this.scenes.forEach(scene => {
            scene.entries.forEach(entry => {
                if (entry.type === type) {
                    allEntries.push({
                        ...entry,
                        sceneId: scene.id,
                        sceneDescription: scene.description
                    });
                }
            });
        });

        return allEntries.sort((a, b) => b.timestamp - a.timestamp);
    }

    // Delete a scene
    deleteScene(sceneId) {
        this.scenes = this.scenes.filter(scene => scene.id !== sceneId);
        
        if (this.currentSceneId === sceneId) {
            const latestScene = this.scenes[this.scenes.length - 1];
            this.currentSceneId = latestScene ? latestScene.id : null;
            if (latestScene) {
                latestScene.active = true;
            }
        }
        
        this.saveToStorage();
    }

    // Switch to a different scene
    switchToScene(sceneId) {
        const scene = this.scenes.find(s => s.id === sceneId);
        if (scene) {
            this.scenes.forEach(s => s.active = false);
            scene.active = true;
            this.currentSceneId = sceneId;
            this.saveToStorage();
            return scene;
        }
        return null;
    }

    // Clear all scenes
    clearAll() {
        this.scenes = [];
        this.currentSceneId = null;
        this.saveToStorage();
    }

    // Export log for sharing/backup
    exportLog() {
        return {
            scenes: this.scenes,
            currentSceneId: this.currentSceneId,
            exportedAt: Date.now()
        };
    }

    // Import log from backup
    importLog(logData) {
        if (logData.scenes && Array.isArray(logData.scenes)) {
            this.scenes = logData.scenes;
            this.currentSceneId = logData.currentSceneId;
            this.saveToStorage();
            return true;
        }
        return false;
    }

    // Storage methods
    saveToStorage() {
        const data = {
            scenes: this.scenes,
            currentSceneId: this.currentSceneId
        };
        localStorage.setItem('starforged-scene-log', JSON.stringify(data));
    }

    loadFromStorage() {
        try {
            const stored = localStorage.getItem('starforged-scene-log');
            if (stored) {
                const data = JSON.parse(stored);
                this.scenes = data.scenes || [];
                this.currentSceneId = data.currentSceneId || null;
            }
        } catch (error) {
            console.warn('Failed to load scene log from storage:', error);
            this.scenes = [];
            this.currentSceneId = null;
        }
    }

    // Get formatted timestamp
    formatTimestamp(timestamp) {
        const date = new Date(timestamp);
        return date.toLocaleString();
    }

    // Get relative time (e.g., "2 minutes ago")
    getRelativeTime(timestamp) {
        const now = Date.now();
        const diff = now - timestamp;
        const minutes = Math.floor(diff / 60000);
        const hours = Math.floor(diff / 3600000);
        const days = Math.floor(diff / 86400000);

        if (days > 0) {
            return `${days} day${days > 1 ? 's' : ''} ago`;
        } else if (hours > 0) {
            return `${hours} hour${hours > 1 ? 's' : ''} ago`;
        } else if (minutes > 0) {
            return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
        } else {
            return 'Just now';
        }
    }

    // Search entries
    searchEntries(query) {
        if (!query) return [];
        
        const results = [];
        const searchTerm = query.toLowerCase();
        
        this.scenes.forEach(scene => {
            scene.entries.forEach(entry => {
                const searchableText = [
                    entry.description,
                    entry.moveName,
                    entry.oracleName,
                    entry.text,
                    entry.question,
                    entry.result?.result
                ].filter(text => text).join(' ').toLowerCase();
                
                if (searchableText.includes(searchTerm)) {
                    results.push({
                        ...entry,
                        sceneId: scene.id,
                        sceneDescription: scene.description
                    });
                }
            });
        });
        
        return results.sort((a, b) => b.timestamp - a.timestamp);
    }
}

// Create global instance
window.sceneLog = new SceneLog();