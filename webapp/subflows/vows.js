// Vows Subflow Management System
class VowsSubflow {
    constructor() {
        this.currentVowDialog = null;
        this.vowMoveHistory = [];
    }

    // Initialize the vows subflow UI
    init() {
        this.setupEventListeners();
        this.renderVowsList();
    }

    setupEventListeners() {
        // Enhanced vow creation dialog
        document.addEventListener('click', (e) => {
            if (e.target.id === 'swear-new-vow') {
                this.showSwearVowDialog();
            }
            if (e.target.classList.contains('vow-progress-btn')) {
                const vowId = e.target.dataset.vowId;
                this.markVowProgress(vowId);
            }
            if (e.target.classList.contains('vow-fulfill-btn')) {
                const vowId = e.target.dataset.vowId;
                this.showFulfillVowDialog(vowId);
            }
            if (e.target.classList.contains('vow-forsake-btn')) {
                const vowId = e.target.dataset.vowId;
                this.showForsakeVowDialog(vowId);
            }
        });
    }

    // Show enhanced vow creation dialog
    showSwearVowDialog() {
        const dialog = document.createElement('div');
        dialog.className = 'modal-overlay';
        dialog.innerHTML = `
            <div class="modal-dialog vow-dialog">
                <div class="modal-header">
                    <h3>Swear an Iron Vow</h3>
                    <button class="modal-close" onclick="this.closest('.modal-overlay').remove()">&times;</button>
                </div>
                <div class="modal-body">
                    <div class="form-group">
                        <label for="vow-description">Vow Description:</label>
                        <textarea id="vow-description" placeholder="I swear to..." required></textarea>
                    </div>
                    <div class="form-group">
                        <label for="vow-rank">Rank:</label>
                        <select id="vow-rank" required>
                            <option value="">Choose rank...</option>
                            <option value="troublesome">Troublesome (1-2 sessions)</option>
                            <option value="dangerous">Dangerous (3-4 sessions)</option>
                            <option value="formidable">Formidable (5-10 sessions)</option>
                            <option value="extreme">Extreme (11-20 sessions)</option>
                            <option value="epic">Epic (21+ sessions)</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label for="vow-context">Context (Optional):</label>
                        <textarea id="vow-context" placeholder="Additional details about the vow..."></textarea>
                    </div>
                    <div class="vow-roll-options">
                        <h4>Roll to Swear the Vow:</h4>
                        <div class="stat-selection">
                            <label>
                                <input type="radio" name="vow-stat" value="heart" checked>
                                Heart (+${character.stats.heart}) - When you swear vow for yourself or someone else
                            </label>
                            <label>
                                <input type="radio" name="vow-stat" value="iron">
                                Iron (+${character.stats.iron}) - When you swear a vow in defiance of another's will
                            </label>
                            <label>
                                <input type="radio" name="vow-stat" value="wits">
                                Wits (+${character.stats.wits}) - When you swear a vow to complete a duty or serve
                            </label>
                        </div>
                        <div class="form-group">
                            <label for="vow-modifiers">Modifiers:</label>
                            <input type="number" id="vow-modifiers" value="0" min="-3" max="3">
                            <small>Situation modifiers (-3 to +3)</small>
                        </div>
                    </div>
                </div>
                <div class="modal-footer">
                    <button class="btn btn-secondary" onclick="this.closest('.modal-overlay').remove()">Cancel</button>
                    <button class="btn btn-primary" onclick="vowsSubflow.executeSwearVow()">Swear Vow</button>
                </div>
            </div>
        `;
        document.body.appendChild(dialog);
        document.getElementById('vow-description').focus();
    }

