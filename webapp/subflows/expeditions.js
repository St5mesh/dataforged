// Expeditions Subflow Management System
class ExpeditionsSubflow {
    constructor() {
        this.currentExpedition = null;
        this.expeditionMoveHistory = [];
    }

    // Initialize the expeditions subflow UI
    init() {
        this.setupEventListeners();
        this.renderExpeditionsList();
    }

    setupEventListeners() {
        document.addEventListener('click', (e) => {
            if (e.target.id === 'undertake-expedition') {
                this.showUndertakeExpeditionDialog();
            }
            if (e.target.classList.contains('expedition-waypoint-btn')) {
                const expeditionId = e.target.dataset.expeditionId;
                this.showWaypointDialog(expeditionId);
            }
            if (e.target.classList.contains('expedition-finish-btn')) {
                const expeditionId = e.target.dataset.expeditionId;
                this.showFinishExpeditionDialog(expeditionId);
            }
            if (e.target.classList.contains('expedition-abandon-btn')) {
                const expeditionId = e.target.dataset.expeditionId;
                this.abandonExpedition(expeditionId);
            }
        });
    }

    // Show dialog to start new expedition
    showUndertakeExpeditionDialog() {
        const dialog = document.createElement('div');
        dialog.className = 'modal-overlay';
        dialog.innerHTML = `
            <div class="modal-dialog expedition-dialog">
                <div class="modal-header">
                    <h3>Undertake an Expedition</h3>
                    <button class="modal-close" onclick="this.closest('.modal-overlay').remove()">&times;</button>
                </div>
                <div class="modal-body">
                    <div class="form-group">
                        <label for="expedition-destination">Destination:</label>
                        <input type="text" id="expedition-destination" placeholder="Where are you going?" required>
                    </div>
                    <div class="form-group">
                        <label for="expedition-rank">Journey Rank:</label>
                        <select id="expedition-rank" required>
                            <option value="">Choose rank...</option>
                            <option value="troublesome">Troublesome - Familiar area, short distance</option>
                            <option value="dangerous">Dangerous - Unfamiliar area, moderate distance</option>
                            <option value="formidable">Formidable - Remote location, dangerous</option>
                            <option value="extreme">Extreme - Uncharted space, great peril</option>
                            <option value="epic">Epic - Far reaches, legendary destination</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label for="expedition-purpose">Purpose (Optional):</label>
                        <textarea id="expedition-purpose" placeholder="Why are you making this journey?"></textarea>
                    </div>
                    <div class="roll-options">
                        <h4>Roll to Undertake:</h4>
                        <div class="stat-selection">
                            <label>
                                <input type="radio" name="expedition-stat" value="edge" checked>
                                Edge (+${character.stats.edge}) - Speed and navigation
                            </label>
                            <label>
                                <input type="radio" name="expedition-stat" value="shadow">
                                Shadow (+${character.stats.shadow}) - Stealth and avoiding detection
                            </label>
                            <label>
                                <input type="radio" name="expedition-stat" value="wits">
                                Wits (+${character.stats.wits}) - Planning and preparation
                            </label>
                        </div>
                        <div class="form-group">
                            <label for="expedition-modifiers">Modifiers:</label>
                            <input type="number" id="expedition-modifiers" value="0" min="-3" max="3">
                            <small>Situation modifiers (-3 to +3)</small>
                        </div>
                    </div>
                </div>
                <div class="modal-footer">
                    <button class="btn btn-secondary" onclick="this.closest('.modal-overlay').remove()">Cancel</button>
                    <button class="btn btn-primary" onclick="expeditionsSubflow.executeUndertakeExpedition()">Begin Expedition</button>
                </div>
            </div>
        `;
        document.body.appendChild(dialog);
        document.getElementById('expedition-destination').focus();
    }

