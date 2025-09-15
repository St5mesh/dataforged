// Connections Subflow Management System
class ConnectionsSubflow {
    constructor() {
        this.connections = [];
        this.connectionMoveHistory = [];
    }

    // Initialize the connections subflow UI
    init() {
        this.setupEventListeners();
        this.renderConnectionsList();
    }

    setupEventListeners() {
        document.addEventListener('click', (e) => {
            if (e.target.id === 'make-new-connection') {
                this.showMakeConnectionDialog();
            }
            if (e.target.classList.contains('connection-develop-btn')) {
                const connectionId = e.target.dataset.connectionId;
                this.showDevelopRelationshipDialog(connectionId);
            }
            if (e.target.classList.contains('connection-forge-bond-btn')) {
                const connectionId = e.target.dataset.connectionId;
                this.showForgeBondDialog(connectionId);
            }
            if (e.target.classList.contains('connection-edit-btn')) {
                const connectionId = e.target.dataset.connectionId;
                this.showEditConnectionDialog(connectionId);
            }
            if (e.target.classList.contains('connection-remove-btn')) {
                const connectionId = e.target.dataset.connectionId;
                this.removeConnection(connectionId);
            }
        });
    }

    // Show Make a Connection dialog
    showMakeConnectionDialog() {
        const dialog = document.createElement('div');
        dialog.className = 'modal-overlay';
        dialog.innerHTML = `
            <div class="modal-dialog connection-dialog">
                <div class="modal-header">
                    <h3>Make a Connection</h3>
                    <button class="modal-close" onclick="this.closest('.modal-overlay').remove()">&times;</button>
                </div>
                <div class="modal-body">
                    <p><strong>When you search out a new relationship or give focus to an existing relationship (not an ally or companion)...</strong></p>
                    
                    <div class="form-group">
                        <label for="connection-name">Connection Name:</label>
                        <input type="text" id="connection-name" placeholder="Enter their name" required>
                    </div>
                    
                    <div class="form-group">
                        <label for="connection-role">Role:</label>
                        <input type="text" id="connection-role" placeholder="e.g., Merchant, Pilot, Smuggler" required>
                    </div>
                    
                    <div class="form-group">
                        <label for="connection-rank">Rank:</label>
                        <select id="connection-rank" required>
                            <option value="">Select rank...</option>
                            <option value="troublesome">Troublesome</option>
                            <option value="dangerous">Dangerous</option>
                            <option value="formidable">Formidable</option>
                            <option value="extreme">Extreme</option>
                            <option value="epic">Epic</option>
                        </select>
                    </div>
                    
                    <div class="form-group">
                        <label for="connection-description">Description:</label>
                        <textarea id="connection-description" placeholder="Describe your connection and how you met..."></textarea>
                    </div>
                    
                    <div class="dice-section">
                        <h4>Roll +Heart</h4>
                        <button type="button" id="roll-make-connection" class="btn btn-primary">Roll the Move</button>
                        <div id="connection-roll-result" class="roll-result" style="display: none;"></div>
                    </div>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" onclick="this.closest('.modal-overlay').remove()">Cancel</button>
                    <button type="button" id="confirm-make-connection" class="btn btn-primary" disabled>Create Connection</button>
                </div>
            </div>
        `;

        document.body.appendChild(dialog);

        // Set up roll button
        const rollBtn = dialog.querySelector('#roll-make-connection');
        const confirmBtn = dialog.querySelector('#confirm-make-connection');
        
        rollBtn.addEventListener('click', () => {
            const heart = character.stats.heart;
            const bonus = character.nextMoveBonus;
            character.nextMoveBonus = 0; // Reset bonus after use
            
            const result = dice.rollMove(heart + bonus);
            this.showMakeConnectionResult(result, dialog);
            confirmBtn.disabled = false;
        });

        // Set up confirm button
        confirmBtn.addEventListener('click', () => {
            this.createConnectionFromDialog(dialog);
            dialog.remove();
        });
    }

