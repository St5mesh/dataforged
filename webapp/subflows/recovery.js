// Recovery System - Healing, Harm, Stress, and Supply Management
class RecoverySystem {
    constructor() {
        this.initialized = false;
    }

    init() {
        if (this.initialized) return;
        
        this.setupEventListeners();
        this.initialized = true;
        console.log('Recovery system initialized');
    }

    setupEventListeners() {
        // Health meter controls
        document.addEventListener('click', (e) => {
            if (e.target.matches('.health-control')) {
                this.handleHealthControl(e);
            }
        });

        // Spirit meter controls
        document.addEventListener('click', (e) => {
            if (e.target.matches('.spirit-control')) {
                this.handleSpiritControl(e);
            }
        });

        // Supply meter controls
        document.addEventListener('click', (e) => {
            if (e.target.matches('.supply-control')) {
                this.handleSupplyControl(e);
            }
        });

        // Recovery move buttons
        document.addEventListener('click', (e) => {
            if (e.target.id === 'heal-move-btn') {
                this.showHealMoveDialog();
            } else if (e.target.id === 'resupply-move-btn') {
                this.showResupplyMoveDialog();
            } else if (e.target.id === 'endure-harm-btn') {
                this.showEndureHarmDialog();
            } else if (e.target.id === 'endure-stress-btn') {
                this.showEndureStressDialog();
            }
        });

        // Recovery move dialog handlers
        document.addEventListener('click', (e) => {
            if (e.target.id === 'execute-heal-move') {
                this.executeHealMove();
            } else if (e.target.id === 'cancel-heal-move') {
                this.hideHealMoveDialog();
            } else if (e.target.id === 'execute-resupply-move') {
                this.executeResupplyMove();
            } else if (e.target.id === 'cancel-resupply-move') {
                this.hideResupplyMoveDialog();
            } else if (e.target.id === 'execute-endure-harm-move') {
                this.executeEndureHarmMove();
            } else if (e.target.id === 'cancel-endure-harm-move') {
                this.hideEndureHarmMoveDialog();
            } else if (e.target.id === 'execute-endure-stress-move') {
                this.executeEndureStressMove();
            } else if (e.target.id === 'cancel-endure-stress-move') {
                this.hideEndureStressMoveDialog();
            }
        });
    }

    // Health meter management
    handleHealthControl(e) {
        const action = e.target.dataset.action;
        const amount = parseInt(e.target.dataset.amount) || 1;

        if (action === 'increase') {
            this.changeHealth(amount);
        } else if (action === 'decrease') {
            this.changeHealth(-amount);
        }
    }

    changeHealth(amount) {
        const newHealth = Math.max(0, Math.min(5, character.meters.health + amount));
        const oldHealth = character.meters.health;
        character.meters.health = newHealth;
        character.saveToStorage();

        // Log the change
        const changeText = amount > 0 ? `+${amount}` : `${amount}`;
        sceneLog.addEntry('meter_change', `Health ${changeText} (${oldHealth} → ${newHealth})`);

        // Update UI
        this.updateHealthMeterDisplay();
        
        // Check for conditions
        if (newHealth === 0 && oldHealth > 0) {
            this.showEndureHarmDialog();
        }
    }

    // Spirit meter management
    handleSpiritControl(e) {
        const action = e.target.dataset.action;
        const amount = parseInt(e.target.dataset.amount) || 1;

        if (action === 'increase') {
            this.changeSpirit(amount);
        } else if (action === 'decrease') {
            this.changeSpirit(-amount);
        }
    }

    changeSpirit(amount) {
        const newSpirit = Math.max(0, Math.min(5, character.meters.spirit + amount));
        const oldSpirit = character.meters.spirit;
        character.meters.spirit = newSpirit;
        character.saveToStorage();

        // Log the change
        const changeText = amount > 0 ? `+${amount}` : `${amount}`;
        sceneLog.addEntry('meter_change', `Spirit ${changeText} (${oldSpirit} → ${newSpirit})`);

        // Update UI
        this.updateSpiritMeterDisplay();
        
        // Check for conditions
        if (newSpirit === 0 && oldSpirit > 0) {
            this.showEndureStressDialog();
        }
    }