    // Execute Undertake an Expedition move
    executeUndertakeExpedition() {
        const destination = document.getElementById('expedition-destination').value.trim();
        const rank = document.getElementById('expedition-rank').value;
        const purpose = document.getElementById('expedition-purpose').value.trim();
        const stat = document.querySelector('input[name="expedition-stat"]:checked').value;
        const modifiers = parseInt(document.getElementById('expedition-modifiers').value) || 0;

        if (!destination || !rank) {
            alert('Please fill in the required fields.');
            return;
        }

        // Get the Undertake an Expedition move
        const move = gameData.getMove('Starforged/Moves/Exploration/Undertake_an_Expedition');
        if (!move) {
            console.error('Undertake an Expedition move not found');
            return;
        }

        // Execute the move
        const result = movesSystem.executeMove('Starforged/Moves/Exploration/Undertake_an_Expedition', {
            stat: stat,
            modifiers: modifiers,
            destination: destination,
            rank: rank
        });

        // Create the expedition based on the result
        const expeditionData = {
            destination: destination,
            rank: rank,
            purpose: purpose,
            stat: stat,
            progress: 0,
            ticks: 0,
            waypoints: [],
            timestamp: Date.now(),
            active: true
        };

        // Handle move outcomes
        if (result.roll.outcome === 'strong_hit') {
            expeditionData.momentum = 2;
            character.addMomentum(2);
        } else if (result.roll.outcome === 'weak_hit') {
            expeditionData.momentum = 1;
            character.addMomentum(1);
            expeditionData.hasComplication = true;
        } else {
            // Miss - face a peril immediately
            expeditionData.hasPeril = true;
        }

        // Add expedition to character progress tracks
        const newExpedition = this.addExpedition(expeditionData);

        // Log the move and expedition start
        sceneLog.logMove(move, { stat, modifiers, destination, rank }, result);
        sceneLog.logNarrative(`Expedition begun to ${destination} (${rank})`, 'expedition-start');

        // Update UI
        this.renderExpeditionsList();
        app.updateRecentLogEntries();

        // Close dialog
        document.querySelector('.modal-overlay').remove();

        // Show result
        this.showMoveResult(result, newExpedition);
    }

    // Show waypoint exploration dialog
    showWaypointDialog(expeditionId) {
        const expedition = this.getExpedition(expeditionId);
        if (!expedition) return;

        const dialog = document.createElement('div');
        dialog.className = 'modal-overlay';
        dialog.innerHTML = `
            <div class="modal-dialog waypoint-dialog">
                <div class="modal-header">
                    <h3>Explore a Waypoint</h3>
                    <button class="modal-close" onclick="this.closest('.modal-overlay').remove()">&times;</button>
                </div>
                <div class="modal-body">
                    <div class="expedition-summary">
                        <h4>Expedition: ${expedition.destination}</h4>
                        <p><strong>Rank:</strong> ${expedition.rank}</p>
                        <p><strong>Progress:</strong> ${expedition.progress}/10 boxes</p>
                    </div>
                    <div class="form-group">
                        <label for="waypoint-description">Waypoint Description:</label>
                        <textarea id="waypoint-description" placeholder="Describe what you discover at this waypoint..." required></textarea>
                    </div>
                    <div class="waypoint-roll-options">
                        <h4>Explore Waypoint:</h4>
                        <div class="stat-selection">
                            <label>
                                <input type="radio" name="waypoint-stat" value="edge" checked>
                                Edge (+${character.stats.edge}) - Navigate or scout ahead
                            </label>
                            <label>
                                <input type="radio" name="waypoint-stat" value="heart">
                                Heart (+${character.stats.heart}) - Social interaction or morale
                            </label>
                            <label>
                                <input type="radio" name="waypoint-stat" value="shadow">
                                Shadow (+${character.stats.shadow}) - Stealth or avoiding danger
                            </label>
                            <label>
                                <input type="radio" name="waypoint-stat" value="wits">
                                Wits (+${character.stats.wits}) - Investigation or analysis
                            </label>
                        </div>
                        <div class="form-group">
                            <label for="waypoint-modifiers">Modifiers:</label>
                            <input type="number" id="waypoint-modifiers" value="0" min="-3" max="3">
                            <small>Situation modifiers (-3 to +3)</small>
                        </div>
                    </div>
                </div>
                <div class="modal-footer">
                    <button class="btn btn-secondary" onclick="this.closest('.modal-overlay').remove()">Cancel</button>
                    <button class="btn btn-primary" onclick="expeditionsSubflow.executeExploreWaypoint('${expeditionId}')">Explore Waypoint</button>
                </div>
            </div>
        `;
        document.body.appendChild(dialog);
        document.getElementById('waypoint-description').focus();
    }

