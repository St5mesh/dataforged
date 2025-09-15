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
            } else if (e.target.id === 'hearten-move-btn') {
                this.showHeartenMoveDialog();
            } else if (e.target.id === 'resupply-move-btn') {
                this.showResupplyMoveDialog();
            } else if (e.target.id === 'sojourn-move-btn') {
                this.showSojournMoveDialog();
            } else if (e.target.id === 'repair-move-btn') {
                this.showRepairMoveDialog();
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
            } else if (e.target.id === 'execute-hearten-move') {
                this.executeHeartenMove();
            } else if (e.target.id === 'cancel-hearten-move') {
                this.hideHeartenMoveDialog();
            } else if (e.target.id === 'execute-resupply-move') {
                this.executeResupplyMove();
            } else if (e.target.id === 'cancel-resupply-move') {
                this.hideResupplyMoveDialog();
            } else if (e.target.id === 'execute-sojourn-move') {
                this.executeSojournMove();
            } else if (e.target.id === 'cancel-sojourn-move') {
                this.hideSojournMoveDialog();
            } else if (e.target.id === 'execute-repair-move') {
                this.executeRepairMove();
            } else if (e.target.id === 'cancel-repair-move') {
                this.hideRepairMoveDialog();
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
            // On strong hit, also clear wounded condition if present
            if (character.getCondition('wounded')) {
                character.setCondition('wounded', false);
                sceneLog.addEntry('outcome', 'Strong hit on Heal: +2 health, cleared wounded condition');
            } else {
                sceneLog.addEntry('outcome', 'Strong hit on Heal: +2 health');
            }
            
        } else if (result.outcome === 'weak_hit') {
            // Weak hit: +1 health
            this.changeHealth(1);
            sceneLog.addEntry('outcome', 'Weak hit on Heal: +1 health');
            
        } else if (result.outcome === 'miss') {
            // Miss: no healing, possible complication
            sceneLog.addEntry('outcome', 'Miss on Heal: No healing. Your condition worsens or you face a complication.');
        }
    }

    // Hearten move dialog and execution
    showHeartenMoveDialog() {
        const dialog = document.getElementById('hearten-move-dialog');
        if (dialog) {
            dialog.style.display = 'block';
        }
    }

    hideHeartenMoveDialog() {
        const dialog = document.getElementById('hearten-move-dialog');
        if (dialog) {
            dialog.style.display = 'none';
        }
    }

    executeHeartenMove() {
        const heartenType = document.querySelector('input[name="hearten-type"]:checked')?.value;
        if (!heartenType) {
            alert('Please select a hearten option');
            return;
        }

        let moveText = '';
        let rollStat = 'heart'; // Default stat for most hearten options

        switch (heartenType) {
            case 'socialize':
                moveText = 'Socializing or seeking entertainment';
                rollStat = 'heart';
                break;
            case 'quiet-meditation':
                moveText = 'Finding solace in quiet contemplation';
                rollStat = 'spirit';
                break;
            case 'creative':
                moveText = 'Creating something or indulging in a pastime';
                rollStat = 'wits';
                break;
        }

        // Execute the move
        const result = moves.executeMove('Hearten', rollStat, 0, moveText);
        
        // Process results based on outcome
        this.processHeartenMoveResult(result, heartenType);
        
        // Log to scene
        sceneLog.addEntry('move', `**Hearten:** ${moveText}`, result);
        
        this.hideHeartenMoveDialog();
    }

    processHeartenMoveResult(result, heartenType) {
        if (result.outcome === 'strong_hit') {
            // Strong hit: +2 spirit
            this.changeSpirit(2);
            // On strong hit, also clear shaken condition if present
            if (character.getCondition('shaken')) {
                character.setCondition('shaken', false);
                sceneLog.addEntry('outcome', 'Strong hit on Hearten: +2 spirit, cleared shaken condition');
            } else {
                sceneLog.addEntry('outcome', 'Strong hit on Hearten: +2 spirit');
            }
            
        } else if (result.outcome === 'weak_hit') {
            // Weak hit: +1 spirit
            this.changeSpirit(1);
            sceneLog.addEntry('outcome', 'Weak hit on Hearten: +1 spirit');
            
        } else if (result.outcome === 'miss') {
            // Miss: no recovery, possible complication
            sceneLog.addEntry('outcome', 'Miss on Hearten: No recovery. You are dejected or your efforts backfire.');
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

    // Sojourn move dialog and execution
    showSojournMoveDialog() {
        const dialog = document.getElementById('sojourn-move-dialog');
        if (dialog) {
            dialog.style.display = 'block';
        }
    }

    hideSojournMoveDialog() {
        const dialog = document.getElementById('sojourn-move-dialog');
        if (dialog) {
            dialog.style.display = 'none';
        }
    }

    executeSojournMove() {
        const sojournType = document.querySelector('input[name="sojourn-type"]:checked')?.value;
        if (!sojournType) {
            alert('Please select a sojourn option');
            return;
        }

        let moveText = '';
        let rollStat = 'heart'; // Default for most sojourn options

        switch (sojournType) {
            case 'community':
                moveText = 'Finding aid and comfort in a community';
                rollStat = 'heart';
                break;
            case 'hospitality':
                moveText = 'Seeking hospitality or refuge';
                rollStat = 'heart';
                break;
            case 'provisions':
                moveText = 'Seeking provisions and assistance';
                rollStat = 'supply';
                break;
        }

        // Execute the move
        const result = moves.executeMove('Sojourn', rollStat, 0, moveText);
        
        // Process results
        this.processSojournMoveResult(result, sojournType);
        
        // Log to scene
        sceneLog.addEntry('move', `**Sojourn:** ${moveText}`, result);
        
        this.hideSojournMoveDialog();
    }

    processSojournMoveResult(result, sojournType) {
        if (result.outcome === 'strong_hit') {
            // Strong hit: multiple benefits
            this.changeHealth(1);
            this.changeSpirit(1);
            this.changeSupply(1);
            character.addMomentum(1);
            sceneLog.addEntry('outcome', 'Strong hit on Sojourn: +1 health, +1 spirit, +1 supply, +1 momentum');
            
        } else if (result.outcome === 'weak_hit') {
            // Weak hit: choose two benefits
            this.changeHealth(1);
            this.changeSpirit(1);
            sceneLog.addEntry('outcome', 'Weak hit on Sojourn: Choose two: +1 health, +1 spirit, +1 supply, or +1 momentum. (+1 health and +1 spirit selected)');
            
        } else if (result.outcome === 'miss') {
            // Miss: you are refused or face a complication
            sceneLog.addEntry('outcome', 'Miss on Sojourn: You are refused, cast out, or face some other complication');
        }
    }

    // Repair move dialog and execution
    showRepairMoveDialog() {
        const dialog = document.getElementById('repair-move-dialog');
        if (dialog) {
            dialog.style.display = 'block';
        }
    }

    hideRepairMoveDialog() {
        const dialog = document.getElementById('repair-move-dialog');
        if (dialog) {
            dialog.style.display = 'none';
        }
    }

    executeRepairMove() {
        const repairType = document.querySelector('input[name="repair-type"]:checked')?.value;
        if (!repairType) {
            alert('Please select a repair option');
            return;
        }

        let moveText = '';
        let rollStat = 'wits';

        switch (repairType) {
            case 'make-repairs':
                moveText = 'Making repairs with available materials';
                rollStat = 'wits';
                break;
            case 'jury-rig':
                moveText = 'Jury-rigging a temporary solution';
                rollStat = 'wits';
                break;
            case 'field-maintenance':
                moveText = 'Performing field maintenance';
                rollStat = 'wits';
                break;
        }

        // Execute the move
        const result = moves.executeMove('Repair', rollStat, 0, moveText);
        
        // Process results
        this.processRepairMoveResult(result, repairType);
        
        // Log to scene
        sceneLog.addEntry('move', `**Repair:** ${moveText}`, result);
        
        this.hideRepairMoveDialog();
    }

    processRepairMoveResult(result, repairType) {
        if (result.outcome === 'strong_hit') {
            // Strong hit: repair successful
            sceneLog.addEntry('outcome', 'Strong hit on Repair: Your vehicle, equipment, or device is fully repaired');
            
        } else if (result.outcome === 'weak_hit') {
            // Weak hit: partial repair or cost
            sceneLog.addEntry('outcome', 'Weak hit on Repair: You achieve a temporary or limited repair, or fix the problem but at a cost');
            
        } else if (result.outcome === 'miss') {
            // Miss: you fail or make things worse
            sceneLog.addEntry('outcome', 'Miss on Repair: You fail, or your repairs create a new problem');
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
        // Character must choose: mark wounded/maimed or Face Death
        this.showZeroHealthDialog();
    }

    handleZeroSpiritCondition() {
        // Character must choose: mark shaken/corrupted or Face Desolation
        this.showZeroSpiritDialog();
    }

    showZeroHealthDialog() {
        const dialog = document.getElementById('zero-health-dialog') || this.createZeroHealthDialog();
        dialog.style.display = 'block';
    }

    showZeroSpiritDialog() {
        const dialog = document.getElementById('zero-spirit-dialog') || this.createZeroSpiritDialog();
        dialog.style.display = 'block';
    }

    createZeroHealthDialog() {
        const dialog = document.createElement('div');
        dialog.id = 'zero-health-dialog';
        dialog.className = 'modal';
        dialog.innerHTML = `
            <div class="dialog">
                <h3>Health is Zero!</h3>
                <p>Your health has been reduced to zero. Choose one option:</p>
                
                <div class="form-group">
                    <label>
                        <input type="radio" name="zero-health-choice" value="wounded">
                        Mark Wounded condition (-1 to action rolls until you heal)
                    </label>
                </div>
                
                <div class="form-group">
                    <label>
                        <input type="radio" name="zero-health-choice" value="maimed">
                        Mark Maimed condition (permanent -1 to action rolls)
                    </label>
                </div>
                
                <div class="form-group">
                    <label>
                        <input type="radio" name="zero-health-choice" value="face-death">
                        Face Death (make a progress move)
                    </label>
                </div>
                
                <div class="dialog-buttons">
                    <button id="confirm-zero-health" class="btn btn-primary">Confirm</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(dialog);
        
        document.getElementById('confirm-zero-health').addEventListener('click', () => {
            this.handleZeroHealthChoice();
        });
        
        return dialog;
    }

    createZeroSpiritDialog() {
        const dialog = document.createElement('div');
        dialog.id = 'zero-spirit-dialog';
        dialog.className = 'modal';
        dialog.innerHTML = `
            <div class="dialog">
                <h3>Spirit is Zero!</h3>
                <p>Your spirit has been reduced to zero. Choose one option:</p>
                
                <div class="form-group">
                    <label>
                        <input type="radio" name="zero-spirit-choice" value="shaken">
                        Mark Shaken condition (-1 to action rolls until you recover)
                    </label>
                </div>
                
                <div class="form-group">
                    <label>
                        <input type="radio" name="zero-spirit-choice" value="corrupted">
                        Mark Corrupted condition (permanent -1 to action rolls)
                    </label>
                </div>
                
                <div class="form-group">
                    <label>
                        <input type="radio" name="zero-spirit-choice" value="face-desolation">
                        Face Desolation (make a progress move)
                    </label>
                </div>
                
                <div class="dialog-buttons">
                    <button id="confirm-zero-spirit" class="btn btn-primary">Confirm</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(dialog);
        
        document.getElementById('confirm-zero-spirit').addEventListener('click', () => {
            this.handleZeroSpiritChoice();
        });
        
        return dialog;
    }

    handleZeroHealthChoice() {
        const choice = document.querySelector('input[name="zero-health-choice"]:checked')?.value;
        if (!choice) {
            alert('Please select an option');
            return;
        }

        const dialog = document.getElementById('zero-health-dialog');
        
        switch (choice) {
            case 'wounded':
                character.setCondition('wounded', true);
                character.setMeter('health', 1); // Restore 1 health
                sceneLog.addEntry('condition', 'Marked wounded condition and restored 1 health');
                break;
            case 'maimed':
                character.setCondition('maimed', true);
                character.setMeter('health', 1); // Restore 1 health
                sceneLog.addEntry('condition', 'Marked maimed condition (permanent) and restored 1 health');
                break;
            case 'face-death':
                this.showFaceDeathDialog();
                return; // Don't hide dialog yet
        }
        
        dialog.style.display = 'none';
        app.updateCharacterDisplay();
    }

    handleZeroSpiritChoice() {
        const choice = document.querySelector('input[name="zero-spirit-choice"]:checked')?.value;
        if (!choice) {
            alert('Please select an option');
            return;
        }

        const dialog = document.getElementById('zero-spirit-dialog');
        
        switch (choice) {
            case 'shaken':
                character.setCondition('shaken', true);
                character.setMeter('spirit', 1); // Restore 1 spirit
                sceneLog.addEntry('condition', 'Marked shaken condition and restored 1 spirit');
                break;
            case 'corrupted':
                character.setCondition('corrupted', true);
                character.setMeter('spirit', 1); // Restore 1 spirit
                sceneLog.addEntry('condition', 'Marked corrupted condition (permanent) and restored 1 spirit');
                break;
            case 'face-desolation':
                this.showFaceDesolationDialog();
                return; // Don't hide dialog yet
        }
        
        dialog.style.display = 'none';
        app.updateCharacterDisplay();
    }

    showFaceDeathDialog() {
        // This would show the Face Death progress move dialog
        alert('Face Death move not yet implemented - marking wounded condition instead');
        character.setCondition('wounded', true);
        character.setMeter('health', 1);
        document.getElementById('zero-health-dialog').style.display = 'none';
    }

    showFaceDesolationDialog() {
        // This would show the Face Desolation progress move dialog
        alert('Face Desolation move not yet implemented - marking shaken condition instead');
        character.setCondition('shaken', true);
        character.setMeter('spirit', 1);
        document.getElementById('zero-spirit-dialog').style.display = 'none';
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