    // Supply meter management
    handleSupplyControl(e) {
        const action = e.target.dataset.action;
        const amount = parseInt(e.target.dataset.amount) || 1;

        if (action === 'increase') {
            this.changeSupply(amount);
        } else if (action === 'decrease') {
            this.changeSupply(-amount);
        }
    }

    changeSupply(amount) {
        const newSupply = Math.max(0, Math.min(5, character.meters.supply + amount));
        const oldSupply = character.meters.supply;
        character.meters.supply = newSupply;
        character.saveToStorage();

        // Log the change
        const changeText = amount > 0 ? `+${amount}` : `${amount}`;
        sceneLog.addEntry('meter_change', `Supply ${changeText} (${oldSupply} → ${newSupply})`);

        // Update UI
        this.updateSupplyMeterDisplay();
    }

    // Update meter displays
    updateHealthMeterDisplay() {
        const container = document.getElementById('health-meter');
        if (!container) return;

        container.innerHTML = this.createMeterDisplay('health', character.meters.health, 5);
    }

    updateSpiritMeterDisplay() {
        const container = document.getElementById('spirit-meter');
        if (!container) return;

        container.innerHTML = this.createMeterDisplay('spirit', character.meters.spirit, 5);
    }

    updateSupplyMeterDisplay() {
        const container = document.getElementById('supply-meter');
        if (!container) return;

        container.innerHTML = this.createMeterDisplay('supply', character.meters.supply, 5);
    }

    createMeterDisplay(meterType, currentValue, maxValue) {
        let html = '<div class="meter-boxes">';
        
        // Create meter boxes
        for (let i = 1; i <= maxValue; i++) {
            const filled = i <= currentValue;
            html += `<div class="meter-box ${filled ? 'filled' : 'empty'}" data-value="${i}"></div>`;
        }
        
        html += '</div>';
        
        // Add controls
        html += `<div class="meter-controls">
            <button class="${meterType}-control" data-action="decrease" data-amount="1">-1</button>
            <button class="${meterType}-control" data-action="increase" data-amount="1">+1</button>
        </div>`;
        
        return html;
    }

    // Heal move dialog and execution
    showHealMoveDialog() {
        const dialog = document.getElementById('heal-move-dialog');
        if (dialog) {
            dialog.style.display = 'block';
        }
    }

    hideHealMoveDialog() {
        const dialog = document.getElementById('heal-move-dialog');
        if (dialog) {
            dialog.style.display = 'none';
        }
    }

    executeHealMove() {
        const healType = document.querySelector('input[name="heal-type"]:checked')?.value;
        if (!healType) {
            alert('Please select a heal option');
            return;
        }

        let moveText = '';
        let rollStat = 'wits'; // Default stat for most heal options

        switch (healType) {
            case 'treatment':
                moveText = 'Received treatment from someone';
                rollStat = 'iron'; // Treatment from others uses iron
                break;
            case 'recuperate':
                moveText = 'Recuperating in a safe place';
                rollStat = 'iron';
                break;
            case 'heal-asset':
                moveText = 'Used healing asset or equipment';
                rollStat = 'wits';
                break;
        }

        // Execute the move
        const result = moves.executeMove('Heal', rollStat, 0, moveText);
        
        // Process results based on outcome
        this.processHealMoveResult(result, healType);
        
        // Log to scene
        sceneLog.addEntry('move', `**Heal:** ${moveText}`, result);
        
        this.hideHealMoveDialog();
    }

    processHealMoveResult(result, healType) {
        if (result.outcome === 'strong_hit') {
            // Strong hit: +2 health
            this.changeHealth(2);
            sceneLog.addEntry('outcome', 'Strong hit on Heal: +2 health');
            
        } else if (result.outcome === 'weak_hit') {
            // Weak hit: +1 health
            this.changeHealth(1);
            sceneLog.addEntry('outcome', 'Weak hit on Heal: +1 health');
            
        } else if (result.outcome === 'miss') {
            // Miss: no healing, possible complication
            sceneLog.addEntry('outcome', 'Miss on Heal: No healing. Your condition worsens or you face a complication.');
        }
    }