    // Execute Explore a Waypoint move
    executeExploreWaypoint(expeditionId) {
        const expedition = this.getExpedition(expeditionId);
        if (!expedition) return;

        const description = document.getElementById('waypoint-description').value.trim();
        const stat = document.querySelector('input[name="waypoint-stat"]:checked').value;
        const modifiers = parseInt(document.getElementById('waypoint-modifiers').value) || 0;

        if (!description) {
            alert('Please describe the waypoint.');
            return;
        }

        // Get the Explore a Waypoint move
        const move = gameData.getMove('Starforged/Moves/Exploration/Explore_a_Waypoint');
        if (!move) {
            console.error('Explore a Waypoint move not found');
            return;
        }

        // Execute the move
        const result = movesSystem.executeMove('Starforged/Moves/Exploration/Explore_a_Waypoint', {
            stat: stat,
            modifiers: modifiers,
            description: description
        });

        // Create waypoint record
        const waypoint = {
            id: Date.now().toString(),
            description: description,
            stat: stat,
            roll: result.roll,
            timestamp: Date.now()
        };

        // Handle outcomes
        let progressGained = 0;
        if (result.roll.outcome === 'strong_hit') {
            progressGained = this.getProgressUnit(expedition.rank);
            character.addMomentum(1);
            waypoint.outcome = 'Progress made, momentum gained';
        } else if (result.roll.outcome === 'weak_hit') {
            progressGained = this.getProgressUnit(expedition.rank);
            waypoint.outcome = 'Progress made, but face complication';
            waypoint.hasComplication = true;
        } else {
            waypoint.outcome = 'Face a peril or pay the price';
            waypoint.hasPeril = true;
        }

        // Add progress if gained
        if (progressGained > 0) {
            this.markExpeditionProgress(expeditionId, progressGained);
        }

        // Add waypoint to expedition
        expedition.waypoints.push(waypoint);
        this.saveExpeditions();

        // Log the move and waypoint
        sceneLog.logMove(move, { stat, modifiers, description }, result);
        sceneLog.logNarrative(`Waypoint explored on expedition to ${expedition.destination}: ${description}`, 'expedition-waypoint');

        if (progressGained > 0) {
            const progressText = progressGained >= 4 ? 
                `${Math.floor(progressGained / 4)} box(es)` : 
                `${progressGained} tick(s)`;
            sceneLog.logNarrative(`Progress marked on expedition: +${progressText}`, 'expedition-progress');
        }

        // Update UI
        this.renderExpeditionsList();
        app.updateRecentLogEntries();

        // Close dialog
        document.querySelector('.modal-overlay').remove();

        // Show result
        this.showWaypointResult(result, waypoint, expedition);

        // Check if expedition is ready to finish
        if (expedition.progress >= 10) {
            this.showExpeditionReadyNotification(expedition);
        }
    }

