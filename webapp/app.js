// Main Application Logic
class StarforgedApp {
    constructor() {
        this.currentScreen = 'session0';
        this.selectedTruths = {};
        this.selectedPaths = [];
        this.selectedAssets = [];
        this.statsAssigned = false;
    }

    async init() {
        console.log('Initializing Starforged webapp...');
        
        // Load game data
        const dataLoaded = await gameData.loadData();
        if (!dataLoaded) {
            this.showError('Failed to load game data. Please check the console for details.');
            return;
        }

        // Set up event listeners
        this.setupEventListeners();

        // Initialize UI
        this.initializeUI();

        // Check if character is already created
        if (character.sessionComplete) {
            this.switchScreen('play');
        } else {
            this.setupSession0();
        }

        console.log('App initialized successfully');
    }

    setupEventListeners() {
        // Navigation
        document.getElementById('nav-session0').addEventListener('click', () => this.switchScreen('session0'));
        document.getElementById('nav-play').addEventListener('click', () => this.switchScreen('play'));
        document.getElementById('nav-character').addEventListener('click', () => this.switchScreen('character'));

        // Session 0 events
        document.getElementById('randomize-truths').addEventListener('click', () => this.randomizeTruths());
        document.getElementById('complete-session0').addEventListener('click', () => this.completeSession0());

        // Stats events
        const statSelects = ['edge', 'heart', 'iron', 'shadow', 'wits'];
        statSelects.forEach(stat => {
            document.getElementById(`stat-${stat}`).addEventListener('change', (e) => {
                this.updateStat(stat, parseInt(e.target.value));
            });
        });

        // Play screen events
        document.getElementById('move-category').addEventListener('change', (e) => {
            this.loadMovesByCategory(e.target.value);
        });
        document.getElementById('execute-move').addEventListener('click', () => this.executeMoveFromUI());
        document.getElementById('ask-oracle').addEventListener('click', () => this.showOracleDialog());
        document.getElementById('pay-price').addEventListener('click', () => this.payThePrice());

        // Character screen events
        document.getElementById('add-vow').addEventListener('click', () => this.showAddVowDialog());
    }

    initializeUI() {
        this.updateNavigation();
        this.updateCharacterDisplay();
    }

    switchScreen(screenName) {
        // Update active screen
        document.querySelectorAll('.screen').forEach(screen => {
            screen.classList.remove('active');
        });
        document.getElementById(`${screenName}-screen`).classList.add('active');

        // Update active nav button
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.getElementById(`nav-${screenName}`).classList.add('active');

        this.currentScreen = screenName;

        // Screen-specific initialization
        if (screenName === 'play') {
            this.initializePlayScreen();
        } else if (screenName === 'character') {
            this.updateCharacterDisplay();
        }
    }

    updateNavigation() {
        const playBtn = document.getElementById('nav-play');
        const characterBtn = document.getElementById('nav-character');
        
        if (character.sessionComplete) {
            playBtn.disabled = false;
            characterBtn.disabled = false;
        } else {
            playBtn.disabled = true;
            characterBtn.disabled = true;
        }
    }

    // Session 0 Setup
    setupSession0() {
        this.loadTruths();
        this.loadPaths();
        this.loadCommandVehicle();
        this.loadSelectableAssets();
        this.setupProgressBoxes();
        this.updateSession0Validation();
    }

    loadTruths() {
        const truthsContainer = document.getElementById('truths-container');
        const truths = gameData.getSettingTruths();
        
        truths.forEach(truth => {
            const truthDiv = document.createElement('div');
            truthDiv.className = 'truth-item';
            truthDiv.innerHTML = `
                <h4>${truth.Name}</h4>
                <p>Click to select an option or randomize...</p>
                <select class="truth-select" data-truth="${truth.Name}">
                    <option value="">Choose or roll...</option>
                    ${truth.Table.map(option => 
                        `<option value="${option.Floor}-${option.Ceiling}">${option.Result}</option>`
                    ).join('')}
                </select>
            `;

            const select = truthDiv.querySelector('.truth-select');
            select.addEventListener('change', (e) => {
                this.selectTruth(truth.Name, e.target.value, truth.Table);
                this.updateSession0Validation();
            });

            truthsContainer.appendChild(truthDiv);
        });
    }

    selectTruth(categoryName, value, table) {
        if (value) {
            const [floor, ceiling] = value.split('-').map(Number);
            const option = table.find(opt => opt.Floor === floor && opt.Ceiling === ceiling);
            
            this.selectedTruths[categoryName] = {
                category: categoryName,
                option: option,
                selected: true
            };

            character.addTruth(this.selectedTruths[categoryName]);
        }
    }

