// Enhanced Move Runner System - Advanced Move Support and Context-Sensitive Helpers
class EnhancedMoveRunner {
    constructor() {
        this.initialized = false;
        this.moveHistory = [];
        this.contextualMoves = new Map();
        this.narrativeMoveTemplates = new Map();
        this.setupContextualMoves();
    }

    init() {
        if (this.initialized) return;
        
        this.setupEventListeners();
        this.setupNarrativeMoveTemplates();
        this.initialized = true;
        console.log('Enhanced move runner initialized');
    }

    setupEventListeners() {
        // Enhanced move dialog triggers
        document.addEventListener('click', (e) => {
            if (e.target.id === 'enhanced-move-runner') {
                this.showEnhancedMoveDialog();
            } else if (e.target.classList.contains('contextual-move')) {
                this.executeContextualMove(e.target.dataset.moveId, e.target.dataset.context);
            } else if (e.target.classList.contains('narrative-move')) {
                this.showNarrativeMoveDialog(e.target.dataset.moveId);
            }
        });

        // Enhanced move execution
        document.addEventListener('click', (e) => {
            if (e.target.id === 'execute-enhanced-move') {
                this.executeEnhancedMove();
            } else if (e.target.id === 'cancel-enhanced-move') {
                this.hideEnhancedMoveDialog();
            }
        });

        // Stat selection enhancement
        document.addEventListener('change', (e) => {
            if (e.target.id === 'move-stat-select') {
                this.updateStatSelectionGuidance(e.target.value);
            } else if (e.target.id === 'move-select') {
                this.updateMoveContext(e.target.value);
            }
        });
    }

    setupContextualMoves() {
        // Define contextual move suggestions based on game state
        this.contextualMoves.set('low_health', [
            { id: 'Heal', context: 'Health is low', priority: 'high' },
            { id: 'Endure_Harm', context: 'Taking damage', priority: 'high' },
            { id: 'Face_Death', context: 'Health is zero', priority: 'critical' }
        ]);

        this.contextualMoves.set('low_spirit', [
            { id: 'Hearten', context: 'Spirit is low', priority: 'high' },
            { id: 'Endure_Stress', context: 'Taking stress', priority: 'high' },
            { id: 'Face_Desolation', context: 'Spirit is zero', priority: 'critical' }
        ]);

        this.contextualMoves.set('low_supply', [
            { id: 'Resupply', context: 'Supply is low', priority: 'medium' },
            { id: 'Sojourn', context: 'Need to rest and resupply', priority: 'medium' }
        ]);

        this.contextualMoves.set('in_combat', [
            { id: 'Enter_the_Fray', context: 'Starting combat', priority: 'high' },
            { id: 'Strike', context: 'Attacking in combat', priority: 'high' },
            { id: 'Clash', context: 'Trading blows', priority: 'high' },
            { id: 'Gain_Ground', context: 'Taking initiative', priority: 'medium' },
            { id: 'React_Under_Fire', context: 'Under pressure', priority: 'medium' },
            { id: 'End_the_Fight', context: 'Finishing combat', priority: 'high' }
        ]);

        this.contextualMoves.set('exploration', [
            { id: 'Set_a_Course', context: 'Traveling to new location', priority: 'high' },
            { id: 'Explore_a_Waypoint', context: 'Investigating location', priority: 'high' },
            { id: 'Undertake_an_Expedition', context: 'Long journey', priority: 'medium' },
            { id: 'Ask_the_Oracle', context: 'Need guidance', priority: 'low' }
        ]);

        this.contextualMoves.set('social', [
            { id: 'Compel', context: 'Persuading someone', priority: 'medium' },
            { id: 'Make_a_Connection', context: 'Building relationships', priority: 'low' },
            { id: 'Test_Your_Relationship', context: 'Relationship under stress', priority: 'medium' },
            { id: 'Aid_Your_Ally', context: 'Helping companion', priority: 'medium' }
        ]);
    }