    // Show finish expedition dialog
    showFinishExpeditionDialog(expeditionId) {
        const expedition = this.getExpedition(expeditionId);
        if (!expedition) return;

        if (expedition.progress < 10) {
            alert(`This expedition is not complete. You need ${10 - expedition.progress} more progress boxes before you can attempt to finish it.`);
            return;
        }

        const dialog = document.createElement('div');
        dialog.className = 'modal-overlay';
        dialog.innerHTML = `
            <div class="modal-dialog expedition-dialog">
                <div class="modal-header">
                    <h3>Finish an Expedition</h3>
                    <button class="modal-close" onclick="this.closest('.modal-overlay').remove()">&times;</button>
                </div>
                <div class="modal-body">
                    <div class="expedition-summary">
                        <h4>Expedition: ${expedition.destination}</h4>
                        <p><strong>Rank:</strong> ${expedition.rank}</p>
                        <p><strong>Progress:</strong> ${expedition.progress}/10 boxes</p>
                        <p><strong>Progress Score:</strong> ${this.getExpeditionProgressScore(expeditionId)}</p>
                    </div>
                    <div class="form-group">
                        <label for="finish-narrative">How does the expedition conclude?</label>
                        <textarea id="finish-narrative" placeholder="Describe your arrival and what you find..." required></textarea>
                    </div>
                    <div class="progress-roll-info">
                        <h4>Progress Roll</h4>
                        <p>You will roll the challenge dice against your progress score of <strong>${this.getExpeditionProgressScore(expeditionId)}</strong>.</p>
                        <p>Momentum is ignored for progress rolls.</p>
                    </div>
                </div>
                <div class="modal-footer">
                    <button class="btn btn-secondary" onclick="this.closest('.modal-overlay').remove()">Cancel</button>
                    <button class="btn btn-primary" onclick="expeditionsSubflow.executeFinishExpedition('${expeditionId}')">Finish Expedition</button>
                </div>
            </div>
        `;
        document.body.appendChild(dialog);
        document.getElementById('finish-narrative').focus();
    }

    // Execute Finish an Expedition move
    executeFinishExpedition(expeditionId) {
        const expedition = this.getExpedition(expeditionId);
        if (!expedition) return;

        const narrative = document.getElementById('finish-narrative').value.trim();
        if (!narrative) {
            alert('Please describe how the expedition concludes.');
            return;
        }

        // Get the Finish an Expedition move
        const move = gameData.getMove('Starforged/Moves/Exploration/Finish_an_Expedition');
        if (!move) {
            console.error('Finish an Expedition move not found');
            return;
        }

        // Execute the progress move
        const result = movesSystem.executeProgressMove('Starforged/Moves/Exploration/Finish_an_Expedition', {
            progressScore: this.getExpeditionProgressScore(expeditionId),
            narrative: narrative
        });

        // Handle outcomes and legacy rewards
        let legacyReward = 0;
        let completed = false;

        if (result.roll.outcome === 'strong_hit') {
            completed = true;
            legacyReward = this.getLegacyReward(expedition.rank);
            character.markLegacyTrack('discoveries', legacyReward);
        } else if (result.roll.outcome === 'weak_hit') {
            completed = true;
            legacyReward = this.getLegacyReward(this.lowerRank(expedition.rank));
            character.markLegacyTrack('discoveries', legacyReward);
        } else {
            // Miss - expedition is a failure or has major complication
            const choice = confirm('Your expedition faces a major complication or failure.\n\nClick OK to abandon the expedition, or Cancel to continue with reduced progress.');
            
            if (choice) {
                this.abandonExpedition(expeditionId);
                return;
            } else {
                // Lose progress and continue
                expedition.progress = Math.max(0, expedition.progress - 2);
                expedition.ticks = 0;
            }
        }

        if (completed) {
            expedition.active = false;
            expedition.completed = true;
            expedition.completedAt = Date.now();
        }

        this.saveExpeditions();

        // Log the move and outcome
        sceneLog.logMove(move, { expeditionId, narrative }, result);
        sceneLog.logNarrative(`Expedition to ${expedition.destination} ${completed ? 'completed' : 'continues'}: ${narrative}`, 'expedition-finish');

        if (legacyReward > 0) {
            const rewardText = legacyReward >= 4 ? 
                `${Math.floor(legacyReward / 4)} box(es)` : 
                `${legacyReward} tick(s)`;
            sceneLog.logNarrative(`Legacy reward: +${rewardText} on discoveries track`, 'legacy-reward');
        }

        // Update UI
        this.renderExpeditionsList();
        app.updateRecentLogEntries();

        // Close dialog
        document.querySelector('.modal-overlay').remove();

        // Show result
        this.showMoveResult(result, expedition, { narrative, legacyReward, completed });
    }