    showMakeConnectionResult(result, dialog) {
        const resultDiv = dialog.querySelector('#connection-roll-result');
        resultDiv.style.display = 'block';
        
        let outcomeText = '';
        let outcomeClass = '';
        
        if (result.outcome === 'strong-hit') {
            outcomeClass = 'strong-hit';
            outcomeText = `
                <h4>Strong Hit!</h4>
                <p>You create a connection. Give them a role and rank. Whenever your connection aids you on a move closely associated with their role, add +1 and take +1 momentum on a hit.</p>
            `;
        } else if (result.outcome === 'weak-hit') {
            outcomeClass = 'weak-hit';
            outcomeText = `
                <h4>Weak Hit</h4>
                <p>You create a connection, but it comes with a complication or cost. Envision what they reveal or demand.</p>
                <p>Give the connection a role and rank. Whenever your connection aids you on a move closely associated with their role, add +1 and take +1 momentum on a hit.</p>
            `;
        } else {
            outcomeClass = 'miss';
            outcomeText = `
                <h4>Miss</h4>
                <p>You don't make a connection and the situation worsens. Pay the Price.</p>
            `;
        }
        
        resultDiv.innerHTML = `
            <div class="roll-display">
                <div class="dice-result">
                    <div class="action-die">Action: ${result.actionDie}</div>
                    <div class="challenge-dice">
                        <div class="challenge-die">Challenge: ${result.challengeDie1}</div>
                        <div class="challenge-die">Challenge: ${result.challengeDie2}</div>
                    </div>
                    <div class="total">Total: ${result.total}</div>
                </div>
                <div class="outcome ${outcomeClass}">${outcomeText}</div>
            </div>
        `;

        // Store result for connection creation
        dialog.setAttribute('data-result', result.outcome);
    }

    createConnectionFromDialog(dialog) {
        const name = dialog.querySelector('#connection-name').value;
        const role = dialog.querySelector('#connection-role').value;
        const rank = dialog.querySelector('#connection-rank').value;
        const description = dialog.querySelector('#connection-description').value;
        const result = dialog.getAttribute('data-result');

        if (!name || !role || !rank) {
            alert('Please fill in all required fields');
            return;
        }

        const connection = this.createConnection({
            name,
            role,
            rank,
            description,
            result
        });

        // Log the move
        sceneLog.logMove('Make a Connection', {
            stat: 'heart',
            bonus: character.stats.heart,
            result: result,
            details: `Created connection with ${name} (${role}, ${rank})`
        });

        // Handle weak hit complications
        if (result === 'weak-hit') {
            sceneLog.logNarrative(`Connection with ${name} comes with a complication or cost. What do they reveal or demand?`, 'connection-complication');
        } else if (result === 'miss') {
            sceneLog.logNarrative(`Failed to make connection. The situation worsens.`, 'connection-failure');
        } else {
            sceneLog.logNarrative(`Successfully connected with ${name}, a ${role}. They can provide +1 and +1 momentum when aiding with ${role}-related moves.`, 'connection-success');
        }
    }

    // Create a new connection
    createConnection(options) {
        const connection = {
            id: this.generateId(),
            name: options.name,
            role: options.role,
            secondRole: null, // Can be gained through bond evolution
            rank: options.rank,
            description: options.description,
            progress: 0,
            ticks: 0,
            isBonded: false,
            bondBenefit: null, // 'bolster' or 'expand'
            createdAt: Date.now(),
            updatedAt: Date.now()
        };

        this.connections.push(connection);
        character.connections.push(connection); // Also store in character
        character.saveToStorage();
        this.renderConnectionsList();
        return connection;
    }