    // Execute Swear an Iron Vow move
    executeSwearVow() {
        const description = document.getElementById('vow-description').value.trim();
        const rank = document.getElementById('vow-rank').value;
        const context = document.getElementById('vow-context').value.trim();
        const stat = document.querySelector('input[name="vow-stat"]:checked').value;
        const modifiers = parseInt(document.getElementById('vow-modifiers').value) || 0;

        if (!description || !rank) {
            alert('Please fill in the required fields.');
            return;
        }

        // Get the Swear an Iron Vow move
        const move = gameData.getMove('Starforged/Moves/Quest/Swear_an_Iron_Vow');
        if (!move) {
            console.error('Swear an Iron Vow move not found');
            return;
        }

        // Execute the move
        const result = movesSystem.executeMove('Starforged/Moves/Quest/Swear_an_Iron_Vow', {
            stat: stat,
            modifiers: modifiers,
            description: description,
            rank: rank
        });

        // Create the vow based on the result
        const vowData = {
            description: description,
            rank: rank,
            context: context,
            stat: stat,
            timestamp: Date.now()
        };

        // Handle move outcomes
        if (result.roll.outcome === 'strong_hit') {
            vowData.momentum = 2;
            character.addMomentum(2);
        } else if (result.roll.outcome === 'weak_hit') {
            vowData.momentum = 1;
            character.addMomentum(1);
        } else {
            // Miss - mark progress on the vow but face a complication
            vowData.hasComplication = true;
        }

        // Add the vow to character
        const newVow = character.addVow(vowData);

        // Log the move and vow creation
        sceneLog.logMove(move, { stat, modifiers, description, rank }, result);
        sceneLog.logNarrative(`New vow sworn: "${description}" (${rank})`, 'vow-created');

        // Update UI
        this.renderVowsList();
        app.updateCharacterDisplay();
        app.updateRecentLogEntries();

        // Close dialog
        document.querySelector('.modal-overlay').remove();

        // Show result
        this.showMoveResult(result, newVow);
    }

    // Mark progress on a vow
    markVowProgress(vowId) {
        const vow = character.vows.find(v => v.id === vowId);
        if (!vow) return;

        const progressBefore = vow.progress;
        const ticksBefore = vow.ticks;

        character.markVowProgress(vowId);

        const progressAfter = vow.progress;
        const ticksAfter = vow.ticks;

        // Log the progress
        const progressUnit = this.getProgressUnit(vow.rank);
        const progressText = progressUnit >= 4 ? 
            `${Math.floor(progressUnit / 4)} box(es)` : 
            `${progressUnit} tick(s)`;

        sceneLog.logNarrative(
            `Progress marked on vow "${vow.description}": +${progressText} (${progressBefore}/${progressAfter} boxes, ${ticksBefore}/${ticksAfter} ticks)`,
            'vow-progress'
        );

        this.renderVowsList();
        app.updateRecentLogEntries();

        // Check if vow is ready to fulfill
        if (vow.progress >= 10) {
            this.showVowReadyNotification(vow);
        }
    }

    // Show fulfill vow dialog
    showFulfillVowDialog(vowId) {
        const vow = character.vows.find(v => v.id === vowId);
        if (!vow) return;

        if (vow.progress < 10) {
            alert(`This vow is not complete. You need ${10 - vow.progress} more progress boxes before you can attempt to fulfill it.`);
            return;
        }

        const dialog = document.createElement('div');
        dialog.className = 'modal-overlay';
        dialog.innerHTML = `
            <div class="modal-dialog vow-dialog">
                <div class="modal-header">
                    <h3>Fulfill Your Vow</h3>
                    <button class="modal-close" onclick="this.closest('.modal-overlay').remove()">&times;</button>
                </div>
                <div class="modal-body">
                    <div class="vow-summary">
                        <h4>Vow: "${vow.description}"</h4>
                        <p><strong>Rank:</strong> ${vow.rank}</p>
                        <p><strong>Progress:</strong> ${vow.progress}/10 boxes (${vow.ticks} ticks)</p>
                        <p><strong>Progress Score:</strong> ${character.getVowProgressScore(vowId)}</p>
                    </div>
                    <div class="fulfillment-description">
                        <label for="fulfillment-narrative">How is this vow fulfilled?</label>
                        <textarea id="fulfillment-narrative" placeholder="Describe how you complete this quest..." required></textarea>
                    </div>
                    <div class="progress-roll-info">
                        <h4>Progress Roll</h4>
                        <p>You will roll the challenge dice against your progress score of <strong>${character.getVowProgressScore(vowId)}</strong>.</p>
                        <p>Momentum is ignored for progress rolls.</p>
                    </div>
                </div>
                <div class="modal-footer">
                    <button class="btn btn-secondary" onclick="this.closest('.modal-overlay').remove()">Cancel</button>
                    <button class="btn btn-primary" onclick="vowsSubflow.executeFulfillVow('${vowId}')">Fulfill Vow</button>
                </div>
            </div>
        `;
        document.body.appendChild(dialog);
        document.getElementById('fulfillment-narrative').focus();
    }