    // Abandon expedition
    abandonExpedition(expeditionId) {
        const expedition = this.getExpedition(expeditionId);
        if (!expedition) return;

        const reason = prompt('Why are you abandoning this expedition?');
        if (!reason) return;

        expedition.active = false;
        expedition.abandoned = true;
        expedition.abandonReason = reason;
        expedition.abandonedAt = Date.now();

        this.saveExpeditions();

        // Log the abandonment
        sceneLog.logNarrative(`Expedition to ${expedition.destination} abandoned: ${reason}`, 'expedition-abandoned');

        this.renderExpeditionsList();
        app.updateRecentLogEntries();
    }

    // Helper methods
    getProgressUnit(rank) {
        const progressUnits = {
            'troublesome': 12, // 3 boxes
            'dangerous': 8,    // 2 boxes  
            'formidable': 4,   // 1 box
            'extreme': 2,      // 2 ticks
            'epic': 1          // 1 tick
        };
        return progressUnits[rank] || 4;
    }

    getLegacyReward(rank) {
        const legacyRewards = {
            'troublesome': 1,   // 1 tick
            'dangerous': 2,     // 2 ticks
            'formidable': 4,    // 1 box
            'extreme': 8,       // 2 boxes
            'epic': 12          // 3 boxes
        };
        return legacyRewards[rank] || 1;
    }

    lowerRank(rank) {
        const ranks = ['troublesome', 'dangerous', 'formidable', 'extreme', 'epic'];
        const index = ranks.indexOf(rank);
        return index > 0 ? ranks[index - 1] : 'troublesome';
    }

    // Expedition management
    addExpedition(expeditionData) {
        const expeditions = this.getExpeditions();
        const expedition = {
            id: Date.now().toString(),
            ...expeditionData
        };
        expeditions.push(expedition);
        localStorage.setItem('starforged_expeditions', JSON.stringify(expeditions));
        return expedition;
    }

    getExpeditions() {
        try {
            return JSON.parse(localStorage.getItem('starforged_expeditions') || '[]');
        } catch {
            return [];
        }
    }

    getExpedition(expeditionId) {
        return this.getExpeditions().find(exp => exp.id === expeditionId);
    }

    saveExpeditions() {
        const expeditions = this.getExpeditions();
        localStorage.setItem('starforged_expeditions', JSON.stringify(expeditions));
    }

    markExpeditionProgress(expeditionId, amount) {
        const expeditions = this.getExpeditions();
        const expedition = expeditions.find(exp => exp.id === expeditionId);
        if (!expedition) return false;

        expedition.ticks += amount;
        
        // Convert ticks to full boxes (4 ticks = 1 box)
        while (expedition.ticks >= 4 && expedition.progress < 10) {
            expedition.progress++;
            expedition.ticks -= 4;
        }

        // Cap progress at 10 boxes
        if (expedition.progress >= 10) {
            expedition.progress = 10;
            expedition.ticks = 0;
        }

        this.saveExpeditions();
        return true;
    }

    getExpeditionProgressScore(expeditionId) {
        const expedition = this.getExpedition(expeditionId);
        if (!expedition) return 0;
        return Math.min(40, expedition.progress * 4 + expedition.ticks);
    }