    // Show Develop Your Relationship dialog
    showDevelopRelationshipDialog(connectionId) {
        const connection = this.connections.find(c => c.id === connectionId);
        if (!connection) return;

        const dialog = document.createElement('div');
        dialog.className = 'modal-overlay';
        dialog.innerHTML = `
            <div class="modal-dialog connection-dialog">
                <div class="modal-header">
                    <h3>Develop Your Relationship</h3>
                    <button class="modal-close" onclick="this.closest('.modal-overlay').remove()">&times;</button>
                </div>
                <div class="modal-body">
                    <p><strong>Connection:</strong> ${connection.name} (${connection.role})</p>
                    <p><strong>When you reinforce your relationship with a connection by doing any of the following...</strong></p>
                    
                    <div class="form-group">
                        <label>What did you do?</label>
                        <div class="checkbox-group">
                            <label><input type="checkbox" value="shared-dangers"> Shared dangers or hardships</label>
                            <label><input type="checkbox" value="made-sacrifice"> Made a sacrifice for them</label>
                            <label><input type="checkbox" value="gave-support"> Gave them meaningful support</label>
                            <label><input type="checkbox" value="expressed-vulnerability"> Expressed vulnerability</label>
                            <label><input type="checkbox" value="spent-quality-time"> Spent quality time together</label>
                            <label><input type="checkbox" value="shared-intimacy"> Shared intimacy</label>
                        </div>
                    </div>
                    
                    <div class="form-group">
                        <label for="relationship-description">Describe what happened:</label>
                        <textarea id="relationship-description" placeholder="What happened to develop your relationship?"></textarea>
                    </div>
                    
                    <div class="dice-section">
                        <h4>Roll +Heart</h4>
                        <button type="button" id="roll-develop-relationship" class="btn btn-primary">Roll the Move</button>
                        <div id="develop-roll-result" class="roll-result" style="display: none;"></div>
                    </div>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" onclick="this.closest('.modal-overlay').remove()">Cancel</button>
                    <button type="button" id="confirm-develop-relationship" class="btn btn-primary" disabled>Apply Result</button>
                </div>
            </div>
        `;

        document.body.appendChild(dialog);

        // Set up roll button
        const rollBtn = dialog.querySelector('#roll-develop-relationship');
        const confirmBtn = dialog.querySelector('#confirm-develop-relationship');
        
        rollBtn.addEventListener('click', () => {
            const heart = character.stats.heart;
            const bonus = character.nextMoveBonus;
            character.nextMoveBonus = 0;
            
            const result = dice.rollMove(heart + bonus);
            this.showDevelopRelationshipResult(result, connection, dialog);
            confirmBtn.disabled = false;
        });

        // Set up confirm button
        confirmBtn.addEventListener('click', () => {
            this.applyDevelopRelationshipResult(connection, dialog);
            dialog.remove();
        });
    }

    showDevelopRelationshipResult(result, connection, dialog) {
        const resultDiv = dialog.querySelector('#develop-roll-result');
        resultDiv.style.display = 'block';
        
        let outcomeText = '';
        let outcomeClass = '';
        let progressAmount = 0;
        
        if (result.outcome === 'strong-hit') {
            outcomeClass = 'strong-hit';
            progressAmount = this.getProgressAmount(connection.rank);
            outcomeText = `
                <h4>Strong Hit!</h4>
                <p>Mark progress per the connection's rank. On a match, you may also take +1 momentum or +1 spirit.</p>
                <p><strong>Progress:</strong> +${progressAmount >= 4 ? Math.floor(progressAmount / 4) + ' box(es)' : progressAmount + ' tick(s)'}</p>
                ${result.isMatch ? '<p><strong>Match!</strong> Take +1 momentum or +1 spirit.</p>' : ''}
            `;
        } else if (result.outcome === 'weak-hit') {
            outcomeClass = 'weak-hit';
            progressAmount = this.getProgressAmount(connection.rank);
            outcomeText = `
                <h4>Weak Hit</h4>
                <p>Mark progress, but your relationship is tested. Choose one:</p>
                <ul>
                    <li>Reveal a troubling aspect of this connection and mark an additional tick</li>
                    <li>Deepen the relationship and expose yourself to a new danger or complication</li>
                </ul>
                <p><strong>Progress:</strong> +${progressAmount >= 4 ? Math.floor(progressAmount / 4) + ' box(es)' : progressAmount + ' tick(s)'}</p>
            `;
        } else {
            outcomeClass = 'miss';
            outcomeText = `
                <h4>Miss</h4>
                <p>Your relationship suffers a setback. Choose one:</p>
                <ul>
                    <li>Clear a progress box and envision how this undermined your relationship</li>
                    <li>Roll on the Pay the Price table</li>
                </ul>
            `;
        }
        
        resultDiv.innerHTML = `
            <div class="roll-display">
                <div class="dice-result">
                    <div class="action-die">Action: ${result.actionDie}</div>
                    <div class="challenge-dice">
                        <div class="challenge-die">Challenge: ${result.challengeDie1}</div>
                        <div class="challenge-die">Challenge: ${result.challengeDie2}</div>
                    </div>
                    <div class="total">Total: ${result.total}</div>
                </div>
                <div class="outcome ${outcomeClass}">${outcomeText}</div>
            </div>
        `;

        // Store result data
        dialog.setAttribute('data-result', result.outcome);
        dialog.setAttribute('data-is-match', result.isMatch);
        dialog.setAttribute('data-progress', progressAmount);
    }