    randomizeTruths() {
        const truths = gameData.getSettingTruths();
        character.clearTruths();
        this.selectedTruths = {};
        
        truths.forEach(truth => {
            const result = gameData.rollOnOracle(truth);
            this.selectedTruths[truth.Name] = {
                category: truth.Name,
                option: result.entry,
                selected: true,
                rolled: true
            };
            character.addTruth(this.selectedTruths[truth.Name]);
            
            // Update UI
            const select = document.querySelector(`[data-truth="${truth.Name}"]`);
            if (select) {
                select.value = `${result.entry.Floor}-${result.entry.Ceiling}`;
            }
        });
        
        this.updateSession0Validation();
    }

    loadPaths() {
        const pathsContainer = document.getElementById('paths-container');
        const paths = gameData.getPathAssets();
        
        paths.forEach(path => {
            const pathDiv = document.createElement('div');
            pathDiv.className = 'asset-item';
            pathDiv.innerHTML = `
                <h4>${path.Name}</h4>
                <p>${this.truncateText(path.Abilities?.[0]?.Text || 'Path asset', 100)}</p>
            `;

            pathDiv.addEventListener('click', () => {
                this.togglePathSelection(path, pathDiv);
            });

            pathsContainer.appendChild(pathDiv);
        });
    }

    togglePathSelection(path, element) {
        const isSelected = this.selectedPaths.includes(path.$id);
        
        if (isSelected) {
            this.selectedPaths = this.selectedPaths.filter(id => id !== path.$id);
            element.classList.remove('selected');
            character.removeAsset(path.$id);
        } else if (this.selectedPaths.length < 2) {
            this.selectedPaths.push(path.$id);
            element.classList.add('selected');
            character.addAsset(path);
        }
        
        this.updateSession0Validation();
    }

    loadCommandVehicle() {
        const vehicleContainer = document.getElementById('vehicle-container');
        const vehicles = gameData.getCommandVehicleAssets();
        
        // Default to Starship
        const starship = vehicles[0];
        if (starship) {
            vehicleContainer.innerHTML = `
                <div class="asset-item selected">
                    <h4>${starship.Name}</h4>
                    <p>${this.truncateText(starship.Abilities?.[0]?.Text || 'Command vehicle', 100)}</p>
                    <input type="text" placeholder="Name your starship..." class="starship-name" />
                </div>
            `;
            
            character.addAsset(starship);
            
            const nameInput = vehicleContainer.querySelector('.starship-name');
            nameInput.addEventListener('input', (e) => {
                character.updateAssetInput(starship.$id, 'Name', e.target.value);
            });
        }
    }

    loadSelectableAssets() {
        const assetsContainer = document.getElementById('assets-container');
        const assetTypes = gameData.getSelectableAssetTypes();
        
        assetTypes.forEach(assetType => {
            if (assetType.Assets && assetType.Assets.length > 0) {
                assetType.Assets.forEach(asset => {
                    const assetDiv = document.createElement('div');
                    assetDiv.className = 'asset-item';
                    assetDiv.innerHTML = `
                        <h4>${asset.Name}</h4>
                        <p>${this.truncateText(asset.Abilities?.[0]?.Text || 'Asset', 80)}</p>
                        <small>${assetType.Name}</small>
                    `;

                    assetDiv.addEventListener('click', () => {
                        this.toggleAssetSelection(asset, assetDiv);
                    });

                    assetsContainer.appendChild(assetDiv);
                });
            }
        });
    }

    toggleAssetSelection(asset, element) {
        const hasAsset = character.hasAsset(asset.$id);
        
        if (hasAsset) {
            character.removeAsset(asset.$id);
            element.classList.remove('selected');
        } else {
            // Allow only one additional asset beyond paths and command vehicle
            const nonRequiredAssets = character.assets.filter(a => 
                !a.type?.includes('Path') && !a.type?.includes('Command_Vehicle')
            );
            
            if (nonRequiredAssets.length < 1) {
                character.addAsset(asset);
                element.classList.add('selected');
            }
        }
        
        this.updateSession0Validation();
    }

    updateStat(stat, value) {
        character.setStat(stat, value);
        this.validateStatsDistribution();
        this.updateSession0Validation();
    }

    validateStatsDistribution() {
        const isValid = character.validateStats();
        const statElements = document.querySelectorAll('#stats-container select');
        
        statElements.forEach(select => {
            select.style.borderColor = isValid ? '' : 'var(--danger-color)';
        });
        
        this.statsAssigned = isValid;
    }