    // Execute Fulfill Your Vow move
    executeFulfillVow(vowId) {
        const vow = character.vows.find(v => v.id === vowId);
        if (!vow) return;

        const narrative = document.getElementById('fulfillment-narrative').value.trim();
        if (!narrative) {
            alert('Please describe how the vow is fulfilled.');
            return;
        }

        // Get the Fulfill Your Vow move
        const move = gameData.getMove('Starforged/Moves/Quest/Fulfill_Your_Vow');
        if (!move) {
            console.error('Fulfill Your Vow move not found');
            return;
        }

        // Execute the progress move
        const result = movesSystem.executeProgressMove('Starforged/Moves/Quest/Fulfill_Your_Vow', {
            progressScore: character.getVowProgressScore(vowId),
            narrative: narrative
        });

        // Handle outcomes and legacy rewards
        let legacyReward = 0;
        let completed = false;

        if (result.roll.outcome === 'strong_hit') {
            completed = true;
            legacyReward = this.getLegacyReward(vow.rank);
            character.markLegacyTrack('quests', legacyReward);
        } else if (result.roll.outcome === 'weak_hit') {
            // Vow fulfilled but with complications or more to do
            const choice = confirm('Your vow is fulfilled, but there is more to be done or you realize the truth of your quest.\n\nClick OK to swear a new vow (full legacy reward), or Cancel for reduced legacy reward.');
            
            if (choice) {
                legacyReward = this.getLegacyReward(vow.rank);
                // Will prompt for new vow after this
            } else {
                legacyReward = this.getLegacyReward(this.lowerRank(vow.rank));
            }
            
            character.markLegacyTrack('quests', legacyReward);
            completed = true;
        } else {
            // Miss - vow is undone
            const choice = confirm('Your vow is undone through an unexpected complication or realization.\n\nClick OK to give up on the quest (Forsake Your Vow), or Cancel to recommit (lose progress and raise rank).');
            
            if (choice) {
                this.forsakevow(vowId, 'Vow undone through complication');
            } else {
                this.recommitVow(vowId);
            }
        }

        if (completed) {
            // Remove the vow from character
            character.removeVow(vowId);
        }

        // Log the move and outcome
        sceneLog.logMove(move, { vowId, narrative }, result);
        sceneLog.logNarrative(`Vow "${vow.description}" ${completed ? 'fulfilled' : 'undone'}: ${narrative}`, 'vow-fulfilled');

        if (legacyReward > 0) {
            const rewardText = legacyReward >= 4 ? 
                `${Math.floor(legacyReward / 4)} box(es)` : 
                `${legacyReward} tick(s)`;
            sceneLog.logNarrative(`Legacy reward: +${rewardText} on quests track`, 'legacy-reward');
        }

        // Update UI
        this.renderVowsList();
        app.updateCharacterDisplay();
        app.updateRecentLogEntries();

        // Close dialog
        document.querySelector('.modal-overlay').remove();

        // Show result
        this.showMoveResult(result, vow, { narrative, legacyReward, completed });
    }