    // Resupply move dialog and execution
    showResupplyMoveDialog() {
        const dialog = document.getElementById('resupply-move-dialog');
        if (dialog) {
            dialog.style.display = 'block';
        }
    }

    hideResupplyMoveDialog() {
        const dialog = document.getElementById('resupply-move-dialog');
        if (dialog) {
            dialog.style.display = 'none';
        }
    }

    executeResupplyMove() {
        const resupplyType = document.querySelector('input[name="resupply-type"]:checked')?.value;
        if (!resupplyType) {
            alert('Please select a resupply option');
            return;
        }

        let moveText = '';
        let rollStat = 'supply';

        switch (resupplyType) {
            case 'barter':
                moveText = 'Bartering for supplies';
                rollStat = 'supply';
                break;
            case 'appeal':
                moveText = 'Making an appeal for supplies';
                rollStat = 'supply';
                break;
            case 'trade':
                moveText = 'Trading for needed supplies';
                rollStat = 'supply';
                break;
        }

        // Execute the move
        const result = moves.executeMove('Resupply', rollStat, 0, moveText);
        
        // Process results
        this.processResupplyMoveResult(result, resupplyType);
        
        // Log to scene
        sceneLog.addEntry('move', `**Resupply:** ${moveText}`, result);
        
        this.hideResupplyMoveDialog();
    }

    processResupplyMoveResult(result, resupplyType) {
        if (result.outcome === 'strong_hit') {
            // Strong hit: +2 supply
            this.changeSupply(2);
            sceneLog.addEntry('outcome', 'Strong hit on Resupply: +2 supply');
            
        } else if (result.outcome === 'weak_hit') {
            // Weak hit: +1 supply, but at a cost
            this.changeSupply(1);
            sceneLog.addEntry('outcome', 'Weak hit on Resupply: +1 supply, but you owe something or face a complication');
            
        } else if (result.outcome === 'miss') {
            // Miss: no supplies gained, you face hardship
            sceneLog.addEntry('outcome', 'Miss on Resupply: No supplies gained. You face hardship or create an obligation');
        }
    }

    // Endure Harm move
    showEndureHarmDialog() {
        const dialog = document.getElementById('endure-harm-dialog');
        if (dialog) {
            dialog.style.display = 'block';
        }
    }

    hideEndureHarmMoveDialog() {
        const dialog = document.getElementById('endure-harm-dialog');
        if (dialog) {
            dialog.style.display = 'none';
        }
    }

    executeEndureHarmMove() {
        const harmAmount = parseInt(document.getElementById('harm-amount').value) || 1;
        const currentHealth = character.meters.health;
        
        // Apply harm first
        this.changeHealth(-harmAmount);
        
        // If health reaches 0 or player chooses to resist, make the roll
        if (character.meters.health === 0 || document.getElementById('resist-harm').checked) {
            const rollStat = character.stats.iron; // Use iron stat for endure harm
            const result = moves.executeMove('Endure Harm', 'iron', 0, `Enduring ${harmAmount} harm`);
            
            this.processEndureHarmResult(result, harmAmount);
            sceneLog.addEntry('move', `**Endure Harm:** Taking ${harmAmount} harm`, result);
        }
        
        this.hideEndureHarmMoveDialog();
    }

    processEndureHarmResult(result, harmAmount) {
        if (result.outcome === 'strong_hit') {
            // Strong hit: choose shake it off or embrace the pain
            const choice = document.querySelector('input[name="endure-harm-choice"]:checked')?.value;
            if (choice === 'shake-off' && !character.wounded) {
                this.changeHealth(1);
                sceneLog.addEntry('outcome', 'Strong hit: Shook off the harm (+1 health)');
            } else if (choice === 'embrace-pain') {
                character.addMomentum(1);
                sceneLog.addEntry('outcome', 'Strong hit: Embraced the pain (+1 momentum)');
            }
            
        } else if (result.outcome === 'weak_hit') {
            // Weak hit: may trade momentum for health if not wounded
            if (!character.wounded) {
                const tradeMomentum = document.getElementById('trade-momentum-for-health').checked;
                if (tradeMomentum && character.momentum > 0) {
                    character.addMomentum(-1);
                    this.changeHealth(1);
                    sceneLog.addEntry('outcome', 'Weak hit: Traded momentum for health (-1 momentum, +1 health)');
                } else {
                    sceneLog.addEntry('outcome', 'Weak hit: Press on');
                }
            }
            
        } else if (result.outcome === 'miss') {
            // Miss: it's worse than you thought
            this.changeHealth(-1);
            sceneLog.addEntry('outcome', 'Miss: It\'s worse than you thought (-1 additional health)');
            
            // If health is 0, must mark wounded or roll on table
            if (character.meters.health === 0) {
                this.handleZeroHealthCondition();
            }
        }
    }