    applyDevelopRelationshipResult(connection, dialog) {
        const result = dialog.getAttribute('data-result');
        const isMatch = dialog.getAttribute('data-is-match') === 'true';
        const progressAmount = parseInt(dialog.getAttribute('data-progress') || '0');
        const description = dialog.querySelector('#relationship-description').value;

        // Apply progress for hits
        if (result !== 'miss' && progressAmount > 0) {
            this.markConnectionProgress(connection.id, null, progressAmount);
        }

        // Log the move
        sceneLog.logMove('Develop Your Relationship', {
            stat: 'heart',
            bonus: character.stats.heart,
            result: result,
            details: `Developed relationship with ${connection.name}: ${description}`
        });

        // Handle specific outcomes
        if (result === 'strong-hit') {
            if (isMatch) {
                const choice = confirm('Match! Take +1 momentum or +1 spirit?\n\nOK = Momentum, Cancel = Spirit');
                if (choice) {
                    character.addMomentum(1);
                    sceneLog.logNarrative(`Gained +1 momentum from matched strong hit`, 'momentum-gain');
                } else {
                    character.addSpirit(1);
                    sceneLog.logNarrative(`Gained +1 spirit from matched strong hit`, 'spirit-gain');
                }
            }
        } else if (result === 'weak-hit') {
            const choice = confirm('Weak hit: Your relationship is tested.\n\nChoose one:\nOK = Reveal troubling aspect (mark +1 tick)\nCancel = Deepen relationship (new danger/complication)');
            if (choice) {
                this.markConnectionProgress(connection.id, null, 1);
                sceneLog.logNarrative(`Revealed a troubling aspect of ${connection.name}. What was it?`, 'relationship-complication');
            } else {
                sceneLog.logNarrative(`Relationship with ${connection.name} deepened, but exposes you to new danger. What complication arises?`, 'relationship-danger');
            }
        } else { // miss
            const choice = confirm('Miss: Your relationship suffers a setback.\n\nChoose one:\nOK = Clear a progress box\nCancel = Pay the Price');
            if (choice) {
                this.clearConnectionProgress(connection.id, 4); // Clear one box (4 ticks)
                sceneLog.logNarrative(`Relationship with ${connection.name} undermined. How did this happen?`, 'relationship-setback');
            } else {
                sceneLog.logNarrative(`Relationship setback with ${connection.name}. Pay the Price.`, 'pay-the-price');
            }
        }

        this.renderConnectionsList();
    }

