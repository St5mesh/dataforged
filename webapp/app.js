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
        document.getElementById('nav-log').addEventListener('click', () => this.switchScreen('log'));

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
        
        // Scene management events
        document.getElementById('update-scene').addEventListener('click', () => this.updateCurrentScene());
        document.getElementById('frame-new-scene').addEventListener('click', () => this.showNewSceneDialog());
        document.getElementById('view-full-log').addEventListener('click', () => this.switchScreen('log'));

        // Character screen events
        document.getElementById('add-vow').addEventListener('click', () => this.showAddVowDialog());
        
        // Progress tracks events
        document.getElementById('add-progress-track').addEventListener('click', () => this.showAddProgressTrackDialog());
        document.getElementById('track-type-filter').addEventListener('change', (e) => this.filterProgressTracks(e.target.value));
        
        // Progress track dialog events
        document.getElementById('cancel-track').addEventListener('click', () => this.hideAddProgressTrackDialog());
        document.getElementById('progress-track-form').addEventListener('submit', (e) => this.handleProgressTrackSubmit(e));
        document.getElementById('close-progress-roll').addEventListener('click', () => this.hideProgressRollDialog());
        
        // Scene log events
        document.getElementById('log-search').addEventListener('input', (e) => this.searchLogEntries(e.target.value));
        document.getElementById('log-filter-type').addEventListener('change', (e) => this.filterLogEntries(e.target.value));
        document.getElementById('add-narrative-entry').addEventListener('click', () => this.showNarrativeDialog());
        document.getElementById('export-log').addEventListener('click', () => this.exportSceneLog());
        document.getElementById('clear-log').addEventListener('click', () => this.clearSceneLog());
        
        // Dialog events
        document.getElementById('oracle-form').addEventListener('submit', (e) => this.handleOracleSubmit(e));
        document.getElementById('cancel-oracle').addEventListener('click', () => this.hideOracleDialog());
        document.getElementById('narrative-form').addEventListener('submit', (e) => this.handleNarrativeSubmit(e));
        document.getElementById('cancel-narrative').addEventListener('click', () => this.hideNarrativeDialog());
        document.getElementById('new-scene-form').addEventListener('submit', (e) => this.handleNewSceneSubmit(e));
        document.getElementById('cancel-new-scene').addEventListener('click', () => this.hideNewSceneDialog());
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
            this.renderProgressTracks();
        } else if (screenName === 'log') {
            this.initializeLogScreen();
        }
    }

    updateNavigation() {
        const playBtn = document.getElementById('nav-play');
        const characterBtn = document.getElementById('nav-character');
        const logBtn = document.getElementById('nav-log');
        
        if (character.sessionComplete) {
            playBtn.disabled = false;
            characterBtn.disabled = false;
            logBtn.disabled = false;
        } else {
            playBtn.disabled = true;
            characterBtn.disabled = true;
            logBtn.disabled = true;
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
        this.updateCurrentSceneDisplay();
        this.updateRecentLogEntries();
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
        const moveInterface = document.getElementById('move-interface');
        
        moveInterface.innerHTML = `
            <h3>${move.Name}</h3>
            <p>${movesSystem.getFormattedMoveText(move)}</p>
            ${this.createMoveInputs(move)}
        `;
        moveInterface.classList.add('active');
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
            // Log the move execution
            sceneLog.logMove(move, options, result);
            
            this.displayMoveResult(result);
            this.updateCharacterDisplay();
            this.updateRecentLogEntries();
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
            // Log the Pay the Price oracle roll
            sceneLog.logOracle(
                { Name: 'Pay the Price', $id: 'pay_the_price' }, 
                result, 
                'What happens when you pay the price?'
            );
            
            alert(`Pay the Price: ${result.result} (rolled ${result.roll})`);
            this.updateRecentLogEntries();
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

    // Progress Tracks Methods
    renderProgressTracks() {
        const container = document.getElementById('progress-tracks-list');
        if (!container) return;

        const filterType = document.getElementById('track-type-filter')?.value || '';
        const tracks = filterType ? 
            progressTrackManager.getTracksByType(filterType) : 
            progressTrackManager.getActiveTracks();

        if (tracks.length === 0) {
            container.innerHTML = '<p class="text-secondary">No progress tracks found.</p>';
            return;
        }

        container.innerHTML = tracks.map(track => this.renderProgressTrack(track)).join('');
    }

    renderProgressTrack(track) {
        const boxes = this.renderProgressBoxes(track);
        const progressInfo = this.getProgressInfo(track);
        
        return `
            <div class="progress-track-display" data-track-id="${track.id}">
                <div class="progress-track-header">
                    <div class="progress-track-info">
                        <h4>
                            ${track.label}
                            <span class="track-type-badge ${track.type}">${track.type}</span>
                        </h4>
                        <div class="progress-track-meta">
                            ${this.capitalizeFirst(track.rank)} • ${progressInfo}
                        </div>
                        ${track.description ? `<p style="margin-top: 8px; color: var(--text-secondary); font-size: 0.9em;">${track.description}</p>` : ''}
                    </div>
                    <div class="progress-track-actions">
                        <button class="btn" onclick="app.markProgressTrackProgress('${track.id}')">Mark Progress</button>
                        <button class="btn" onclick="app.eraseProgressTrackProgress('${track.id}')">Erase Progress</button>
                        <button class="btn" onclick="app.makeProgressRoll('${track.id}')">Progress Roll</button>
                        <button class="btn" onclick="app.editProgressTrack('${track.id}')">Edit</button>
                        <button class="btn" onclick="app.deleteProgressTrack('${track.id}')">Delete</button>
                    </div>
                </div>
                <div class="progress-visual">
                    ${boxes}
                </div>
            </div>
        `;
    }

    renderProgressBoxes(track) {
        const boxes = [];
        const totalBoxes = 10;
        const filledBoxes = track.progressBoxes;
        const remainingTicks = track.remainingTicks;

        for (let i = 0; i < totalBoxes; i++) {
            let boxClass = 'progress-box';
            let content = '';

            if (i < filledBoxes) {
                boxClass += ' filled';
                content = '●';
            } else if (i === filledBoxes && remainingTicks > 0) {
                boxClass += ' partial';
                content = remainingTicks;
            }

            boxes.push(`<div class="${boxClass}">${content}</div>`);
        }

        return `
            <div class="progress-boxes">
                ${boxes.join('')}
            </div>
            <div class="progress-info">
                <span>Progress: ${filledBoxes}/10 boxes</span>
                <span>Ticks: ${track.ticks}/40</span>
                <span>Progress Score: ${track.getProgressScore()}</span>
            </div>
        `;
    }

    getProgressInfo(track) {
        const filledBoxes = track.progressBoxes;
        const totalTicks = track.ticks;
        return `${filledBoxes}/10 boxes (${totalTicks} ticks)`;
    }

    showAddProgressTrackDialog() {
        const dialog = document.getElementById('progress-track-dialog');
        const form = document.getElementById('progress-track-form');
        
        // Reset form
        form.reset();
        
        // Show dialog
        dialog.style.display = 'flex';
    }

    hideAddProgressTrackDialog() {
        const dialog = document.getElementById('progress-track-dialog');
        dialog.style.display = 'none';
    }

    handleProgressTrackSubmit(e) {
        e.preventDefault();
        
        const formData = new FormData(e.target);
        const trackData = {
            label: document.getElementById('track-label').value,
            type: document.getElementById('track-type').value,
            rank: document.getElementById('track-rank').value,
            description: document.getElementById('track-description').value
        };

        progressTrackManager.addTrack(trackData);
        this.hideAddProgressTrackDialog();
        this.renderProgressTracks();
        
        console.log('Progress track created:', trackData);
    }

    filterProgressTracks(type) {
        this.renderProgressTracks();
    }

    markProgressTrackProgress(trackId) {
        progressTrackManager.markProgress(trackId);
        this.renderProgressTracks();
        console.log('Progress marked for track:', trackId);
    }

    eraseProgressTrackProgress(trackId) {
        const track = progressTrackManager.getTrack(trackId);
        if (track) {
            track.eraseProgress();
            progressTrackManager.saveToStorage();
            this.renderProgressTracks();
            console.log('Progress erased for track:', trackId);
        }
    }

    makeProgressRoll(trackId) {
        const result = progressTrackManager.makeProgressRoll(trackId);
        if (result) {
            this.showProgressRollDialog(result);
        }
    }

    showProgressRollDialog(rollResult) {
        const dialog = document.getElementById('progress-roll-dialog');
        const content = document.getElementById('progress-roll-content');
        
        const { track, roll, progressScore } = rollResult;
        
        content.innerHTML = `
            <div class="progress-roll-result">
                <h4>${track.label}</h4>
                <p>Progress Score: ${progressScore}</p>
                
                <div class="progress-roll-dice">
                    <div class="die d10">${roll.challengeDice[0]}</div>
                    <div class="die d10">${roll.challengeDice[1]}</div>
                </div>
                
                <div class="progress-roll-outcome ${roll.outcome}">
                    ${this.capitalizeFirst(roll.outcome.replace('-', ' '))}
                </div>
                
                <p><strong>Result:</strong> ${this.getProgressRollDescription(roll.outcome, track)}</p>
            </div>
        `;
        
        dialog.style.display = 'flex';
    }

    hideProgressRollDialog() {
        const dialog = document.getElementById('progress-roll-dialog');
        dialog.style.display = 'none';
    }

    getProgressRollDescription(outcome, track) {
        const descriptions = {
            'strong-hit': 'You achieve what you set out to do. Mark appropriate legacy reward if applicable.',
            'weak-hit': 'You achieve what you set out to do, but face a troublesome cost or complication.',
            'miss': 'You fail, and face a dramatic cost. Clear all progress, or abandon this track.'
        };
        
        return descriptions[outcome] || 'Consult the move for guidance.';
    }

    editProgressTrack(trackId) {
        // TODO: Implement edit functionality
        console.log('Edit track:', trackId);
        alert('Edit functionality coming soon!');
    }

    deleteProgressTrack(trackId) {
        if (confirm('Are you sure you want to delete this progress track?')) {
            progressTrackManager.deleteTrack(trackId);
            this.renderProgressTracks();
            console.log('Track deleted:', trackId);
        }
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
        this.updateCurrentSceneDisplay();
        this.updateRecentLogEntries();
    }

    // Scene Log Methods
    updateCurrentSceneDisplay() {
        const currentScene = sceneLog.getCurrentScene();
        const titleElement = document.getElementById('current-scene-title');
        const timeElement = document.getElementById('current-scene-time');
        const descriptionElement = document.getElementById('scene-description');
        
        if (titleElement && currentScene) {
            titleElement.textContent = currentScene.description || 'Current Scene';
        }
        
        if (timeElement && currentScene) {
            timeElement.textContent = sceneLog.getRelativeTime(currentScene.timestamp);
        }
        
        if (descriptionElement && currentScene) {
            descriptionElement.value = currentScene.description || '';
        }
    }

    updateRecentLogEntries() {
        const container = document.getElementById('recent-log-entries');
        if (!container) return;

        const recentEntries = sceneLog.getRecentEntries(5);
        if (recentEntries.length === 0) {
            container.innerHTML = '<p class="text-secondary">No recent activity</p>';
            return;
        }

        container.innerHTML = recentEntries.map(entry => this.renderLogEntry(entry, true)).join('');
    }

    renderLogEntry(entry, compact = false) {
        const typeClass = `entry-type-${entry.type}`;
        const timeText = sceneLog.getRelativeTime(entry.timestamp);
        
        if (compact) {
            return `
                <div class="log-entry compact ${typeClass}">
                    <div class="entry-content">
                        <div class="entry-description">${entry.description}</div>
                        <div class="entry-time">${timeText}</div>
                    </div>
                </div>
            `;
        }

        return `
            <div class="log-entry ${typeClass}">
                <div class="entry-header">
                    <span class="entry-type">${this.capitalizeFirst(entry.type.replace('-', ' '))}</span>
                    <span class="entry-time">${sceneLog.formatTimestamp(entry.timestamp)}</span>
                </div>
                <div class="entry-content">
                    <div class="entry-description">${entry.description}</div>
                    ${entry.result?.roll ? this.renderLogRoll(entry.result.roll) : ''}
                    ${entry.question ? `<div class="entry-question">Question: ${entry.question}</div>` : ''}
                    ${entry.text ? `<div class="entry-text">${entry.text}</div>` : ''}
                </div>
                <div class="entry-scene">Scene: ${entry.sceneDescription}</div>
            </div>
        `;
    }

    renderLogRoll(roll) {
        if (roll.actionDie !== undefined && roll.challengeDice) {
            return `
                <div class="log-roll">
                    <span class="action-die">Action: ${roll.actionDie}</span>
                    <span class="challenge-dice">Challenge: ${roll.challengeDice[0]}, ${roll.challengeDice[1]}</span>
                    <span class="outcome ${roll.outcome}">${this.capitalizeFirst(roll.outcome.replace('-', ' '))}</span>
                </div>
            `;
        } else if (roll.result) {
            return `
                <div class="log-roll">
                    <span class="oracle-roll">Roll: ${roll.roll}</span>
                    <span class="oracle-result">${roll.result}</span>
                </div>
            `;
        }
        return '';
    }

    updateCurrentScene() {
        const descriptionElement = document.getElementById('scene-description');
        const description = descriptionElement.value.trim();
        
        if (description) {
            sceneLog.updateSceneDescription(description);
            sceneLog.logNarrative(`Scene updated: ${description}`, 'scene-update');
            this.updateCurrentSceneDisplay();
            this.updateRecentLogEntries();
        }
    }

    showNewSceneDialog() {
        const dialog = document.getElementById('new-scene-dialog');
        const form = document.getElementById('new-scene-form');
        form.reset();
        dialog.style.display = 'flex';
    }

    hideNewSceneDialog() {
        const dialog = document.getElementById('new-scene-dialog');
        dialog.style.display = 'none';
    }

    handleNewSceneSubmit(e) {
        e.preventDefault();
        const description = document.getElementById('new-scene-description').value.trim();
        
        if (description) {
            const newScene = sceneLog.createScene(description);
            sceneLog.logNarrative(`New scene: ${description}`, 'scene-start');
            
            this.hideNewSceneDialog();
            this.updateCurrentSceneDisplay();
            this.updateRecentLogEntries();
            
            // Clear the scene description field and set it to the new scene
            document.getElementById('scene-description').value = description;
        }
    }

    initializeLogScreen() {
        this.renderScenes();
        this.renderLogEntries();
    }

    renderScenes() {
        const container = document.getElementById('scenes-container');
        if (!container) return;

        const scenes = sceneLog.getScenes();
        if (scenes.length === 0) {
            container.innerHTML = '<p class="text-secondary">No scenes yet</p>';
            return;
        }

        container.innerHTML = scenes.map(scene => {
            const isActive = scene.id === sceneLog.currentSceneId;
            const entryCount = scene.entries.length;
            
            return `
                <div class="scene-item ${isActive ? 'active' : ''}" data-scene-id="${scene.id}">
                    <div class="scene-header">
                        <h4>${scene.description}</h4>
                        <div class="scene-meta">
                            <span class="scene-time">${sceneLog.formatTimestamp(scene.timestamp)}</span>
                            <span class="scene-entries">${entryCount} entries</span>
                        </div>
                    </div>
                    <div class="scene-actions">
                        <button class="btn btn-sm" onclick="app.switchToScene('${scene.id}')">
                            ${isActive ? 'Current' : 'Switch to'}
                        </button>
                        <button class="btn btn-sm" onclick="app.deleteScene('${scene.id}')">Delete</button>
                    </div>
                </div>
            `;
        }).join('');
    }

    renderLogEntries(filter = '') {
        const container = document.getElementById('log-entries-container');
        if (!container) return;

        let entries;
        if (filter) {
            entries = sceneLog.getEntriesByType(filter);
        } else {
            entries = sceneLog.getRecentEntries(50);
        }

        if (entries.length === 0) {
            container.innerHTML = '<p class="text-secondary">No log entries found</p>';
            return;
        }

        container.innerHTML = entries.map(entry => this.renderLogEntry(entry)).join('');
    }

    searchLogEntries(query) {
        const container = document.getElementById('log-entries-container');
        if (!container) return;

        if (!query.trim()) {
            this.renderLogEntries();
            return;
        }

        const results = sceneLog.searchEntries(query);
        if (results.length === 0) {
            container.innerHTML = '<p class="text-secondary">No matching entries found</p>';
            return;
        }

        container.innerHTML = results.map(entry => this.renderLogEntry(entry)).join('');
    }

    filterLogEntries(type) {
        this.renderLogEntries(type);
    }

    switchToScene(sceneId) {
        const scene = sceneLog.switchToScene(sceneId);
        if (scene) {
            this.renderScenes();
            this.updateCurrentSceneDisplay();
            sceneLog.logNarrative(`Switched to scene: ${scene.description}`, 'scene-switch');
        }
    }

    deleteScene(sceneId) {
        if (confirm('Are you sure you want to delete this scene and all its entries?')) {
            sceneLog.deleteScene(sceneId);
            this.renderScenes();
            this.updateCurrentSceneDisplay();
        }
    }

    showNarrativeDialog() {
        const dialog = document.getElementById('narrative-dialog');
        const form = document.getElementById('narrative-form');
        form.reset();
        dialog.style.display = 'flex';
    }

    hideNarrativeDialog() {
        const dialog = document.getElementById('narrative-dialog');
        dialog.style.display = 'none';
    }

    handleNarrativeSubmit(e) {
        e.preventDefault();
        const text = document.getElementById('narrative-text').value.trim();
        const category = document.getElementById('narrative-category').value;
        
        if (text) {
            sceneLog.logNarrative(text, category);
            this.hideNarrativeDialog();
            this.updateRecentLogEntries();
            this.renderLogEntries();
        }
    }

    showOracleDialog() {
        const dialog = document.getElementById('oracle-dialog');
        const form = document.getElementById('oracle-form');
        const resultDiv = document.getElementById('oracle-result');
        
        form.reset();
        resultDiv.style.display = 'none';
        dialog.style.display = 'flex';
    }

    hideOracleDialog() {
        const dialog = document.getElementById('oracle-dialog');
        dialog.style.display = 'none';
    }

    handleOracleSubmit(e) {
        e.preventDefault();
        const question = document.getElementById('oracle-question').value.trim();
        const type = document.getElementById('oracle-type').value;
        
        if (type) {
            const result = this.rollOracle(type);
            sceneLog.logOracle({ Name: `Oracle (${type})`, $id: `oracle_${type}` }, result, question);
            
            this.displayOracleResult(result, question, type);
            this.updateRecentLogEntries();
        }
    }

    rollOracle(type) {
        const roll = Math.floor(Math.random() * 100) + 1;
        let result;
        
        switch (type) {
            case 'yes-no':
                result = roll <= 50 ? 'Yes' : 'No';
                break;
            case 'likely':
                result = roll <= 75 ? 'Yes' : 'No';
                break;
            case 'unlikely':
                result = roll <= 25 ? 'Yes' : 'No';
                break;
            case 'small-chance':
                result = roll <= 10 ? 'Yes' : 'No';
                break;
            case 'sure-thing':
                result = roll <= 90 ? 'Yes' : 'No';
                break;
            default:
                result = roll <= 50 ? 'Yes' : 'No';
        }

        return { roll, result };
    }

    displayOracleResult(result, question, type) {
        const resultDiv = document.getElementById('oracle-result');
        const outcomeClass = result.result.toLowerCase() === 'yes' ? 'success' : 'failure';
        
        resultDiv.innerHTML = `
            <div class="oracle-roll-result ${outcomeClass}">
                <div class="oracle-question">${question || 'Oracle Roll'}</div>
                <div class="oracle-outcome">
                    <span class="roll-value">Rolled: ${result.roll}</span>
                    <span class="result-text">${result.result}</span>
                </div>
            </div>
        `;
        resultDiv.style.display = 'block';
    }

    exportSceneLog() {
        const logData = sceneLog.exportLog();
        const dataStr = JSON.stringify(logData, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        
        const link = document.createElement('a');
        link.href = URL.createObjectURL(dataBlob);
        link.download = `starforged-log-${new Date().toISOString().split('T')[0]}.json`;
        link.click();
    }

    clearSceneLog() {
        if (confirm('Are you sure you want to clear all scenes and log entries? This cannot be undone.')) {
            sceneLog.clearAll();
            this.renderScenes();
            this.renderLogEntries();
            this.updateCurrentSceneDisplay();
            this.updateRecentLogEntries();
        }
    }
}

// Initialize the app when the page loads
document.addEventListener('DOMContentLoaded', async () => {
    window.app = new StarforgedApp();
    await app.init();
});