    // Show forsake vow dialog
    showForsakeVowDialog(vowId) {
        const vow = character.vows.find(v => v.id === vowId);
        if (!vow) return;

        const dialog = document.createElement('div');
        dialog.className = 'modal-overlay';
        dialog.innerHTML = `
            <div class="modal-dialog vow-dialog">
                <div class="modal-header">
                    <h3>Forsake Your Vow</h3>
                    <button class="modal-close" onclick="this.closest('.modal-overlay').remove()">&times;</button>
                </div>
                <div class="modal-body">
                    <div class="vow-summary">
                        <h4>Vow: "${vow.description}"</h4>
                        <p><strong>Rank:</strong> ${vow.rank}</p>
                        <p><strong>Progress:</strong> ${vow.progress}/10 boxes</p>
                    </div>
                    <div class="warning">
                        <p><strong>Warning:</strong> Forsaking a vow will cause you to endure stress equal to the vow's rank.</p>
                        <ul>
                            <li>Troublesome: 1 stress</li>
                            <li>Dangerous: 2 stress</li>
                            <li>Formidable: 3 stress</li>
                            <li>Extreme: 4 stress</li>
                            <li>Epic: 5 stress</li>
                        </ul>
                    </div>
                    <div class="forsake-reason">
                        <label for="forsake-narrative">Why are you forsaking this vow?</label>
                        <textarea id="forsake-narrative" placeholder="Describe why you must abandon this quest..." required></textarea>
                    </div>
                </div>
                <div class="modal-footer">
                    <button class="btn btn-secondary" onclick="this.closest('.modal-overlay').remove()">Cancel</button>
                    <button class="btn btn-danger" onclick="vowsSubflow.executeForsakevow('${vowId}')">Forsake Vow</button>
                </div>
            </div>
        `;
        document.body.appendChild(dialog);
        document.getElementById('forsake-narrative').focus();
    }

    // Execute Forsake Your Vow move
    executeForsakevow(vowId) {
        const vow = character.vows.find(v => v.id === vowId);
        if (!vow) return;

        const narrative = document.getElementById('forsake-narrative').value.trim();
        if (!narrative) {
            alert('Please describe why you are forsaking this vow.');
            return;
        }

        this.forsakevow(vowId, narrative);

        // Close dialog
        document.querySelector('.modal-overlay').remove();
    }

    // Internal forsake vow logic
    forsakevow(vowId, narrative) {
        const vow = character.vows.find(v => v.id === vowId);
        if (!vow) return;

        // Calculate stress damage
        const stressAmount = this.getStressDamage(vow.rank);

        // Apply stress damage
        character.endureStress(stressAmount);

        // Remove the vow
        character.removeVow(vowId);

        // Log the action
        sceneLog.logNarrative(`Vow forsaken: "${vow.description}" - ${narrative}`, 'vow-forsaken');
        sceneLog.logNarrative(`Endured ${stressAmount} stress for forsaking ${vow.rank} vow`, 'stress-damage');

        // Update UI
        this.renderVowsList();
        app.updateCharacterDisplay();
        app.updateRecentLogEntries();

        alert(`Vow forsaken. You endure ${stressAmount} stress.`);
    }