    // Show Forge a Bond dialog
    showForgeBondDialog(connectionId) {
        const connection = this.connections.find(c => c.id === connectionId);
        if (!connection) return;

        if (connection.progress < 10) {
            alert('This connection needs to reach full progress (10 boxes) before you can attempt to Forge a Bond.');
            return;
        }

        const dialog = document.createElement('div');
        dialog.className = 'modal-overlay';
        dialog.innerHTML = `
            <div class="modal-dialog connection-dialog">
                <div class="modal-header">
                    <h3>Forge a Bond</h3>
                    <button class="modal-close" onclick="this.closest('.modal-overlay').remove()">&times;</button>
                </div>
                <div class="modal-body">
                    <p><strong>Connection:</strong> ${connection.name} (${connection.role})</p>
                    <p><strong>When your relationship with a connection is ready to evolve...</strong></p>
                    
                    <div class="form-group">
                        <label for="bond-description">Describe how your relationship is ready to evolve:</label>
                        <textarea id="bond-description" placeholder="What brings you closer together?"></textarea>
                    </div>
                    
                    <div class="dice-section">
                        <h4>Progress Roll</h4>
                        <p>Current progress: ${connection.progress}/10 boxes</p>
                        <button type="button" id="roll-forge-bond" class="btn btn-primary">Roll the Move</button>
                        <div id="bond-roll-result" class="roll-result" style="display: none;"></div>
                    </div>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" onclick="this.closest('.modal-overlay').remove()">Cancel</button>
                    <button type="button" id="confirm-forge-bond" class="btn btn-primary" disabled>Apply Result</button>
                </div>
            </div>
        `;

        document.body.appendChild(dialog);

        // Set up roll button
        const rollBtn = dialog.querySelector('#roll-forge-bond');
        const confirmBtn = dialog.querySelector('#confirm-forge-bond');
        
        rollBtn.addEventListener('click', () => {
            const result = dice.rollProgress(connection.progress);
            this.showForgeBondResult(result, connection, dialog);
            confirmBtn.disabled = false;
        });

        // Set up confirm button
        confirmBtn.addEventListener('click', () => {
            this.applyForgeBondResult(connection, dialog);
            dialog.remove();
        });
    }

    showForgeBondResult(result, connection, dialog) {
        const resultDiv = dialog.querySelector('#bond-roll-result');
        resultDiv.style.display = 'block';
        
        let outcomeText = '';
        let outcomeClass = '';
        let legacyReward = 0;
        
        if (result.outcome === 'strong-hit') {
            outcomeClass = 'strong-hit';
            legacyReward = this.getBondLegacyReward(connection.rank);
            outcomeText = `
                <h4>Strong Hit!</h4>
                <p>You now share a bond. Mark a reward on your bonds legacy track per the connection's rank.</p>
                <p><strong>Legacy Reward:</strong> +${legacyReward >= 4 ? Math.floor(legacyReward / 4) + ' box(es)' : legacyReward + ' tick(s)'}</p>
                <p>Choose one:</p>
                <ul>
                    <li><strong>Bolster their influence:</strong> When they aid you on a move closely associated with their role, add +2 instead of +1.</li>
                    <li><strong>Expand their influence:</strong> Give them a second role. When they aid you on a move closely associated with either role, add +1 and take +1 momentum on a hit.</li>
                </ul>
            `;
        } else if (result.outcome === 'weak-hit') {
            outcomeClass = 'weak-hit';
            legacyReward = this.getBondLegacyReward(connection.rank);
            outcomeText = `
                <h4>Weak Hit</h4>
                <p>They ask something more of you first. To gain the bond and the legacy reward, envision the nature of the request, and do it (or Swear an Iron Vow to see it done).</p>
                <p><strong>Legacy Reward:</strong> +${legacyReward >= 4 ? Math.floor(legacyReward / 4) + ' box(es)' : legacyReward + ' tick(s)'} (after completing their request)</p>
                <p>Then choose one:</p>
                <ul>
                    <li><strong>Bolster their influence:</strong> When they aid you on a move closely associated with their role, add +2 instead of +1.</li>
                    <li><strong>Expand their influence:</strong> Give them a second role. When they aid you on a move closely associated with either role, add +1 and take +1 momentum on a hit.</li>
                </ul>
            `;
        } else {
            outcomeClass = 'miss';
            outcomeText = `
                <h4>Miss</h4>
                <p>They reveal a motivation or background that puts you at odds. If you recommit to this relationship, roll both challenge dice, take the lowest value, and clear that number of progress boxes. Then, raise the connection's rank by one (if not already epic).</p>
            `;
        }
        
        resultDiv.innerHTML = `
            <div class="roll-display">
                <div class="dice-result">
                    <div class="challenge-dice">
                        <div class="challenge-die">Challenge: ${result.challengeDie1}</div>
                        <div class="challenge-die">Challenge: ${result.challengeDie2}</div>
                    </div>
                    <div class="progress">Progress: ${result.progress}</div>
                </div>
                <div class="outcome ${outcomeClass}">${outcomeText}</div>
            </div>
        `;

        // Store result data
        dialog.setAttribute('data-result', result.outcome);
        dialog.setAttribute('data-legacy-reward', legacyReward);
    }