    setupNarrativeMoveTemplates() {
        // Templates for narrative moves that need context
        this.narrativeMoveTemplates.set('Face_Danger', {
            prompts: [
                'What danger are you facing?',
                'How are you attempting to overcome it?',
                'What makes this particularly challenging?'
            ],
            statGuidance: {
                'edge': 'Use when relying on speed, agility, or quick reflexes',
                'heart': 'Use when facing social dangers or relying on courage',
                'iron': 'Use when using physical strength or endurance',
                'shadow': 'Use when being stealthy, deceptive, or subtle',
                'wits': 'Use when using knowledge, perception, or clever thinking'
            }
        });

        this.narrativeMoveTemplates.set('Secure_an_Advantage', {
            prompts: [
                'What advantage are you trying to create?',
                'How are you positioning yourself?',
                'What preparation or setup are you doing?'
            ],
            statGuidance: {
                'edge': 'Acting quickly or with finesse',
                'heart': 'Using social connections or inspiration',
                'iron': 'Using strength or intimidation',
                'shadow': 'Using stealth or misdirection',
                'wits': 'Using knowledge or careful planning'
            }
        });

        this.narrativeMoveTemplates.set('Gather_Information', {
            prompts: [
                'What information are you seeking?',
                'How are you investigating or researching?',
                'What sources or methods are you using?'
            ],
            statGuidance: {
                'edge': 'Quick reconnaissance or infiltration',
                'heart': 'Social investigation, asking questions',
                'iron': 'Intimidation or forceful interrogation',
                'shadow': 'Subtle observation or eavesdropping',
                'wits': 'Research, analysis, or deduction'
            }
        });

        this.narrativeMoveTemplates.set('Compel', {
            prompts: [
                'Who are you trying to influence?',
                'What do you want them to do?',
                'What approach are you taking?'
            ],
            statGuidance: {
                'heart': 'Appeal to emotions, charm, or inspire',
                'iron': 'Intimidation or show of force',
                'shadow': 'Manipulation or deception',
                'wits': 'Logical argument or revealing information'
            }
        });
    }

    // Context Analysis
    analyzeCurrentContext() {
        const contexts = [];
        
        // Health/condition analysis
        if (character.meters.health <= 1) {
            contexts.push('low_health');
        }
        if (character.meters.spirit <= 1) {
            contexts.push('low_spirit');
        }
        if (character.meters.supply <= 1) {
            contexts.push('low_supply');
        }
        
        // Check for active conditions
        if (Object.values(character.conditions).some(condition => condition)) {
            contexts.push('has_conditions');
        }
        
        // Check recent scene log for context clues
        const recentEntries = sceneLog.getRecentEntries(5);
        const hasCombat = recentEntries.some(entry => 
            entry.text.includes('combat') || entry.text.includes('fight') || 
            entry.type === 'move' && ['Strike', 'Clash', 'Enter_the_Fray'].some(move => entry.text.includes(move))
        );
        
        if (hasCombat) {
            contexts.push('in_combat');
        }
        
        const hasExploration = recentEntries.some(entry => 
            entry.text.includes('explore') || entry.text.includes('travel') ||
            entry.type === 'move' && ['Set_a_Course', 'Explore_a_Waypoint'].some(move => entry.text.includes(move))
        );
        
        if (hasExploration) {
            contexts.push('exploration');
        }

        return contexts;
    }

