// Legacy / Advancement System - Experience and Asset Management
class AdvancementSystem {
    constructor() {
        this.initialized = false;
    }

    init() {
        if (this.initialized) return;
        
        this.setupEventListeners();
        this.initialized = true;
        console.log('Advancement system initialized');
    }

    setupEventListeners() {
        // Advancement dialog triggers
        document.addEventListener('click', (e) => {
            if (e.target.id === 'spend-experience-btn') {
                this.showAdvancementDialog();
            } else if (e.target.id === 'mark-milestone-btn') {
                this.showMilestoneDialog();
            } else if (e.target.id === 'manage-assets-btn') {
                this.showAssetManagementDialog();
            }
        });

        // Dialog handlers
        document.addEventListener('click', (e) => {
            if (e.target.id === 'execute-advancement') {
                this.executeAdvancement();
            } else if (e.target.id === 'cancel-advancement') {
                this.hideAdvancementDialog();
            } else if (e.target.id === 'execute-milestone') {
                this.executeMilestone();
            } else if (e.target.id === 'cancel-milestone') {
                this.hideMilestoneDialog();
            } else if (e.target.id === 'execute-asset-management') {
                this.executeAssetManagement();
            } else if (e.target.id === 'cancel-asset-management') {
                this.hideAssetManagementDialog();
            }
        });
    }

    // Experience and Advancement Management
    showAdvancementDialog() {
        const dialog = document.getElementById('advancement-dialog') || this.createAdvancementDialog();
        this.populateAdvancementOptions();
        dialog.style.display = 'block';
    }