    applyForgeBondResult(connection, dialog) {
        const result = dialog.getAttribute('data-result');
        const legacyReward = parseInt(dialog.getAttribute('data-legacy-reward') || '0');
        const description = dialog.querySelector('#bond-description').value;

        // Log the move
        sceneLog.logMove('Forge a Bond', {
            type: 'progress',
            progress: connection.progress,
            result: result,
            details: `Attempted to forge bond with ${connection.name}: ${description}`
        });

        if (result === 'strong-hit') {
            // Award legacy and allow bond choice
            character.markLegacyTrack('bonds', legacyReward);
            const choice = confirm('Strong Hit! Choose bond benefit:\n\nOK = Bolster their influence (+2 instead of +1)\nCancel = Expand their influence (second role)');
            
            connection.isBonded = true;
            if (choice) {
                connection.bondBenefit = 'bolster';
                sceneLog.logNarrative(`Forged bond with ${connection.name}. They now provide +2 (instead of +1) when aiding with ${connection.role}-related moves.`, 'bond-success');
            } else {
                connection.bondBenefit = 'expand';
                const secondRole = prompt('What is their second role?');
                if (secondRole) {
                    connection.secondRole = secondRole;
                    sceneLog.logNarrative(`Forged bond with ${connection.name}. They can now aid with both ${connection.role} and ${secondRole} moves, providing +1 and +1 momentum.`, 'bond-success');
                }
            }
            
            sceneLog.logNarrative(`Legacy reward: +${legacyReward >= 4 ? Math.floor(legacyReward / 4) + ' box(es)' : legacyReward + ' tick(s)'} on bonds track`, 'legacy-reward');
            
        } else if (result === 'weak-hit') {
            const request = prompt('Weak Hit: What do they ask of you first?');
            if (request) {
                sceneLog.logNarrative(`${connection.name} asks something of you first: "${request}". Complete this to gain the bond and legacy reward.`, 'bond-request');
            }
            
        } else { // miss
            const choice = confirm('Miss: They reveal a motivation that puts you at odds.\n\nDo you want to recommit to this relationship?\n\nOK = Yes (clear progress and raise rank)\nCancel = No');
            if (choice) {
                const die1 = dice.rollD10();
                const die2 = dice.rollD10();
                const clearAmount = Math.min(die1, die2) * 4; // Convert boxes to ticks
                
                this.clearConnectionProgress(connection.id, clearAmount);
                connection.rank = this.raiseRank(connection.rank);
                
                sceneLog.logNarrative(`Recommitted to relationship with ${connection.name}. Cleared ${Math.floor(clearAmount / 4)} progress boxes and raised rank to ${connection.rank}.`, 'bond-setback');
            } else {
                sceneLog.logNarrative(`Relationship with ${connection.name} has deteriorated. What was revealed that puts you at odds?`, 'bond-failure');
            }
        }

        this.renderConnectionsList();
        character.saveToStorage();
    }

    // Utility methods
    generateId() {
        return 'connection_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    getProgressAmount(rank) {
        const progressAmounts = {
            'troublesome': 12, // 3 boxes
            'dangerous': 8,    // 2 boxes  
            'formidable': 4,   // 1 box
            'extreme': 8,      // 2 ticks
            'epic': 4          // 1 tick
        };
        return progressAmounts[rank] || 4;
    }