    setupProgressBoxes() {
        const vowProgress = document.getElementById('vow-progress');
        vowProgress.innerHTML = '';
        
        for (let i = 0; i < 10; i++) {
            const box = document.createElement('div');
            box.className = 'progress-box';
            box.addEventListener('click', () => this.toggleProgressBox(box, i));
            vowProgress.appendChild(box);
        }
    }

    toggleProgressBox(box, index) {
        // This is for manual progress adjustment during session 0
        box.classList.toggle('filled');
    }

    updateSession0Validation() {
        const validation = character.validateSession0();
        const completeBtn = document.getElementById('complete-session0');
        
        // Update button state
        completeBtn.disabled = !validation.valid;
        
        // Show validation status (could add visual indicators)
        console.log('Session 0 validation:', validation);
    }

    completeSession0() {
        // Get background vow
        const vowText = document.getElementById('background-vow').value.trim();
        if (!vowText) {
            alert('Please describe your background vow');
            return;
        }

        character.addVow({
            description: vowText,
            rank: 'epic'
        });

        if (character.completeSession0()) {
            alert('Session 0 complete! Your character is ready to explore the Forge.');
            this.updateNavigation();
            this.switchScreen('character');
        } else {
            alert('Please complete all required sections before proceeding.');
        }
    }

    // Play Screen
    initializePlayScreen() {
        this.loadMoveCategories();
        this.updatePlayInterface();
    }

    loadMoveCategories() {
        const categorySelect = document.getElementById('move-category');
        const categories = movesSystem.getMoveCategories();
        
        categorySelect.innerHTML = '<option value="">Choose a move category...</option>';
        categories.forEach(cat => {
            const option = document.createElement('option');
            option.value = cat.name;
            option.textContent = cat.name;
            categorySelect.appendChild(option);
        });
    }

    loadMovesByCategory(categoryName) {
        const moveSelect = document.getElementById('move-list');
        moveSelect.innerHTML = '<option value="">Choose a move...</option>';
        moveSelect.disabled = !categoryName;

        if (!categoryName) return;

        const moves = movesSystem.getMovesByCategory(categoryName);
        moves.forEach(move => {
            const option = document.createElement('option');
            option.value = move.$id;
            option.textContent = move.Name;
            moveSelect.appendChild(option);
        });

        document.getElementById('execute-move').disabled = true;
        
        moveSelect.addEventListener('change', (e) => {
            document.getElementById('execute-move').disabled = !e.target.value;
            if (e.target.value) {
                this.showMoveInterface(e.target.value);
            }
        });
    }

    showMoveInterface(moveId) {
        const move = gameData.getMove(moveId);
        const interface = document.getElementById('move-interface');
        
        interface.innerHTML = `
            <h3>${move.Name}</h3>
            <p>${movesSystem.getFormattedMoveText(move)}</p>
            ${this.createMoveInputs(move)}
        `;
        interface.classList.add('active');
    }

    createMoveInputs(move) {
        const statOptions = movesSystem.getStatOptionsForMove(move);
        
        if (statOptions.length === 0) {
            return '<p>This move has special resolution rules. Click Execute to proceed.</p>';
        }

        return `
            <div class="move-inputs">
                <div>
                    <label>Choose your approach:</label>
                    <select id="move-stat">
                        <option value="">Select approach...</option>
                        ${statOptions.map(option => 
                            option.stats.map(stat => 
                                `<option value="${stat}">${option.text} (+${stat})</option>`
                            ).join('')
                        ).join('')}
                    </select>
                </div>
                <div>
                    <label>Modifiers:</label>
                    <input type="number" id="move-modifiers" value="0" min="-3" max="3" />
                </div>
                <div>
                    <label>
                        <input type="checkbox" id="burn-momentum" />
                        Burn momentum (+${character.momentum})
                    </label>
                </div>
            </div>
        `;
    }

    executeMoveFromUI() {
        const moveId = document.getElementById('move-list').value;
        if (!moveId) return;

        const move = gameData.getMove(moveId);
        const options = {};

        // Get stat and modifiers for action moves
        if (!move['Progress Move']) {
            const statSelect = document.getElementById('move-stat');
            const modifiersInput = document.getElementById('move-modifiers');
            const burnMomentumCheck = document.getElementById('burn-momentum');

            if (statSelect) {
                options.stat = statSelect.value;
                if (!options.stat) {
                    alert('Please select an approach');
                    return;
                }
            }

            if (modifiersInput) {
                options.modifiers = parseInt(modifiersInput.value) || 0;
            }

            if (burnMomentumCheck) {
                options.burnMomentum = burnMomentumCheck.checked;
            }
        }

        // Execute the move
        const result = movesSystem.executeMove(moveId, options);
        if (result) {
            this.displayMoveResult(result);
            this.updateCharacterDisplay();
        }
    }