    createAdvancementDialog() {
        const dialog = document.createElement('div');
        dialog.id = 'advancement-dialog';
        dialog.className = 'modal';
        dialog.innerHTML = `
            <div class="dialog">
                <h3>Spend Experience</h3>
                <p>Current Experience: <span id="current-experience-display">0</span></p>
                
                <div class="form-group">
                    <label for="advancement-type">Choose Advancement:</label>
                    <select id="advancement-type">
                        <option value="">Select advancement type...</option>
                        <option value="new-asset">New Asset (3 experience)</option>
                        <option value="upgrade-asset">Upgrade Existing Asset (2 experience)</option>
                        <option value="special-advance">Special Advance (varies)</option>
                    </select>
                </div>
                
                <div id="advancement-details" style="display: none;">
                    <!-- Details will be populated based on selection -->
                </div>
                
                <div class="dialog-buttons">
                    <button id="execute-advancement" class="btn btn-primary" disabled>Spend Experience</button>
                    <button id="cancel-advancement" class="btn">Cancel</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(dialog);
        
        // Set up change handler for advancement type
        document.getElementById('advancement-type').addEventListener('change', (e) => {
            this.updateAdvancementDetails(e.target.value);
        });
        
        return dialog;
    }

    populateAdvancementOptions() {
        const experienceDisplay = document.getElementById('current-experience-display');
        if (experienceDisplay) {
            experienceDisplay.textContent = character.experience;
        }
    }

    updateAdvancementDetails(type) {
        const detailsContainer = document.getElementById('advancement-details');
        const executeBtn = document.getElementById('execute-advancement');
        
        if (!type) {
            detailsContainer.style.display = 'none';
            executeBtn.disabled = true;
            return;
        }

        let canAfford = false;
        let detailsHTML = '';

        switch (type) {
            case 'new-asset':
                canAfford = character.experience >= 3;
                detailsHTML = `
                    <div class="form-group">
                        <label for="asset-category">Asset Category:</label>
                        <select id="asset-category">
                            <option value="">Choose category...</option>
                            <option value="path">Path (additional background)</option>
                            <option value="companion">Companion</option>
                            <option value="module">Module (starship upgrade)</option>
                            <option value="support-vehicle">Support Vehicle</option>
                            <option value="deed">Deed</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label for="asset-name">Asset Name:</label>
                        <input type="text" id="asset-name" placeholder="Enter asset name...">
                    </div>
                `;
                break;
                
            case 'upgrade-asset':
                canAfford = character.experience >= 2;
                const upgradeableAssets = character.assets.filter(asset => 
                    asset.enabledAbilities.filter(enabled => enabled).length < 3
                );
                
                if (upgradeableAssets.length === 0) {
                    detailsHTML = '<p>No assets can be upgraded (all abilities are already unlocked).</p>';
                    canAfford = false;
                } else {
                    detailsHTML = `
                        <div class="form-group">
                            <label for="upgrade-asset-select">Select Asset to Upgrade:</label>
                            <select id="upgrade-asset-select">
                                <option value="">Choose asset...</option>
                                ${upgradeableAssets.map(asset => 
                                    `<option value="${asset.id}">${asset.name}</option>`
                                ).join('')}
                            </select>
                        </div>
                    `;
                }
                break;
                
            case 'special-advance':
                canAfford = character.experience >= 2; // Minimum cost
                detailsHTML = `
                    <div class="form-group">
                        <label for="special-advance-type">Special Advance Type:</label>
                        <select id="special-advance-type">
                            <option value="">Choose advance...</option>
                            <option value="add-stat">Increase stat by 1 (4 experience)</option>
                            <option value="add-momentum-max">Increase momentum max by 1 (3 experience)</option>
                            <option value="add-momentum-reset">Increase momentum reset by 1 (2 experience)</option>
                            <option value="clear-condition">Clear permanent condition (3 experience)</option>
                        </select>
                    </div>
                    <div id="special-advance-details"></div>
                `;
                break;
        }

        detailsContainer.innerHTML = detailsHTML;
        detailsContainer.style.display = 'block';
        executeBtn.disabled = !canAfford;
        
        if (!canAfford) {
            executeBtn.textContent = 'Insufficient Experience';
        } else {
            executeBtn.textContent = 'Spend Experience';
        }
    }

    executeAdvancement() {
        const type = document.getElementById('advancement-type').value;
        
        switch (type) {
            case 'new-asset':
                this.executeNewAsset();
                break;
            case 'upgrade-asset':
                this.executeUpgradeAsset();
                break;
            case 'special-advance':
                this.executeSpecialAdvance();
                break;
        }
    }

    executeNewAsset() {
        const category = document.getElementById('asset-category').value;
        const name = document.getElementById('asset-name').value;
        
        if (!category || !name) {
            alert('Please fill in all fields');
            return;
        }

        if (character.spendExperience(3, `New ${category} asset: ${name}`)) {
            // Add asset to character (simplified - in full implementation would use game data)
            const newAsset = {
                id: `custom-${Date.now()}`,
                name: name,
                type: category,
                abilities: [`${name} ability 1`, `${name} ability 2`, `${name} ability 3`],
                inputs: {},
                enabledAbilities: [true, false, false] // First ability always enabled
            };
            
            character.assets.push(newAsset);
            character.saveToStorage();
            
            this.hideAdvancementDialog();
            app.updateCharacterDisplay();
            
            alert(`New ${category} asset "${name}" acquired for 3 experience!`);
        }
    }

    executeUpgradeAsset() {
        const assetId = document.getElementById('upgrade-asset-select').value;
        
        if (!assetId) {
            alert('Please select an asset to upgrade');
            return;
        }

        const asset = character.getAsset(assetId);
        if (!asset) {
            alert('Asset not found');
            return;
        }

        if (character.spendExperience(2, `Upgraded asset: ${asset.name}`)) {
            // Find next ability to unlock
            const nextAbilityIndex = asset.enabledAbilities.findIndex(enabled => !enabled);
            if (nextAbilityIndex !== -1) {
                asset.enabledAbilities[nextAbilityIndex] = true;
                character.saveToStorage();
                
                this.hideAdvancementDialog();
                app.updateCharacterDisplay();
                
                alert(`Asset "${asset.name}" upgraded for 2 experience!`);
            }
        }
    }

    executeSpecialAdvance() {
        const advanceType = document.getElementById('special-advance-type').value;
        
        switch (advanceType) {
            case 'add-stat':
                this.executeStatIncrease();
                break;
            case 'add-momentum-max':
                if (character.spendExperience(3, 'Increased momentum max')) {
                    character.momentumMax++;
                    character.saveToStorage();
                    alert('Momentum max increased by 1!');
                }
                break;
            case 'add-momentum-reset':
                if (character.spendExperience(2, 'Increased momentum reset')) {
                    character.momentumReset++;
                    character.saveToStorage();
                    alert('Momentum reset increased by 1!');
                }
                break;
            case 'clear-condition':
                this.executeClearCondition();
                break;
        }
        
        if (advanceType !== 'add-stat' && advanceType !== 'clear-condition') {
            this.hideAdvancementDialog();
            app.updateCharacterDisplay();
        }
    }

    executeStatIncrease() {
        // Show stat selection dialog
        const currentStats = Object.entries(character.stats);
        const canIncrease = currentStats.filter(([stat, value]) => value < 4);
        
        if (canIncrease.length === 0) {
            alert('All stats are already at maximum (4)');
            return;
        }

        const statChoice = prompt(`Choose stat to increase (4 experience):\n${
            canIncrease.map(([stat, value]) => `${stat}: ${value}`).join('\n')
        }\n\nEnter stat name:`);

        if (statChoice && character.stats[statChoice.toLowerCase()] < 4) {
            if (character.spendExperience(4, `Increased ${statChoice} stat`)) {
                character.stats[statChoice.toLowerCase()]++;
                character.saveToStorage();
                this.hideAdvancementDialog();
                app.updateCharacterDisplay();
                alert(`${statChoice} increased by 1!`);
            }
        }
    }

    executeClearCondition() {
        const permanentConditions = ['maimed', 'corrupted'].filter(condition => 
            character.getCondition(condition)
        );
        
        if (permanentConditions.length === 0) {
            alert('No permanent conditions to clear');
            return;
        }

        const conditionChoice = prompt(`Choose condition to clear (3 experience):\n${
            permanentConditions.join('\n')
        }\n\nEnter condition name:`);

        if (conditionChoice && permanentConditions.includes(conditionChoice.toLowerCase())) {
            if (character.spendExperience(3, `Cleared ${conditionChoice} condition`)) {
                character.setCondition(conditionChoice.toLowerCase(), false);
                this.hideAdvancementDialog();
                app.updateCharacterDisplay();
                alert(`${conditionChoice} condition cleared!`);
            }
        }
    }

    hideAdvancementDialog() {
        const dialog = document.getElementById('advancement-dialog');
        if (dialog) {
            dialog.style.display = 'none';
        }
    }

    // Milestone Management
    showMilestoneDialog() {
        const dialog = document.getElementById('milestone-dialog') || this.createMilestoneDialog();
        dialog.style.display = 'block';
    }

    createMilestoneDialog() {
        const dialog = document.createElement('div');
        dialog.id = 'milestone-dialog';
        dialog.className = 'modal';
        dialog.innerHTML = `
            <div class="dialog">
                <h3>Mark Milestone</h3>
                <p>Mark progress when you achieve significant story milestones.</p>
                
                <div class="form-group">
                    <label for="milestone-type">Milestone Type:</label>
                    <select id="milestone-type">
                        <option value="">Select milestone type...</option>
                        <option value="quest-complete">Completed important quest/vow</option>
                        <option value="major-discovery">Made significant discovery</option>
                        <option value="bond-forged">Forged meaningful connection</option>
                        <option value="other">Other significant milestone</option>
                    </select>
                </div>
                
                <div class="form-group">
                    <label for="milestone-description">Description:</label>
                    <textarea id="milestone-description" placeholder="Describe the milestone achieved..."></textarea>
                </div>
                
                <div id="milestone-rewards" style="display: none;">
                    <h4>Legacy Track Progress</h4>
                    <div class="form-group">
                        <label>
                            <input type="checkbox" id="mark-quests"> Mark Quests legacy track
                        </label>
                    </div>
                    <div class="form-group">
                        <label>
                            <input type="checkbox" id="mark-bonds"> Mark Bonds legacy track
                        </label>
                    </div>
                    <div class="form-group">
                        <label>
                            <input type="checkbox" id="mark-discoveries"> Mark Discoveries legacy track
                        </label>
                    </div>
                </div>
                
                <div class="dialog-buttons">
                    <button id="execute-milestone" class="btn btn-primary" disabled>Mark Milestone</button>
                    <button id="cancel-milestone" class="btn">Cancel</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(dialog);
        
        document.getElementById('milestone-type').addEventListener('change', (e) => {
            const rewardsDiv = document.getElementById('milestone-rewards');
            const executeBtn = document.getElementById('execute-milestone');
            
            if (e.target.value) {
                rewardsDiv.style.display = 'block';
                executeBtn.disabled = false;
            } else {
                rewardsDiv.style.display = 'none';
                executeBtn.disabled = true;
            }
        });
        
        return dialog;
    }