    getBondLegacyReward(rank) {
        const legacyRewards = {
            'troublesome': 1,  // 1 tick
            'dangerous': 2,    // 2 ticks
            'formidable': 4,   // 1 box
            'extreme': 8,      // 2 boxes
            'epic': 12         // 3 boxes
        };
        return legacyRewards[rank] || 1;
    }

    raiseRank(currentRank) {
        const rankProgression = ['troublesome', 'dangerous', 'formidable', 'extreme', 'epic'];
        const currentIndex = rankProgression.indexOf(currentRank);
        return currentIndex < rankProgression.length - 1 ? rankProgression[currentIndex + 1] : 'epic';
    }

    // Mark progress on a connection
    markConnectionProgress(connectionId, rank = null, amount = null) {
        const connection = this.connections.find(c => c.id === connectionId);
        if (!connection) return false;

        const progressAmount = amount || this.getProgressAmount(rank || connection.rank);
        connection.ticks += progressAmount;

        // Convert ticks to progress boxes
        while (connection.ticks >= 4 && connection.progress < 10) {
            connection.progress++;
            connection.ticks -= 4;
        }

        // Cap at 10 boxes
        if (connection.progress >= 10) {
            connection.progress = 10;
            connection.ticks = 0;
        }

        connection.updatedAt = Date.now();
        this.renderConnectionsList();
        character.saveToStorage();
        return true;
    }

    // Clear progress from a connection  
    clearConnectionProgress(connectionId, ticksToRemove) {
        const connection = this.connections.find(c => c.id === connectionId);
        if (!connection) return false;

        const totalTicks = (connection.progress * 4) + connection.ticks;
        const newTotalTicks = Math.max(0, totalTicks - ticksToRemove);
        
        connection.progress = Math.floor(newTotalTicks / 4);
        connection.ticks = newTotalTicks % 4;
        
        connection.updatedAt = Date.now();
        this.renderConnectionsList();
        character.saveToStorage();
        return true;
    }

    // Remove a connection
    removeConnection(connectionId) {
        if (!confirm('Are you sure you want to remove this connection?')) return;
        
        this.connections = this.connections.filter(c => c.id !== connectionId);
        character.connections = character.connections.filter(c => c.id !== connectionId);
        character.saveToStorage();
        this.renderConnectionsList();
    }

    // Show edit connection dialog
    showEditConnectionDialog(connectionId) {
        const connection = this.connections.find(c => c.id === connectionId);
        if (!connection) return;

        const dialog = document.createElement('div');
        dialog.className = 'modal-overlay';
        dialog.innerHTML = `
            <div class="modal-dialog connection-dialog">
                <div class="modal-header">
                    <h3>Edit Connection</h3>
                    <button class="modal-close" onclick="this.closest('.modal-overlay').remove()">&times;</button>
                </div>
                <div class="modal-body">
                    <div class="form-group">
                        <label for="edit-connection-name">Name:</label>
                        <input type="text" id="edit-connection-name" value="${connection.name}" required>
                    </div>
                    
                    <div class="form-group">
                        <label for="edit-connection-role">Primary Role:</label>
                        <input type="text" id="edit-connection-role" value="${connection.role}" required>
                    </div>
                    
                    ${connection.secondRole ? `
                    <div class="form-group">
                        <label for="edit-connection-second-role">Second Role:</label>
                        <input type="text" id="edit-connection-second-role" value="${connection.secondRole}">
                    </div>
                    ` : ''}
                    
                    <div class="form-group">
                        <label for="edit-connection-rank">Rank:</label>
                        <select id="edit-connection-rank" required>
                            <option value="troublesome" ${connection.rank === 'troublesome' ? 'selected' : ''}>Troublesome</option>
                            <option value="dangerous" ${connection.rank === 'dangerous' ? 'selected' : ''}>Dangerous</option>
                            <option value="formidable" ${connection.rank === 'formidable' ? 'selected' : ''}>Formidable</option>
                            <option value="extreme" ${connection.rank === 'extreme' ? 'selected' : ''}>Extreme</option>
                            <option value="epic" ${connection.rank === 'epic' ? 'selected' : ''}>Epic</option>
                        </select>
                    </div>
                    
                    <div class="form-group">
                        <label for="edit-connection-description">Description:</label>
                        <textarea id="edit-connection-description">${connection.description || ''}</textarea>
                    </div>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" onclick="this.closest('.modal-overlay').remove()">Cancel</button>
                    <button type="button" id="save-connection-edit" class="btn btn-primary">Save Changes</button>
                </div>
            </div>
        `;

        document.body.appendChild(dialog);

        // Set up save button
        dialog.querySelector('#save-connection-edit').addEventListener('click', () => {
            connection.name = dialog.querySelector('#edit-connection-name').value;
            connection.role = dialog.querySelector('#edit-connection-role').value;
            connection.rank = dialog.querySelector('#edit-connection-rank').value;
            connection.description = dialog.querySelector('#edit-connection-description').value;
            
            if (connection.secondRole) {
                connection.secondRole = dialog.querySelector('#edit-connection-second-role').value;
            }
            
            connection.updatedAt = Date.now();
            
            this.renderConnectionsList();
            character.saveToStorage();
            dialog.remove();
        });
    }