    // Endure Stress move
    showEndureStressDialog() {
        const dialog = document.getElementById('endure-stress-dialog');
        if (dialog) {
            dialog.style.display = 'block';
        }
    }

    hideEndureStressMoveDialog() {
        const dialog = document.getElementById('endure-stress-dialog');
        if (dialog) {
            dialog.style.display = 'none';
        }
    }

    executeEndureStressMove() {
        const stressAmount = parseInt(document.getElementById('stress-amount').value) || 1;
        
        // Apply stress first
        this.changeSpirit(-stressAmount);
        
        // If spirit reaches 0 or player chooses to resist, make the roll
        if (character.meters.spirit === 0 || document.getElementById('resist-stress').checked) {
            const rollStat = 'heart'; // Use heart stat for endure stress
            const result = moves.executeMove('Endure Stress', 'heart', 0, `Enduring ${stressAmount} stress`);
            
            this.processEndureStressResult(result, stressAmount);
            sceneLog.addEntry('move', `**Endure Stress:** Taking ${stressAmount} stress`, result);
        }
        
        this.hideEndureStressMoveDialog();
    }

    processEndureStressResult(result, stressAmount) {
        if (result.outcome === 'strong_hit') {
            // Strong hit: choose shake it off or embrace the darkness
            const choice = document.querySelector('input[name="endure-stress-choice"]:checked')?.value;
            if (choice === 'shake-off' && !character.shaken) {
                this.changeSpirit(1);
                sceneLog.addEntry('outcome', 'Strong hit: Shook off the stress (+1 spirit)');
            } else if (choice === 'embrace-darkness') {
                character.addMomentum(1);
                sceneLog.addEntry('outcome', 'Strong hit: Embraced the darkness (+1 momentum)');
            }
            
        } else if (result.outcome === 'weak_hit') {
            // Weak hit: may trade momentum for spirit if not shaken
            if (!character.shaken) {
                const tradeMomentum = document.getElementById('trade-momentum-for-spirit').checked;
                if (tradeMomentum && character.momentum > 0) {
                    character.addMomentum(-1);
                    this.changeSpirit(1);
                    sceneLog.addEntry('outcome', 'Weak hit: Traded momentum for spirit (-1 momentum, +1 spirit)');
                } else {
                    sceneLog.addEntry('outcome', 'Weak hit: Press on');
                }
            }
            
        } else if (result.outcome === 'miss') {
            // Miss: it's worse than you thought
            this.changeSpirit(-1);
            sceneLog.addEntry('outcome', 'Miss: It\'s worse than you thought (-1 additional spirit)');
            
            // If spirit is 0, must mark shaken or face desolation
            if (character.meters.spirit === 0) {
                this.handleZeroSpiritCondition();
            }
        }
    }

    handleZeroHealthCondition() {
        // This would trigger Face Death or marking debilities
        sceneLog.addEntry('condition', 'Health is 0: Must mark wounded/permanently harmed or Face Death');
    }

    handleZeroSpiritCondition() {
        // This would trigger Face Desolation or marking debilities
        sceneLog.addEntry('condition', 'Spirit is 0: Must mark shaken/corrupted or Face Desolation');
    }

    // Update all meter displays
    updateAllMeterDisplays() {
        this.updateHealthMeterDisplay();
        this.updateSpiritMeterDisplay();
        this.updateSupplyMeterDisplay();
    }
}

// Initialize the recovery system
const recoverySystem = new RecoverySystem();