    displayMoveResult(result) {
        const resultsContainer = document.getElementById('roll-results');
        diceRoller.displayRollResult(resultsContainer, result.roll);
        
        // Add move outcome text
        const moveOutcome = document.createElement('div');
        moveOutcome.className = 'move-outcome';
        moveOutcome.innerHTML = `
            <h4>${result.move.Name} - ${diceRoller.getOutcomeText(result.roll.outcome)}</h4>
            ${result.move.Outcomes ? result.move.Outcomes[this.capitalizeFirst(result.roll.outcome.replace('-', ' '))]?.Text || '' : ''}
        `;
        resultsContainer.appendChild(moveOutcome);
    }

    showOracleDialog() {
        // Simple oracle dialog - in a full implementation this would be more sophisticated
        const question = prompt('Ask the oracle a yes/no question:');
        if (question) {
            const oracle = gameData.getOracle('Starforged/Oracles/Moves/Ask_the_Oracle/Fifty_fifty');
            const result = gameData.rollOnOracle(oracle);
            alert(`Oracle says: ${result.result} (rolled ${result.roll})`);
        }
    }

    payThePrice() {
        const result = movesSystem.payThePrice();
        if (result) {
            alert(`Pay the Price: ${result.result} (rolled ${result.roll})`);
        }
    }

    // Character Screen
    updateCharacterDisplay() {
        this.displayCharacterStats();
        this.displayCharacterMeters();
        this.displayCharacterAssets();
        this.displayCharacterVows();
    }

    displayCharacterStats() {
        const container = document.getElementById('character-stats-display');
        if (!container) return;

        container.innerHTML = Object.entries(character.stats)
            .map(([stat, value]) => 
                `<div class="stat-display">
                    <strong>${this.capitalizeFirst(stat)}:</strong> ${value}
                </div>`
            ).join('');
    }

    displayCharacterMeters() {
        const meters = ['health', 'spirit', 'supply'];
        
        meters.forEach(meter => {
            const container = document.getElementById(`${meter}-meter`);
            if (!container) return;
            
            container.innerHTML = '';
            const value = character.getMeter(meter);
            
            for (let i = 0; i < 5; i++) {
                const box = document.createElement('div');
                box.className = `meter-box ${i < value ? 'filled' : ''}`;
                box.addEventListener('click', () => {
                    character.setMeter(meter, i + 1);
                    this.displayCharacterMeters();
                });
                container.appendChild(box);
            }
        });

        // Update momentum display
        const momentumValue = document.getElementById('momentum-value');
        if (momentumValue) {
            momentumValue.textContent = character.momentum >= 0 ? `+${character.momentum}` : character.momentum;
        }
    }

    displayCharacterAssets() {
        const container = document.getElementById('character-assets-display');
        if (!container) return;

        container.innerHTML = character.assets.map(asset => 
            `<div class="asset-display">
                <h5>${asset.name}</h5>
                <small>${asset.type}</small>
            </div>`
        ).join('') || '<p>No assets</p>';
    }

    displayCharacterVows() {
        const container = document.getElementById('character-vows-display');
        if (!container) return;

        container.innerHTML = character.vows.map(vow => 
            `<div class="vow-display">
                <h5>${vow.description}</h5>
                <div class="vow-progress">
                    <small>Rank: ${vow.rank}</small>
                    <div class="progress-track">
                        ${Array(10).fill().map((_, i) => 
                            `<div class="progress-box ${i < vow.progress ? 'filled' : ''}"></div>`
                        ).join('')}
                    </div>
                </div>
            </div>`
        ).join('') || '<p>No vows</p>';
    }

    showAddVowDialog() {
        const description = prompt('Describe your vow:');
        if (!description) return;

        const rank = prompt('Vow rank (troublesome/dangerous/formidable/extreme/epic):') || 'troublesome';
        
        character.addVow({ description, rank: rank.toLowerCase() });
        this.displayCharacterVows();
    }

    // Utility methods
    truncateText(text, length) {
        if (text.length <= length) return text;
        return text.substring(0, length) + '...';
    }

    capitalizeFirst(str) {
        return str.charAt(0).toUpperCase() + str.slice(1);
    }

    showError(message) {
        console.error(message);
        alert('Error: ' + message);
    }

    updatePlayInterface() {
        // Update any play interface elements that depend on character state
    }
}

// Initialize the app when the page loads
document.addEventListener('DOMContentLoaded', async () => {
    window.app = new StarforgedApp();
    await app.init();
});