    // Notification for ready expeditions
    showExpeditionReadyNotification(expedition) {
        const notification = document.createElement('div');
        notification.className = 'expedition-notification';
        notification.innerHTML = `
            <div class="notification-content">
                <h4>🎯 Expedition Ready!</h4>
                <p>Your expedition to "${expedition.destination}" is complete and ready to finish!</p>
                <button onclick="expeditionsSubflow.showFinishExpeditionDialog('${expedition.id}'); this.closest('.expedition-notification').remove();">Finish Now</button>
                <button onclick="this.closest('.expedition-notification').remove();">Later</button>
            </div>
        `;
        document.body.appendChild(notification);

        // Auto-remove after 10 seconds
        setTimeout(() => {
            if (notification.parentNode) {
                notification.remove();
            }
        }, 10000);
    }

    // Render expeditions list
    renderExpeditionsList() {
        const container = document.getElementById('expeditions-list');
        if (!container) return;

        const expeditions = this.getExpeditions();
        const activeExpeditions = expeditions.filter(exp => exp.active);

        if (activeExpeditions.length === 0) {
            container.innerHTML = `
                <p class="empty-state">No active expeditions</p>
                <button id="undertake-expedition" class="btn btn-primary">Undertake an Expedition</button>
            `;
            return;
        }

        container.innerHTML = `
            <div class="expeditions-list">
                ${activeExpeditions.map(expedition => this.renderExpeditionItem(expedition)).join('')}
            </div>
            <button id="undertake-expedition" class="btn btn-primary">Undertake New Expedition</button>
        `;
    }

    renderExpeditionItem(expedition) {
        const isComplete = expedition.progress >= 10;
        const progressUnit = this.getProgressUnit(expedition.rank);

        return `
            <div class="expedition-item ${isComplete ? 'complete' : ''}">
                <div class="expedition-header">
                    <h4 class="expedition-destination">${expedition.destination}</h4>
                    <div class="expedition-rank badge rank-${expedition.rank}">${expedition.rank}</div>
                </div>
                
                ${expedition.purpose ? `<p class="expedition-purpose">${expedition.purpose}</p>` : ''}
                
                <div class="expedition-progress">
                    <div class="progress-track-container">
                        <div class="progress-track">
                            ${Array(10).fill().map((_, i) => `
                                <div class="progress-box ${i < expedition.progress ? 'filled' : ''}">
                                    ${i === expedition.progress && expedition.ticks > 0 ? 
                                        `<div class="progress-ticks">
                                            ${Array(4).fill().map((_, j) => 
                                                `<div class="tick ${j < expedition.ticks ? 'filled' : ''}"></div>`
                                            ).join('')}
                                        </div>` : ''
                                    }
                                </div>
                            `).join('')}
                        </div>
                        <div class="progress-info">
                            <span class="progress-text">${expedition.progress}/10 boxes</span>
                            ${expedition.ticks > 0 ? `<span class="ticks-text">(+${expedition.ticks} ticks)</span>` : ''}
                        </div>
                    </div>
                </div>

                <div class="expedition-waypoints">
                    <h5>Waypoints (${expedition.waypoints.length})</h5>
                    ${expedition.waypoints.length > 0 ? 
                        expedition.waypoints.slice(-3).map(waypoint => `
                            <div class="waypoint-summary">
                                <small>${waypoint.description}</small>
                            </div>
                        `).join('') : 
                        '<p class="no-waypoints">No waypoints explored yet</p>'
                    }
                </div>

                <div class="expedition-actions">
                    ${!isComplete ? `
                        <button class="btn btn-sm expedition-waypoint-btn" data-expedition-id="${expedition.id}">
                            Explore Waypoint
                        </button>
                    ` : ''}
                    
                    ${isComplete ? `
                        <button class="btn btn-sm btn-success expedition-finish-btn" data-expedition-id="${expedition.id}">
                            Finish Expedition
                        </button>
                    ` : ''}
                    
                    <button class="btn btn-sm btn-danger expedition-abandon-btn" data-expedition-id="${expedition.id}">
                        Abandon
                    </button>
                </div>

                <div class="expedition-metadata">
                    <small>Started: ${new Date(expedition.timestamp).toLocaleDateString()}</small>
                </div>
            </div>
        `;
    }