    // Recommit to vow after failed fulfill attempt
    recommitVow(vowId) {
        const vow = character.vows.find(v => v.id === vowId);
        if (!vow) return;

        // Roll both challenge dice and take the lowest
        const roll1 = Math.floor(Math.random() * 10) + 1;
        const roll2 = Math.floor(Math.random() * 10) + 1;
        const progressLoss = Math.min(roll1, roll2);

        // Clear progress boxes
        vow.progress = Math.max(0, vow.progress - progressLoss);
        vow.ticks = 0;

        // Raise vow rank if not already epic
        const oldRank = vow.rank;
        if (vow.rank !== 'epic') {
            vow.rank = this.raiseRank(vow.rank);
        }

        character.saveToStorage();

        // Log the recommitment
        sceneLog.logNarrative(`Recommitted to vow "${vow.description}": Lost ${progressLoss} progress boxes, rank raised from ${oldRank} to ${vow.rank}`, 'vow-recommit');

        this.renderVowsList();
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

    getStressDamage(rank) {
        const stressAmounts = {
            'troublesome': 1,
            'dangerous': 2,
            'formidable': 3,
            'extreme': 4,
            'epic': 5
        };
        return stressAmounts[rank] || 1;
    }

    lowerRank(rank) {
        const ranks = ['troublesome', 'dangerous', 'formidable', 'extreme', 'epic'];
        const index = ranks.indexOf(rank);
        return index > 0 ? ranks[index - 1] : 'troublesome';
    }

    raiseRank(rank) {
        const ranks = ['troublesome', 'dangerous', 'formidable', 'extreme', 'epic'];
        const index = ranks.indexOf(rank);
        return index < ranks.length - 1 ? ranks[index + 1] : 'epic';
    }

    // Show notification when vow is ready to fulfill
    showVowReadyNotification(vow) {
        const notification = document.createElement('div');
        notification.className = 'vow-notification';
        notification.innerHTML = `
            <div class="notification-content">
                <h4>🏆 Vow Ready!</h4>
                <p>Your vow "${vow.description}" is complete and ready to fulfill!</p>
                <button onclick="vowsSubflow.showFulfillVowDialog('${vow.id}'); this.closest('.vow-notification').remove();">Fulfill Now</button>
                <button onclick="this.closest('.vow-notification').remove();">Later</button>
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

    // Render the vows list with enhanced UI
    renderVowsList() {
        const container = document.getElementById('character-vows-display');
        if (!container) return;

        if (character.vows.length === 0) {
            container.innerHTML = `
                <p class="empty-state">No vows sworn</p>
                <button id="swear-new-vow" class="btn btn-primary">Swear an Iron Vow</button>
            `;
            return;
        }

        container.innerHTML = `
            <div class="vows-list">
                ${character.vows.map(vow => this.renderVowItem(vow)).join('')}
            </div>
            <button id="swear-new-vow" class="btn btn-primary">Swear New Vow</button>
        `;
    }

    renderVowItem(vow) {
        const progressPercentage = (vow.progress / 10) * 100;
        const isComplete = vow.progress >= 10;
        const progressUnit = this.getProgressUnit(vow.rank);

        return `
            <div class="vow-item ${isComplete ? 'complete' : ''}">
                <div class="vow-header">
                    <h4 class="vow-description">${vow.description}</h4>
                    <div class="vow-rank badge rank-${vow.rank}">${vow.rank}</div>
                </div>
                
                ${vow.context ? `<p class="vow-context">${vow.context}</p>` : ''}
                
                <div class="vow-progress">
                    <div class="progress-track-container">
                        <div class="progress-track">
                            ${Array(10).fill().map((_, i) => `
                                <div class="progress-box ${i < vow.progress ? 'filled' : ''}">
                                    ${i === vow.progress && vow.ticks > 0 ? 
                                        `<div class="progress-ticks">
                                            ${Array(4).fill().map((_, j) => 
                                                `<div class="tick ${j < vow.ticks ? 'filled' : ''}"></div>`
                                            ).join('')}
                                        </div>` : ''
                                    }
                                </div>
                            `).join('')}
                        </div>
                        <div class="progress-info">
                            <span class="progress-text">${vow.progress}/10 boxes</span>
                            ${vow.ticks > 0 ? `<span class="ticks-text">(+${vow.ticks} ticks)</span>` : ''}
                        </div>
                    </div>
                </div>

                <div class="vow-actions">
                    ${!isComplete ? `
                        <button class="btn btn-sm vow-progress-btn" data-vow-id="${vow.id}">
                            Mark Progress (+${progressUnit >= 4 ? Math.floor(progressUnit / 4) + ' box' : progressUnit + ' tick'}${progressUnit > 1 ? 's' : ''})
                        </button>
                    ` : ''}
                    
                    ${isComplete ? `
                        <button class="btn btn-sm btn-success vow-fulfill-btn" data-vow-id="${vow.id}">
                            Fulfill Vow
                        </button>
                    ` : ''}
                    
                    <button class="btn btn-sm btn-danger vow-forsake-btn" data-vow-id="${vow.id}">
                        Forsake
                    </button>
                </div>

                <div class="vow-metadata">
                    <small>Created: ${new Date(vow.timestamp || Date.now()).toLocaleDateString()}</small>
                </div>
            </div>
        `;
    }

    // Show move result dialog
    showMoveResult(result, vow, extraData = {}) {
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
                            <p>+${extraData.legacyReward >= 4 ? Math.floor(extraData.legacyReward / 4) + ' box(es)' : extraData.legacyReward + ' tick(s)'} on your quests legacy track</p>
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

    // Get move outcome text based on move and outcome
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
window.vowsSubflow = new VowsSubflow();