    // Render the connections list
    renderConnectionsList() {
        const container = document.getElementById('connections-list');
        if (!container) return;

        if (this.connections.length === 0) {
            container.innerHTML = '<p class="no-connections">No connections yet. Use "Make a Connection" to meet new people in your journey.</p>';
            return;
        }

        container.innerHTML = this.connections.map(connection => `
            <div class="connection-card ${connection.isBonded ? 'bonded' : ''}">
                <div class="connection-header">
                    <h4>${connection.name} ${connection.isBonded ? '♦' : ''}</h4>
                    <div class="connection-actions">
                        <button class="btn btn-sm connection-edit-btn" data-connection-id="${connection.id}">Edit</button>
                        <button class="btn btn-sm connection-remove-btn" data-connection-id="${connection.id}">Remove</button>
                    </div>
                </div>
                
                <div class="connection-details">
                    <p><strong>Role:</strong> ${connection.role}${connection.secondRole ? ` & ${connection.secondRole}` : ''}</p>
                    <p><strong>Rank:</strong> ${connection.rank}</p>
                    ${connection.description ? `<p><strong>Description:</strong> ${connection.description}</p>` : ''}
                    ${connection.isBonded ? `<p><strong>Bond:</strong> ${connection.bondBenefit === 'bolster' ? 'Bolstered influence (+2 aid)' : 'Expanded influence (dual roles)'}</p>` : ''}
                </div>
                
                <div class="progress-display">
                    <div class="progress-track">
                        ${this.renderProgressTrack(connection.progress, connection.ticks)}
                    </div>
                    <div class="progress-text">${connection.progress}/10 boxes</div>
                </div>
                
                <div class="connection-buttons">
                    ${!connection.isBonded ? `
                        <button class="btn connection-develop-btn" data-connection-id="${connection.id}">Develop Relationship</button>
                        ${connection.progress >= 10 ? `<button class="btn connection-forge-bond-btn" data-connection-id="${connection.id}">Forge a Bond</button>` : ''}
                    ` : ''}
                </div>
            </div>
        `).join('');
    }

    renderProgressTrack(progress, ticks) {
        let track = '';
        for (let i = 0; i < 10; i++) {
            if (i < progress) {
                track += '<div class="progress-box filled">●</div>';
            } else if (i === progress && ticks > 0) {
                track += `<div class="progress-box partial">${'•'.repeat(ticks)}</div>`;
            } else {
                track += '<div class="progress-box empty">○</div>';
            }
        }
        return track;
    }

    // Load connections from character
    loadConnections() {
        this.connections = character.connections || [];
        this.renderConnectionsList();
    }
}

// Initialize connections subflow
const connectionsSubflow = new ConnectionsSubflow();