    // Show move result dialogs
    showMoveResult(result, expedition, extraData = {}) {
        // Similar to vows move result dialog but expedition-themed
        const dialog = document.createElement('div');
        dialog.className = 'modal-overlay';
        
        let outcomeText = '';
        let outcomeClass = '';
        
        switch (result.roll.outcome) {
            case 'strong_hit':
                outcomeText = 'Strong Hit';
                outcomeClass = 'strong-hit';
                break;
            case 'weak_hit':
                outcomeText = 'Weak Hit';
                outcomeClass = 'weak-hit';
                break;
            case 'miss':
                outcomeText = 'Miss';
                outcomeClass = 'miss';
                break;
        }

        dialog.innerHTML = `
            <div class="modal-dialog move-result-dialog">
                <div class="modal-header">
                    <h3>${result.move.Name} - ${outcomeText}</h3>
                    <button class="modal-close" onclick="this.closest('.modal-overlay').remove()">&times;</button>
                </div>
                <div class="modal-body">
                    <div class="roll-result ${outcomeClass}">
                        ${result.roll.type === 'action' ? `
                            <div class="dice-result">
                                <div class="action-die">Action Die: ${result.roll.actionDie}</div>
                                <div class="challenge-dice">
                                    Challenge Dice: ${result.roll.challengeDice[0]}, ${result.roll.challengeDice[1]}
                                </div>
                                <div class="total">Total: ${result.roll.total} vs ${result.roll.challengeDice.join(', ')}</div>
                            </div>
                        ` : `
                            <div class="progress-roll-result">
                                <div class="progress-score">Progress Score: ${result.roll.progressScore}</div>
                                <div class="challenge-dice">
                                    Challenge Dice: ${result.roll.challengeDice[0]}, ${result.roll.challengeDice[1]}
                                </div>
                            </div>
                        `}
                    </div>
                    
                    <div class="move-outcome">
                        <h4>Outcome:</h4>
                        <div class="outcome-text">
                            ${this.getMoveOutcomeText(result.move, result.roll.outcome)}
                        </div>
                    </div>

                    ${extraData.narrative ? `
                        <div class="narrative-section">
                            <h4>Your Story:</h4>
                            <p>${extraData.narrative}</p>
                        </div>
                    ` : ''}

                    ${extraData.legacyReward ? `
                        <div class="legacy-reward">
                            <h4>Legacy Reward:</h4>
                            <p>+${extraData.legacyReward >= 4 ? Math.floor(extraData.legacyReward / 4) + ' box(es)' : extraData.legacyReward + ' tick(s)'} on your discoveries legacy track</p>
                        </div>
                    ` : ''}
                </div>
                <div class="modal-footer">
                    <button class="btn btn-primary" onclick="this.closest('.modal-overlay').remove()">Continue</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(dialog);
    }

    showWaypointResult(result, waypoint, expedition) {
        this.showMoveResult(result, expedition, { narrative: waypoint.description });
    }

    // Get move outcome text
    getMoveOutcomeText(move, outcome) {
        if (move.Outcomes && move.Outcomes[this.capitalizeOutcome(outcome)]) {
            return move.Outcomes[this.capitalizeOutcome(outcome)].Text || 'No outcome text available.';
        }
        return 'No outcome text available.';
    }

    capitalizeOutcome(outcome) {
        return outcome.split('_').map(word => 
            word.charAt(0).toUpperCase() + word.slice(1)
        ).join(' ');
    }
}

// Create global instance
window.expeditionsSubflow = new ExpeditionsSubflow();