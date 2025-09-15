// Combat Subflow Management System
class CombatSubflow {
    constructor() {
        this.activeCombats = [];
    }

    init() {
        console.log('Combat subflow initialized');
        this.setupEventListeners();
    }

    setupEventListeners() {
        // Add combat button listener
        const addCombatBtn = document.getElementById('add-combat');
        if (addCombatBtn) {
            addCombatBtn.addEventListener('click', () => this.showEnterFrayDialog());
        }
    }

    // Create a new combat
    createCombat(options) {
        const combat = {
            id: this.generateId(),
            objective: options.objective,
            rank: options.rank,
            progress: 0,
            inControl: options.inControl || false,
            createdAt: Date.now(),
            updatedAt: Date.now()
        };

        this.activeCombats.push(combat);
        this.renderCombatList();
        return combat;
    }

    generateId() {
        return 'combat_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    // Show Enter the Fray dialog
    showEnterFrayDialog() {
        const modal = document.createElement('div');
        modal.className = 'modal-overlay';
        modal.innerHTML = `
            <div class="modal">
                <div class="modal-header">
                    <h3>Enter the Fray</h3>
                    <button class="modal-close">&times;</button>
                </div>
                <div class="modal-body">
                    <div class="form-group">
                        <label for="combat-objective">Combat Objective</label>
                        <input type="text" id="combat-objective" placeholder="What are you trying to achieve?" required>
                    </div>
                    <div class="form-group">
                        <label for="combat-rank">Objective Rank</label>
                        <select id="combat-rank" required>
                            <option value="">Select rank...</option>
                            <option value="troublesome">Troublesome</option>
                            <option value="dangerous">Dangerous</option>
                            <option value="formidable">Formidable</option>
                            <option value="extreme">Extreme</option>
                            <option value="epic">Epic</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label for="combat-approach">Your Approach</label>
                        <select id="combat-approach" required>
                            <option value="">Select your approach...</option>
                            <option value="edge">On the move (Edge)</option>
                            <option value="heart">Facing off against your foe (Heart)</option>
                            <option value="iron">In the thick of it at close quarters (Iron)</option>
                            <option value="shadow">Preparing to act against an unaware foe (Shadow)</option>
                            <option value="wits">Caught in a trap or sizing up the situation (Wits)</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label for="combat-narrative">Describe the situation</label>
                        <textarea id="combat-narrative" placeholder="Envision how the fight begins..." required></textarea>
                    </div>
                </div>
                <div class="modal-footer">
                    <button id="execute-enter-fray" class="btn btn-primary">Roll Enter the Fray</button>
                    <button class="modal-close btn">Cancel</button>
                </div>
            </div>
        `;

        document.body.appendChild(modal);

        // Event listeners
        modal.querySelector('#execute-enter-fray').addEventListener('click', () => {
            this.executeEnterFray();
        });

        modal.querySelectorAll('.modal-close').forEach(btn => {
            btn.addEventListener('click', () => modal.remove());
        });
    }

    // Execute Enter the Fray move
    executeEnterFray() {
        const objective = document.getElementById('combat-objective').value.trim();
        const rank = document.getElementById('combat-rank').value;
        const approach = document.getElementById('combat-approach').value;
        const narrative = document.getElementById('combat-narrative').value.trim();

        if (!objective || !rank || !approach || !narrative) {
            alert('Please fill in all required fields.');
            return;
        }

        // Get the Enter the Fray move
        const move = gameData.getMove('Starforged/Moves/Combat/Enter_the_Fray');
        if (!move) {
            console.error('Enter the Fray move not found');
            return;
        }

        // Execute the move
        const result = movesSystem.executeMove('Starforged/Moves/Combat/Enter_the_Fray', {
            stat: approach,
            narrative: narrative
        });

        // Create the combat based on result
        const combat = this.createCombat({
            objective: objective,
            rank: rank,
            inControl: result.roll.outcome === 'strong_hit' || 
                      (result.roll.outcome === 'weak_hit' && result.playerChoice === 'control')
        });

        // Apply move results
        if (result.roll.outcome === 'strong_hit') {
            character.addMomentum(2);
            combat.inControl = true;
            sceneLog.logNarrative(`Combat objective "${objective}" begun: +2 momentum, in control`, 'combat-start');
        } else if (result.roll.outcome === 'weak_hit') {
            // Player needs to choose between momentum or control
            this.showWeakHitChoice(combat, result);
            return;
        } else {
            sceneLog.logNarrative(`Combat objective "${objective}" begun: Fight begins with you in a bad spot`, 'combat-start');
        }

        // Log the combat start
        sceneLog.logMove(result);

        // Update UI
        this.renderCombatList();
        app.updateCharacterDisplay();
        app.updateRecentLogEntries();

        // Close dialog
        document.querySelector('.modal-overlay').remove();

        // Show result
        this.showMoveResult(result, combat);
    }

    // Show weak hit choice for Enter the Fray
    showWeakHitChoice(combat, result) {
        const modal = document.createElement('div');
        modal.className = 'modal-overlay';
        modal.innerHTML = `
            <div class="modal">
                <div class="modal-header">
                    <h3>Enter the Fray - Weak Hit</h3>
                </div>
                <div class="modal-body">
                    <p>Choose one benefit:</p>
                    <div class="choice-buttons">
                        <button id="choose-momentum" class="btn">Take +2 momentum</button>
                        <button id="choose-control" class="btn">You are in control</button>
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(modal);

        modal.querySelector('#choose-momentum').addEventListener('click', () => {
            character.addMomentum(2);
            combat.inControl = false;
            sceneLog.logNarrative(`Combat objective "${combat.objective}" begun: +2 momentum`, 'combat-start');
            this.finalizeCombatStart(combat, result, modal);
        });

        modal.querySelector('#choose-control').addEventListener('click', () => {
            combat.inControl = true;
            sceneLog.logNarrative(`Combat objective "${combat.objective}" begun: You are in control`, 'combat-start');
            this.finalizeCombatStart(combat, result, modal);
        });
    }

    finalizeCombatStart(combat, result, modal) {
        sceneLog.logMove(result);
        this.renderCombatList();
        app.updateCharacterDisplay();
        app.updateRecentLogEntries();
        modal.remove();
        document.querySelector('.modal-overlay').remove();
        this.showMoveResult(result, combat);
    }

    // Get combat by ID
    getCombat(combatId) {
        return this.activeCombats.find(c => c.id === combatId);
    }

    // Mark progress on combat
    markCombatProgress(combatId, times = 1) {
        const combat = this.getCombat(combatId);
        if (!combat) return;

        const progressUnit = this.getProgressUnit(combat.rank);
        combat.progress += progressUnit * times;
        combat.progress = Math.min(combat.progress, 40); // Max 10 boxes
        combat.updatedAt = Date.now();

        const progressText = times === 1 ? 'progress' : `progress (x${times})`;
        sceneLog.logNarrative(`Combat "${combat.objective}": Marked ${progressText}`, 'combat-progress');

        this.renderCombatList();

        // Check if ready for decisive action
        if (combat.progress >= 40) {
            this.showCombatReadyNotification(combat);
        }
    }

    // Show combat moves options
    showCombatMoves(combatId) {
        const combat = this.getCombat(combatId);
        if (!combat) return;

        const modal = document.createElement('div');
        modal.className = 'modal-overlay';
        
        const controlMoves = combat.inControl ? `
            <button onclick="combatSubflow.showGainGroundDialog('${combatId}')" class="btn">Gain Ground</button>
            <button onclick="combatSubflow.showStrikeDialog('${combatId}')" class="btn">Strike</button>
        ` : `
            <button onclick="combatSubflow.showReactUnderFireDialog('${combatId}')" class="btn">React Under Fire</button>
            <button onclick="combatSubflow.showClashDialog('${combatId}')" class="btn">Clash</button>
        `;

        modal.innerHTML = `
            <div class="modal">
                <div class="modal-header">
                    <h3>Combat Moves - ${combat.objective}</h3>
                    <button class="modal-close">&times;</button>
                </div>
                <div class="modal-body">
                    <div class="combat-status">
                        <p><strong>Status:</strong> ${combat.inControl ? 'In Control' : 'In a Bad Spot'}</p>
                        <p><strong>Progress:</strong> ${Math.floor(combat.progress / 4)}/10 boxes</p>
                    </div>
                    <div class="combat-moves">
                        <h4>Available Moves:</h4>
                        ${controlMoves}
                        <button onclick="combatSubflow.showTakeDecisiveActionDialog('${combatId}')" class="btn ${combat.progress < 40 ? 'disabled' : ''}">Take Decisive Action</button>
                        <button onclick="combatSubflow.showBattleDialog('${combatId}')" class="btn">Battle (Alternative)</button>
                        <button onclick="combatSubflow.abandonCombat('${combatId}')" class="btn btn-secondary">Face Defeat</button>
                    </div>
                </div>
                <div class="modal-footer">
                    <button class="modal-close btn">Close</button>
                </div>
            </div>
        `;

        document.body.appendChild(modal);

        modal.querySelectorAll('.modal-close').forEach(btn => {
            btn.addEventListener('click', () => modal.remove());
        });
    }

    // Show Gain Ground dialog
    showGainGroundDialog(combatId) {
        const combat = this.getCombat(combatId);
        if (!combat) return;

        const modal = document.createElement('div');
        modal.className = 'modal-overlay';
        modal.innerHTML = `
            <div class="modal">
                <div class="modal-header">
                    <h3>Gain Ground</h3>
                    <button class="modal-close">&times;</button>
                </div>
                <div class="modal-body">
                    <div class="form-group">
                        <label for="gain-ground-approach">Your Approach</label>
                        <select id="gain-ground-approach" required>
                            <option value="">Select your approach...</option>
                            <option value="edge">In pursuit, fleeing, or maneuvering (Edge)</option>
                            <option value="heart">Charging boldly, aiding others, negotiating, or commanding (Heart)</option>
                            <option value="iron">Gaining leverage with force, powering through, or making a threat (Iron)</option>
                            <option value="shadow">Hiding, preparing an ambush, or misdirecting (Shadow)</option>
                            <option value="wits">Coordinating a plan, studying situation, or gaining leverage (Wits)</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label for="gain-ground-narrative">Describe your action</label>
                        <textarea id="gain-ground-narrative" placeholder="How do you reinforce your position or move toward your objective?" required></textarea>
                    </div>
                </div>
                <div class="modal-footer">
                    <button onclick="combatSubflow.executeGainGround('${combatId}')" class="btn btn-primary">Roll Gain Ground</button>
                    <button class="modal-close btn">Cancel</button>
                </div>
            </div>
        `;

        document.body.appendChild(modal);

        modal.querySelectorAll('.modal-close').forEach(btn => {
            btn.addEventListener('click', () => modal.remove());
        });
    }

    // Execute Gain Ground move
    executeGainGround(combatId) {
        const combat = this.getCombat(combatId);
        if (!combat) return;

        const approach = document.getElementById('gain-ground-approach').value;
        const narrative = document.getElementById('gain-ground-narrative').value.trim();

        if (!approach || !narrative) {
            alert('Please fill in all required fields.');
            return;
        }

        const result = movesSystem.executeMove('Starforged/Moves/Combat/Gain_Ground', {
            stat: approach,
            narrative: narrative
        });

        if (result.roll.outcome === 'strong_hit') {
            this.showGainGroundChoices(combatId, result, 2);
        } else if (result.roll.outcome === 'weak_hit') {
            this.showGainGroundChoices(combatId, result, 1);
        } else {
            // Miss: lose control and Pay the Price
            combat.inControl = false;
            sceneLog.logNarrative(`Combat "${combat.objective}": You are in a bad spot and must Pay the Price`, 'combat-miss');
            this.handlePayThePrice(combat, result);
        }

        document.querySelector('.modal-overlay').remove();
    }

    // Show Gain Ground outcome choices
    showGainGroundChoices(combatId, result, choiceCount) {
        const combat = this.getCombat(combatId);
        const modal = document.createElement('div');
        modal.className = 'modal-overlay';
        modal.innerHTML = `
            <div class="modal">
                <div class="modal-header">
                    <h3>Gain Ground - ${result.roll.outcome === 'strong_hit' ? 'Strong Hit' : 'Weak Hit'}</h3>
                </div>
                <div class="modal-body">
                    <p>You stay in control. Choose ${choiceCount === 2 ? 'two' : 'one'}:</p>
                    <div class="choice-checkboxes">
                        <label><input type="checkbox" name="gain-ground-benefit" value="progress"> Mark progress</label>
                        <label><input type="checkbox" name="gain-ground-benefit" value="momentum"> Take +2 momentum</label>
                        <label><input type="checkbox" name="gain-ground-benefit" value="advantage"> Add +1 on your next move (not a progress move)</label>
                    </div>
                </div>
                <div class="modal-footer">
                    <button onclick="combatSubflow.applyGainGroundChoices('${combatId}', ${choiceCount}, '${JSON.stringify(result).replace(/'/g, "\\'")}')" class="btn btn-primary">Apply Choices</button>
                </div>
            </div>
        `;

        document.body.appendChild(modal);
    }

    // Apply Gain Ground choices
    applyGainGroundChoices(combatId, choiceCount, resultStr) {
        const combat = this.getCombat(combatId);
        const result = JSON.parse(resultStr);
        const selectedBoxes = document.querySelectorAll('input[name="gain-ground-benefit"]:checked');

        if (selectedBoxes.length !== choiceCount) {
            alert(`Please select exactly ${choiceCount === 2 ? 'two' : 'one'} option(s).`);
            return;
        }

        const choices = Array.from(selectedBoxes).map(box => box.value);
        
        choices.forEach(choice => {
            switch (choice) {
                case 'progress':
                    this.markCombatProgress(combatId);
                    break;
                case 'momentum':
                    character.addMomentum(2);
                    break;
                case 'advantage':
                    character.addNextMoveBonus(1);
                    sceneLog.logNarrative('Next move gets +1 (not progress moves)', 'combat-advantage');
                    break;
            }
        });

        sceneLog.logMove(result);
        this.renderCombatList();
        app.updateCharacterDisplay();
        app.updateRecentLogEntries();

        document.querySelector('.modal-overlay').remove();
        this.showMoveResult(result, combat);
    }

    // Get progress unit based on rank
    getProgressUnit(rank) {
        const progressUnits = {
            'troublesome': 12,
            'dangerous': 8,
            'formidable': 4,
            'extreme': 2,
            'epic': 1
        };
        return progressUnits[rank] || 4;
    }

    // Show combat ready notification
    showCombatReadyNotification(combat) {
        const notification = document.createElement('div');
        notification.className = 'notification success';
        notification.innerHTML = `
            <p><strong>Combat Ready!</strong> "${combat.objective}" has full progress and is ready for Take Decisive Action.</p>
        `;
        document.body.appendChild(notification);
        
        setTimeout(() => {
            if (notification.parentNode) {
                notification.remove();
            }
        }, 5000);
    }

    // Handle Pay the Price
    handlePayThePrice(combat, result) {
        const payThePriceResult = movesSystem.payThePrice();
        if (payThePriceResult) {
            sceneLog.logNarrative(`Pay the Price: ${payThePriceResult.result}`, 'pay-the-price');
        }
    }

    // Abandon combat (Face Defeat)
    abandonCombat(combatId) {
        const combat = this.getCombat(combatId);
        if (!combat) return;

        if (confirm(`Are you sure you want to face defeat and abandon "${combat.objective}"?`)) {
            // Remove combat from active list
            this.activeCombats = this.activeCombats.filter(c => c.id !== combatId);
            
            sceneLog.logNarrative(`Combat "${combat.objective}" ended in defeat`, 'combat-defeat');
            
            // Pay the Price for failure
            this.handlePayThePrice(combat, null);
            
            this.renderCombatList();
            document.querySelector('.modal-overlay')?.remove();
        }
    }

    // Render the combat list
    renderCombatList() {
        const container = document.getElementById('combat-list');
        if (!container) return;

        if (this.activeCombats.length === 0) {
            container.innerHTML = '<p>No active combats</p>';
            return;
        }

        container.innerHTML = this.activeCombats.map(combat => 
            this.renderCombatItem(combat)
        ).join('');
    }

    // Render individual combat item
    renderCombatItem(combat) {
        const progressBoxes = Math.floor(combat.progress / 4);
        const remainingTicks = combat.progress % 4;
        
        return `
            <div class="combat-item" data-combat-id="${combat.id}">
                <div class="combat-header">
                    <h4>${combat.objective}</h4>
                    <div class="combat-status ${combat.inControl ? 'in-control' : 'bad-spot'}">
                        ${combat.inControl ? 'In Control' : 'In a Bad Spot'}
                    </div>
                </div>
                <div class="combat-details">
                    <p><strong>Rank:</strong> ${this.capitalizeFirst(combat.rank)}</p>
                    <div class="progress-track">
                        <div class="progress-boxes">
                            ${Array(10).fill().map((_, i) => {
                                let boxClass = 'progress-box';
                                if (i < progressBoxes) {
                                    boxClass += ' filled';
                                } else if (i === progressBoxes && remainingTicks > 0) {
                                    boxClass += ' partial';
                                }
                                return `<div class="${boxClass}">
                                    ${i === progressBoxes && remainingTicks > 0 ? 
                                        `<div class="ticks">${'●'.repeat(remainingTicks)}</div>` : ''}
                                </div>`;
                            }).join('')}
                        </div>
                        <small>Progress: ${progressBoxes}/10 boxes (${remainingTicks} ticks)</small>
                    </div>
                </div>
                <div class="combat-actions">
                    <button onclick="combatSubflow.showCombatMoves('${combat.id}')" class="btn btn-sm">Combat Moves</button>
                    <button onclick="combatSubflow.markCombatProgress('${combat.id}')" class="btn btn-sm">Mark Progress</button>
                    <button onclick="combatSubflow.abandonCombat('${combat.id}')" class="btn btn-sm btn-secondary">Face Defeat</button>
                </div>
            </div>
        `;
    }

    // Helper function to capitalize first letter
    capitalizeFirst(str) {
        return str.charAt(0).toUpperCase() + str.slice(1);
    }

    // Show move result dialog
    showMoveResult(result, combat, extraData = {}) {
        const modal = document.createElement('div');
        modal.className = 'modal-overlay';
        modal.innerHTML = `
            <div class="modal">
                <div class="modal-header">
                    <h3>Move Result: ${result.moveName}</h3>
                    <button class="modal-close">&times;</button>
                </div>
                <div class="modal-body">
                    <div class="move-result">
                        <div class="roll-result">
                            <h4>${this.capitalizeFirst(result.roll.outcome.replace('_', ' '))}</h4>
                            <p>Action Die: ${result.roll.actionDie} + ${result.roll.stat} = ${result.roll.actionScore}</p>
                            <p>Challenge Dice: ${result.roll.challengeDice.join(', ')}</p>
                            ${result.roll.isMatch ? '<p class="match">Match!</p>' : ''}
                        </div>
                        <div class="outcome-text">
                            <p>${result.outcomeText}</p>
                        </div>
                    </div>
                </div>
                <div class="modal-footer">
                    <button class="modal-close btn">Close</button>
                </div>
            </div>
        `;

        document.body.appendChild(modal);

        modal.querySelectorAll('.modal-close').forEach(btn => {
            btn.addEventListener('click', () => modal.remove());
        });
    }
}

// Initialize the combat subflow
const combatSubflow = new CombatSubflow();