    executeMilestone() {
        const type = document.getElementById('milestone-type').value;
        const description = document.getElementById('milestone-description').value;
        
        if (!type || !description.trim()) {
            alert('Please fill in all fields');
            return;
        }

        const markQuests = document.getElementById('mark-quests').checked;
        const markBonds = document.getElementById('mark-bonds').checked;
        const markDiscoveries = document.getElementById('mark-discoveries').checked;

        let experienceGained = 0;

        if (markQuests) {
            character.markLegacyTrack('quests', 4); // 1 tick = 4 progress points
            experienceGained += 2;
        }
        if (markBonds) {
            character.markLegacyTrack('bonds', 4);
            experienceGained += 2;
        }
        if (markDiscoveries) {
            character.markLegacyTrack('discoveries', 4);
            experienceGained += 2;
        }

        sceneLog.addEntry('milestone', `Milestone achieved: ${description}`, {
            type: type,
            legacyMarked: { markQuests, markBonds, markDiscoveries },
            experienceGained: experienceGained
        });

        this.hideMilestoneDialog();
        app.updateCharacterDisplay();
        
        alert(`Milestone marked! ${experienceGained > 0 ? `Gained ${experienceGained} experience from legacy progress.` : ''}`);
    }

    hideMilestoneDialog() {
        const dialog = document.getElementById('milestone-dialog');
        if (dialog) {
            dialog.style.display = 'none';
        }
    }