    getContextualSuggestions() {
        const contexts = this.analyzeCurrentContext();
        const suggestions = [];

        contexts.forEach(context => {
            const moves = this.contextualMoves.get(context) || [];
            suggestions.push(...moves.map(move => ({
                ...move,
                context: context
            })));
        });

        // Sort by priority
        const priorityOrder = { 'critical': 0, 'high': 1, 'medium': 2, 'low': 3 };
        return suggestions.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);
    }

    // Enhanced Move Dialog
    showEnhancedMoveDialog() {
        const dialog = document.getElementById('enhanced-move-dialog') || this.createEnhancedMoveDialog();
        this.populateMoveCategories();
        this.populateContextualSuggestions();
        dialog.style.display = 'block';
    }

    createEnhancedMoveDialog() {
        const dialog = document.createElement('div');
        dialog.id = 'enhanced-move-dialog';
        dialog.className = 'modal';
        dialog.innerHTML = `
            <div class="dialog large-dialog">
                <h3>Enhanced Move Runner</h3>
                
                <div class="move-tabs">
                    <button class="tab-btn active" data-tab="contextual">Suggested</button>
                    <button class="tab-btn" data-tab="browse">Browse Moves</button>
                    <button class="tab-btn" data-tab="narrative">Narrative Tools</button>
                </div>
                
                <div class="tab-content">
                    <!-- Contextual Suggestions Tab -->
                    <div id="contextual-tab" class="tab-panel active">
                        <h4>Context-Based Suggestions</h4>
                        <div class="context-analysis">
                            <p>Based on your current situation:</p>
                            <div id="contextual-suggestions">
                                <!-- Suggestions will be populated here -->
                            </div>
                        </div>
                        
                        <div class="quick-moves">
                            <h4>Always Available</h4>
                            <div class="quick-move-buttons">
                                <button class="btn quick-move" data-move="Face_Danger">Face Danger</button>
                                <button class="btn quick-move" data-move="Secure_an_Advantage">Secure Advantage</button>
                                <button class="btn quick-move" data-move="Gather_Information">Gather Information</button>
                                <button class="btn quick-move" data-move="Ask_the_Oracle">Ask Oracle</button>
                            </div>
                        </div>
                    </div>
                    
                    <!-- Browse Moves Tab -->
                    <div id="browse-tab" class="tab-panel">
                        <div class="move-search">
                            <input type="text" id="move-search" placeholder="Search moves...">
                        </div>
                        <div id="move-categories">
                            <!-- Move categories will be populated here -->
                        </div>
                    </div>
                    
                    <!-- Narrative Tools Tab -->
                    <div id="narrative-tab" class="tab-panel">
                        <h4>Narrative Move Assistant</h4>
                        <div class="narrative-tools">
                            <div class="form-group">
                                <label for="narrative-move-select">Select Move:</label>
                                <select id="narrative-move-select">
                                    <option value="">Choose a move...</option>
                                    <option value="Face_Danger">Face Danger</option>
                                    <option value="Secure_an_Advantage">Secure an Advantage</option>
                                    <option value="Gather_Information">Gather Information</option>
                                    <option value="Compel">Compel</option>
                                </select>
                            </div>
                            <div id="narrative-prompts" style="display: none;">
                                <!-- Narrative prompts will be populated here -->
                            </div>
                        </div>
                    </div>
                </div>
                
                <div class="dialog-buttons">
                    <button id="cancel-enhanced-move" class="btn">Close</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(dialog);
        
        // Set up tab switching
        dialog.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.switchMoveTab(e.target.dataset.tab);
            });
        });

        // Set up narrative move selection
        document.getElementById('narrative-move-select').addEventListener('change', (e) => {
            this.showNarrativePrompts(e.target.value);
        });
        
        return dialog;
    }

    switchMoveTab(tabName) {
        const dialog = document.getElementById('enhanced-move-dialog');
        
        // Update tab buttons
        dialog.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.tab === tabName);
        });
        
        // Update tab panels
        dialog.querySelectorAll('.tab-panel').forEach(panel => {
            panel.classList.toggle('active', panel.id === `${tabName}-tab`);
        });
    }

    populateContextualSuggestions() {
        const container = document.getElementById('contextual-suggestions');
        if (!container) return;

        const suggestions = this.getContextualSuggestions();
        
        if (suggestions.length === 0) {
            container.innerHTML = '<p class="no-suggestions">No specific suggestions based on current context. Try the "Always Available" moves below.</p>';
            return;
        }

        container.innerHTML = suggestions.map(suggestion => {
            const priorityClass = `priority-${suggestion.priority}`;
            return `
                <div class="contextual-suggestion ${priorityClass}">
                    <div class="suggestion-header">
                        <h5>${this.getMoveDisplayName(suggestion.id)}</h5>
                        <span class="priority-badge ${priorityClass}">${suggestion.priority}</span>
                    </div>
                    <p class="suggestion-reason">${suggestion.context}</p>
                    <button class="btn contextual-move-btn" data-move="${suggestion.id}">Make Move</button>
                </div>
            `;
        }).join('');
    }

    populateMoveCategories() {
        const container = document.getElementById('move-categories');
        if (!container) return;

        const moveCategories = this.getMoveCategories();
        
        container.innerHTML = moveCategories.map(category => `
            <div class="move-category">
                <h4 class="category-header">${category.name}</h4>
                <div class="moves-list">
                    ${category.moves.map(move => `
                        <div class="move-item">
                            <h5>${move.Name}</h5>
                            <button class="btn btn-small make-move-btn" data-move="${move.$id}">Make Move</button>
                        </div>
                    `).join('')}
                </div>
            </div>
        `).join('');
    }

    getMoveCategories() {
        // This would ideally get move categories from game data
        // For now, returning a simplified structure
        return [
            {
                name: 'Adventure',
                moves: [
                    { Name: 'Face Danger', $id: 'Face_Danger' },
                    { Name: 'Secure an Advantage', $id: 'Secure_an_Advantage' },
                    { Name: 'Gather Information', $id: 'Gather_Information' },
                    { Name: 'Compel', $id: 'Compel' },
                    { Name: 'Aid Your Ally', $id: 'Aid_Your_Ally' }
                ]
            },
            {
                name: 'Combat',
                moves: [
                    { Name: 'Enter the Fray', $id: 'Enter_the_Fray' },
                    { Name: 'Strike', $id: 'Strike' },
                    { Name: 'Clash', $id: 'Clash' },
                    { Name: 'Gain Ground', $id: 'Gain_Ground' },
                    { Name: 'React Under Fire', $id: 'React_Under_Fire' }
                ]
            },
            {
                name: 'Recovery',
                moves: [
                    { Name: 'Heal', $id: 'Heal' },
                    { Name: 'Hearten', $id: 'Hearten' },
                    { Name: 'Resupply', $id: 'Resupply' },
                    { Name: 'Sojourn', $id: 'Sojourn' },
                    { Name: 'Repair', $id: 'Repair' }
                ]
            }
        ];
    }

    getMoveDisplayName(moveId) {
        // Convert move ID to display name
        return moveId.replace(/_/g, ' ');
    }

    showNarrativePrompts(moveId) {
        const container = document.getElementById('narrative-prompts');
        if (!container) return;

        const template = this.narrativeMoveTemplates.get(moveId);
        if (!template) {
            container.style.display = 'none';
            return;
        }

        container.innerHTML = `
            <div class="narrative-prompt-section">
                <h5>Consider These Questions:</h5>
                <ul class="narrative-questions">
                    ${template.prompts.map(prompt => `<li>${prompt}</li>`).join('')}
                </ul>
                
                <h5>Stat Selection Guidance:</h5>
                <div class="stat-guidance">
                    ${Object.entries(template.statGuidance).map(([stat, guidance]) => `
                        <div class="stat-guidance-item">
                            <strong>${stat.charAt(0).toUpperCase() + stat.slice(1)}:</strong> ${guidance}
                        </div>
                    `).join('')}
                </div>
                
                <div class="narrative-action">
                    <button class="btn btn-primary guided-move-btn" data-move="${moveId}">Make ${this.getMoveDisplayName(moveId)} Move</button>
                </div>
            </div>
        `;
        
        container.style.display = 'block';
    }

    executeContextualMove(moveId, context) {
        // Execute move with additional context logging
        const moveResult = movesSystem.executeMove(moveId, {
            context: context,
            contextual: true
        });
        
        if (moveResult) {
            sceneLog.addEntry('move', `**${this.getMoveDisplayName(moveId)}** (${context})`, moveResult);
        }
        
        this.hideEnhancedMoveDialog();
        return moveResult;
    }

    showGuidedMoveDialog(moveId) {
        const template = this.narrativeMoveTemplates.get(moveId);
        if (!template) {
            // Fall back to regular move dialog
            app.showMoveInterface(moveId);
            return;
        }

        const dialog = document.createElement('div');
        dialog.className = 'modal';
        dialog.innerHTML = `
            <div class="dialog">
                <h3>Guided ${this.getMoveDisplayName(moveId)} Move</h3>
                
                <div class="guided-prompts">
                    ${template.prompts.map((prompt, index) => `
                        <div class="form-group">
                            <label>${prompt}</label>
                            <textarea class="narrative-response" data-prompt="${index}" placeholder="Describe your approach..."></textarea>
                        </div>
                    `).join('')}
                </div>
                
                <div class="form-group">
                    <label for="guided-stat-select">Which stat best represents your approach?</label>
                    <select id="guided-stat-select">
                        <option value="">Choose stat...</option>
                        ${Object.entries(template.statGuidance).map(([stat, guidance]) => `
                            <option value="${stat}">${stat.charAt(0).toUpperCase() + stat.slice(1)} - ${guidance}</option>
                        `).join('')}
                    </select>
                </div>
                
                <div class="form-group">
                    <label for="guided-modifiers">Any modifiers? (assets, conditions, etc.)</label>
                    <input type="number" id="guided-modifiers" value="0" min="-3" max="3">
                </div>
                
                <div class="dialog-buttons">
                    <button id="execute-guided-move" class="btn btn-primary" data-move="${moveId}">Make Move</button>
                    <button class="btn" onclick="this.parentElement.parentElement.parentElement.remove()">Cancel</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(dialog);
        
        document.getElementById('execute-guided-move').addEventListener('click', () => {
            this.executeGuidedMove(moveId, dialog);
        });
    }

    executeGuidedMove(moveId, dialog) {
        const stat = document.getElementById('guided-stat-select').value;
        const modifiers = parseInt(document.getElementById('guided-modifiers').value) || 0;
        
        if (!stat) {
            alert('Please select a stat for this move');
            return;
        }

        // Collect narrative responses
        const responses = [];
        dialog.querySelectorAll('.narrative-response').forEach((textarea, index) => {
            const response = textarea.value.trim();
            if (response) {
                responses.push(response);
            }
        });

        // Build narrative description
        const narrativeDescription = responses.join(' ');
        
        // Apply condition penalties
        const conditionPenalty = character.getConditionPenalty();
        const totalModifiers = modifiers + conditionPenalty;

        // Execute the move
        const result = movesSystem.executeMove(moveId, {
            stat: stat,
            modifiers: totalModifiers,
            narrative: narrativeDescription
        });

        if (result) {
            // Enhanced logging with narrative context
            sceneLog.addEntry('move', 
                `**${this.getMoveDisplayName(moveId)}** (${stat}${totalModifiers !== 0 ? totalModifiers > 0 ? `+${totalModifiers}` : totalModifiers : ''}): ${narrativeDescription}`, 
                result
            );
        }

        dialog.remove();
        this.hideEnhancedMoveDialog();
        
        return result;
    }

    hideEnhancedMoveDialog() {
        const dialog = document.getElementById('enhanced-move-dialog');
        if (dialog) {
            dialog.style.display = 'none';
        }
    }

    // Enhanced move history and analytics
    recordMoveResult(moveId, result, context = null) {
        const record = {
            timestamp: new Date(),
            moveId: moveId,
            moveName: this.getMoveDisplayName(moveId),
            result: result,
            context: context,
            character: {
                health: character.meters.health,
                spirit: character.meters.spirit,
                supply: character.meters.supply,
                momentum: character.momentum
            }
        };

        this.moveHistory.push(record);
        
        // Keep only recent history
        if (this.moveHistory.length > 50) {
            this.moveHistory = this.moveHistory.slice(-50);
        }
    }

    getMoveStatistics() {
        if (this.moveHistory.length === 0) return null;

        const stats = {
            totalMoves: this.moveHistory.length,
            outcomeDistribution: { strong_hit: 0, weak_hit: 0, miss: 0 },
            mostUsedMoves: {},
            recentStreak: { outcome: null, count: 0 }
        };

        this.moveHistory.forEach(move => {
            // Outcome distribution
            if (move.result.outcome) {
                stats.outcomeDistribution[move.result.outcome]++;
            }

            // Most used moves
            stats.mostUsedMoves[move.moveName] = (stats.mostUsedMoves[move.moveName] || 0) + 1;
        });

        // Recent streak analysis
        if (this.moveHistory.length > 0) {
            const recent = this.moveHistory.slice(-5);
            let streakOutcome = recent[recent.length - 1].result.outcome;
            let streakCount = 1;

            for (let i = recent.length - 2; i >= 0; i--) {
                if (recent[i].result.outcome === streakOutcome) {
                    streakCount++;
                } else {
                    break;
                }
            }

            stats.recentStreak = { outcome: streakOutcome, count: streakCount };
        }

        return stats;
    }
}

// Initialize the enhanced move runner
const enhancedMoveRunner = new EnhancedMoveRunner();