    // Asset Management
    showAssetManagementDialog() {
        const dialog = document.getElementById('asset-management-dialog') || this.createAssetManagementDialog();
        this.populateAssetList();
        dialog.style.display = 'block';
    }

    createAssetManagementDialog() {
        const dialog = document.createElement('div');
        dialog.id = 'asset-management-dialog';
        dialog.className = 'modal';
        dialog.innerHTML = `
            <div class="dialog" style="max-width: 600px;">
                <h3>Manage Assets</h3>
                
                <div id="asset-list">
                    <!-- Assets will be populated here -->
                </div>
                
                <div class="dialog-buttons">
                    <button id="cancel-asset-management" class="btn">Close</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(dialog);
        return dialog;
    }

    populateAssetList() {
        const container = document.getElementById('asset-list');
        if (!container) return;

        if (character.assets.length === 0) {
            container.innerHTML = '<p>No assets acquired yet.</p>';
            return;
        }

        container.innerHTML = character.assets.map(asset => `
            <div class="asset-card" style="border: 1px solid var(--border-color); margin: 10px 0; padding: 15px; border-radius: 6px;">
                <h4>${asset.name}</h4>
                <p><strong>Type:</strong> ${asset.type}</p>
                <div class="asset-abilities">
                    ${asset.abilities.map((ability, index) => `
                        <div class="ability ${asset.enabledAbilities[index] ? 'enabled' : 'disabled'}" style="margin: 5px 0; padding: 5px; background: ${asset.enabledAbilities[index] ? 'rgba(40, 167, 69, 0.1)' : 'rgba(108, 117, 125, 0.1)'}; border-radius: 4px;">
                            <input type="checkbox" ${asset.enabledAbilities[index] ? 'checked' : ''} disabled> ${ability}
                        </div>
                    `).join('')}
                </div>
            </div>
        `).join('');
    }

    hideAssetManagementDialog() {
        const dialog = document.getElementById('asset-management-dialog');
        if (dialog) {
            dialog.style.display = 'none';
        }
    }
}

// Initialize the advancement system
const advancementSystem = new AdvancementSystem();