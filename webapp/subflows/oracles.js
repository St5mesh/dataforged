// Oracle Tools System - Enhanced Oracle Interface and Custom Oracle Support
class OracleSystem {
    constructor() {
        this.initialized = false;
        this.customOracles = this.loadCustomOracles();
        this.recentRolls = [];
        this.maxRecentRolls = 20;
    }

    init() {
        if (this.initialized) return;
        
        this.setupEventListeners();
        this.initialized = true;
        console.log('Oracle system initialized');
    }

    setupEventListeners() {
        // Oracle dialog triggers
        document.addEventListener('click', (e) => {
            if (e.target.id === 'ask-oracle') {
                this.showEnhancedOracleDialog();
            } else if (e.target.id === 'oracle-tools-btn') {
                this.showOracleToolsDialog();
            } else if (e.target.id === 'custom-oracle-btn') {
                this.showCustomOracleDialog();
            }
        });

        // Dialog handlers
        document.addEventListener('click', (e) => {
            if (e.target.id === 'execute-oracle-query') {
                this.executeOracleQuery();
            } else if (e.target.id === 'cancel-oracle-query') {
                this.hideOracleDialog();
            } else if (e.target.id === 'create-custom-oracle') {
                this.createCustomOracle();
            } else if (e.target.id === 'cancel-custom-oracle') {
                this.hideCustomOracleDialog();
            } else if (e.target.classList.contains('oracle-quick-roll')) {
                this.quickRoll(e.target.dataset.oracle);
            } else if (e.target.classList.contains('oracle-category-toggle')) {
                this.toggleOracleCategory(e.target);
            }
        });

        // Search functionality
        document.addEventListener('input', (e) => {
            if (e.target.id === 'oracle-search') {
                this.searchOracles(e.target.value);
            }
        });
    }

    // Enhanced Oracle Dialog
    showEnhancedOracleDialog() {
        const dialog = document.getElementById('enhanced-oracle-dialog') || this.createEnhancedOracleDialog();
        this.populateOracleCategories();
        this.populateRecentRolls();
        dialog.style.display = 'block';
    }

    createEnhancedOracleDialog() {
        const dialog = document.createElement('div');
        dialog.id = 'enhanced-oracle-dialog';
        dialog.className = 'modal';
        dialog.innerHTML = `
            <div class="dialog large-dialog">
                <h3>Oracle Tools</h3>
                
                <div class="oracle-tabs">
                    <button class="tab-btn active" data-tab="browse">Browse Oracles</button>
                    <button class="tab-btn" data-tab="custom">Custom Oracles</button>
                    <button class="tab-btn" data-tab="recent">Recent Rolls</button>
                </div>
                
                <div class="tab-content">
                    <!-- Browse Oracles Tab -->
                    <div id="browse-tab" class="tab-panel active">
                        <div class="oracle-search">
                            <input type="text" id="oracle-search" placeholder="Search oracles...">
                        </div>
                        
                        <div class="oracle-categories" id="oracle-categories">
                            <!-- Categories will be populated here -->
                        </div>
                        
                        <div class="quick-oracles">
                            <h4>Quick Access</h4>
                            <div class="quick-oracle-buttons">
                                <button class="btn oracle-quick-roll" data-oracle="Starforged/Oracles/Core/Action">Action</button>
                                <button class="btn oracle-quick-roll" data-oracle="Starforged/Oracles/Core/Theme">Theme</button>
                                <button class="btn oracle-quick-roll" data-oracle="Starforged/Oracles/Moves/Pay_the_Price">Pay the Price</button>
                                <button class="btn oracle-quick-roll" data-oracle="Starforged/Oracles/Moves/Ask_the_Oracle">Yes/No</button>
                                <button class="btn oracle-quick-roll" data-oracle="Starforged/Oracles/Characters/Name/Given_Name">Name</button>
                                <button class="btn oracle-quick-roll" data-oracle="Starforged/Oracles/Space/Stellar_Object">Stellar Object</button>
                            </div>
                        </div>
                    </div>
                    
                    <!-- Custom Oracles Tab -->
                    <div id="custom-tab" class="tab-panel">
                        <div class="custom-oracle-controls">
                            <button id="create-custom-oracle" class="btn btn-primary">Create Custom Oracle</button>
                        </div>
                        <div id="custom-oracles-list">
                            <!-- Custom oracles will be populated here -->
                        </div>
                    </div>
                    
                    <!-- Recent Rolls Tab -->
                    <div id="recent-tab" class="tab-panel">
                        <div id="recent-rolls-list">
                            <!-- Recent rolls will be populated here -->
                        </div>
                        <div class="recent-rolls-controls">
                            <button id="clear-recent-rolls" class="btn">Clear History</button>
                        </div>
                    </div>
                </div>
                
                <div class="dialog-buttons">
                    <button id="cancel-oracle-query" class="btn">Close</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(dialog);
        
        // Set up tab switching
        dialog.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const tabName = e.target.dataset.tab;
                this.switchOracleTab(tabName);
            });
        });
        
        return dialog;
    }

    switchOracleTab(tabName) {
        const dialog = document.getElementById('enhanced-oracle-dialog');
        
        // Update tab buttons
        dialog.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.tab === tabName);
        });
        
        // Update tab panels
        dialog.querySelectorAll('.tab-panel').forEach(panel => {
            panel.classList.toggle('active', panel.id === `${tabName}-tab`);
        });
        
        // Load tab content
        switch (tabName) {
            case 'browse':
                this.populateOracleCategories();
                break;
            case 'custom':
                this.populateCustomOracles();
                break;
            case 'recent':
                this.populateRecentRolls();
                break;
        }
    }

    populateOracleCategories() {
        const container = document.getElementById('oracle-categories');
        if (!container) return;

        const categories = gameData.getOracleCategories();
        if (!categories || categories.length === 0) {
            container.innerHTML = '<p>No oracle categories found.</p>';
            return;
        }

        container.innerHTML = categories.map(category => this.renderOracleCategory(category)).join('');
    }

    renderOracleCategory(category, depth = 0) {
        const indent = depth * 20;
        let html = `
            <div class="oracle-category" style="margin-left: ${indent}px;">
                <div class="category-header oracle-category-toggle" data-category="${category.$id}">
                    <span class="expand-icon">▶</span>
                    <h4>${category.Name}</h4>
                    ${category.Description ? `<p class="category-description">${category.Description}</p>` : ''}
                </div>
                <div class="category-content" style="display: none;">
        `;

        // Add direct oracles
        if (category.Oracles) {
            category.Oracles.forEach(oracle => {
                html += this.renderOracle(oracle, depth + 1);
            });
        }

        // Add subcategories
        if (category.Categories) {
            category.Categories.forEach(subCategory => {
                html += this.renderOracleCategory(subCategory, depth + 1);
            });
        }

        html += `
                </div>
            </div>
        `;

        return html;
    }

    renderOracle(oracle, depth = 0) {
        const indent = depth * 20;
        return `
            <div class="oracle-item" style="margin-left: ${indent}px;">
                <div class="oracle-header">
                    <h5>${oracle.Name}</h5>
                    <button class="btn btn-small oracle-roll-btn" data-oracle="${oracle.$id}">Roll</button>
                </div>
                ${oracle.Description ? `<p class="oracle-description">${oracle.Description}</p>` : ''}
            </div>
        `;
    }

    toggleOracleCategory(toggleBtn) {
        const categoryDiv = toggleBtn.parentElement.nextElementSibling;
        const expandIcon = toggleBtn.querySelector('.expand-icon');
        
        if (categoryDiv.style.display === 'none') {
            categoryDiv.style.display = 'block';
            expandIcon.textContent = '▼';
        } else {
            categoryDiv.style.display = 'none';
            expandIcon.textContent = '▶';
        }
    }

    searchOracles(searchTerm) {
        const categories = document.querySelectorAll('.oracle-category');
        const oracles = document.querySelectorAll('.oracle-item');
        
        if (!searchTerm.trim()) {
            // Show all categories and oracles
            categories.forEach(cat => cat.style.display = 'block');
            oracles.forEach(oracle => oracle.style.display = 'block');
            return;
        }

        const term = searchTerm.toLowerCase();
        
        oracles.forEach(oracle => {
            const name = oracle.querySelector('h5').textContent.toLowerCase();
            const description = oracle.querySelector('.oracle-description')?.textContent.toLowerCase() || '';
            
            if (name.includes(term) || description.includes(term)) {
                oracle.style.display = 'block';
                // Show parent categories
                let parent = oracle.closest('.oracle-category');
                while (parent) {
                    parent.style.display = 'block';
                    parent.querySelector('.category-content').style.display = 'block';
                    parent.querySelector('.expand-icon').textContent = '▼';
                    parent = parent.parentElement.closest('.oracle-category');
                }
            } else {
                oracle.style.display = 'none';
            }
        });
    }

    quickRoll(oracleId) {
        const oracle = gameData.getOracle(oracleId);
        if (!oracle) {
            alert(`Oracle not found: ${oracleId}`);
            return;
        }

        const result = gameData.rollOnOracle(oracle);
        if (result) {
            this.recordOracleRoll(oracle, result, 'Quick Roll');
            this.showRollResult(oracle, result);
        }
    }

    showRollResult(oracle, result, question = '') {
        const resultDialog = document.createElement('div');
        resultDialog.className = 'modal';
        resultDialog.innerHTML = `
            <div class="dialog">
                <h3>Oracle Result</h3>
                <div class="oracle-result">
                    <h4>${oracle.Name}</h4>
                    ${question ? `<p><strong>Question:</strong> ${question}</p>` : ''}
                    <div class="result-display">
                        <p><strong>Roll:</strong> ${result.roll} (${result.range})</p>
                        <p><strong>Result:</strong> ${result.result}</p>
                    </div>
                    ${result.subtable ? `<p><strong>Details:</strong> ${result.subtable}</p>` : ''}
                </div>
                <div class="dialog-buttons">
                    <button class="btn btn-primary" onclick="this.parentElement.parentElement.parentElement.remove()">Accept</button>
                    <button class="btn" onclick="oracle.reroll()">Reroll</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(resultDialog);
        
        // Log to scene
        sceneLog.addEntry('oracle', `**${oracle.Name}:** ${result.result}`, {
            oracle: oracle.Name,
            question: question,
            roll: result.roll,
            result: result.result
        });
    }

    recordOracleRoll(oracle, result, question = '') {
        const rollRecord = {
            timestamp: new Date(),
            oracle: oracle.Name,
            oracleId: oracle.$id,
            question: question,
            roll: result.roll,
            result: result.result,
            range: result.range
        };

        this.recentRolls.unshift(rollRecord);
        if (this.recentRolls.length > this.maxRecentRolls) {
            this.recentRolls = this.recentRolls.slice(0, this.maxRecentRolls);
        }

        this.saveRecentRolls();
        this.populateRecentRolls();
    }

    populateRecentRolls() {
        const container = document.getElementById('recent-rolls-list');
        if (!container) return;

        if (this.recentRolls.length === 0) {
            container.innerHTML = '<p>No recent oracle rolls.</p>';
            return;
        }

        container.innerHTML = this.recentRolls.map(roll => `
            <div class="recent-roll-item">
                <div class="roll-header">
                    <strong>${roll.oracle}</strong>
                    <span class="roll-timestamp">${this.formatTimestamp(roll.timestamp)}</span>
                </div>
                ${roll.question ? `<div class="roll-question">Q: ${roll.question}</div>` : ''}
                <div class="roll-result">
                    <span class="roll-dice">[${roll.roll}]</span> ${roll.result}
                </div>
                <div class="roll-actions">
                    <button class="btn btn-small oracle-reroll" data-oracle-id="${roll.oracleId}" data-question="${roll.question}">Reroll</button>
                </div>
            </div>
        `).join('');
    }

    formatTimestamp(timestamp) {
        return new Date(timestamp).toLocaleTimeString();
    }

    // Custom Oracle Management
    populateCustomOracles() {
        const container = document.getElementById('custom-oracles-list');
        if (!container) return;

        if (this.customOracles.length === 0) {
            container.innerHTML = '<p>No custom oracles created yet. Click "Create Custom Oracle" to get started.</p>';
            return;
        }

        container.innerHTML = this.customOracles.map(oracle => `
            <div class="custom-oracle-item">
                <div class="oracle-header">
                    <h4>${oracle.name}</h4>
                    <div class="oracle-actions">
                        <button class="btn btn-small oracle-roll-btn" data-custom-oracle="${oracle.id}">Roll</button>
                        <button class="btn btn-small edit-custom-oracle" data-oracle-id="${oracle.id}">Edit</button>
                        <button class="btn btn-small danger delete-custom-oracle" data-oracle-id="${oracle.id}">Delete</button>
                    </div>
                </div>
                <p class="oracle-description">${oracle.description}</p>
                <div class="oracle-entries-count">${oracle.entries.length} entries</div>
            </div>
        `).join('');
    }

    showCustomOracleDialog(oracleId = null) {
        const isEdit = oracleId !== null;
        const oracle = isEdit ? this.customOracles.find(o => o.id === oracleId) : null;
        
        const dialog = document.createElement('div');
        dialog.id = 'custom-oracle-dialog';
        dialog.className = 'modal';
        dialog.innerHTML = `
            <div class="dialog">
                <h3>${isEdit ? 'Edit' : 'Create'} Custom Oracle</h3>
                
                <div class="form-group">
                    <label for="custom-oracle-name">Oracle Name:</label>
                    <input type="text" id="custom-oracle-name" value="${oracle?.name || ''}" placeholder="Enter oracle name...">
                </div>
                
                <div class="form-group">
                    <label for="custom-oracle-description">Description:</label>
                    <textarea id="custom-oracle-description" placeholder="Describe what this oracle is for...">${oracle?.description || ''}</textarea>
                </div>
                
                <div class="form-group">
                    <label>Oracle Entries:</label>
                    <div id="custom-oracle-entries">
                        ${oracle ? this.renderCustomOracleEntries(oracle.entries) : this.renderCustomOracleEntries([])}
                    </div>
                    <button type="button" id="add-oracle-entry" class="btn">Add Entry</button>
                </div>
                
                <div class="dialog-buttons">
                    <button id="save-custom-oracle" class="btn btn-primary" data-oracle-id="${oracleId || ''}">${isEdit ? 'Update' : 'Create'} Oracle</button>
                    <button id="cancel-custom-oracle" class="btn">Cancel</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(dialog);
        
        // Set up entry management
        this.setupCustomOracleEntryHandlers();
    }

    renderCustomOracleEntries(entries) {
        if (entries.length === 0) {
            entries = [{ min: 1, max: 2, result: '' }, { min: 3, max: 4, result: '' }];
        }
        
        return entries.map((entry, index) => `
            <div class="oracle-entry" data-index="${index}">
                <div class="entry-range">
                    <input type="number" class="entry-min" value="${entry.min}" min="1" max="100">
                    -
                    <input type="number" class="entry-max" value="${entry.max}" min="1" max="100">
                </div>
                <div class="entry-result">
                    <input type="text" class="entry-text" value="${entry.result}" placeholder="Oracle result...">
                </div>
                <div class="entry-actions">
                    <button type="button" class="btn btn-small danger remove-entry">Remove</button>
                </div>
            </div>
        `).join('');
    }

    setupCustomOracleEntryHandlers() {
        document.getElementById('add-oracle-entry').addEventListener('click', () => {
            this.addCustomOracleEntry();
        });
        
        document.getElementById('save-custom-oracle').addEventListener('click', (e) => {
            this.saveCustomOracle(e.target.dataset.oracleId);
        });
    }

    addCustomOracleEntry() {
        const container = document.getElementById('custom-oracle-entries');
        const entries = container.querySelectorAll('.oracle-entry');
        const lastEntry = entries[entries.length - 1];
        const lastMax = lastEntry ? parseInt(lastEntry.querySelector('.entry-max').value) : 0;
        
        const newEntry = document.createElement('div');
        newEntry.className = 'oracle-entry';
        newEntry.innerHTML = `
            <div class="entry-range">
                <input type="number" class="entry-min" value="${lastMax + 1}" min="1" max="100">
                -
                <input type="number" class="entry-max" value="${lastMax + 2}" min="1" max="100">
            </div>
            <div class="entry-result">
                <input type="text" class="entry-text" value="" placeholder="Oracle result...">
            </div>
            <div class="entry-actions">
                <button type="button" class="btn btn-small danger remove-entry">Remove</button>
            </div>
        `;
        
        container.appendChild(newEntry);
        
        newEntry.querySelector('.remove-entry').addEventListener('click', () => {
            newEntry.remove();
        });
    }

    saveCustomOracle(oracleId) {
        const name = document.getElementById('custom-oracle-name').value.trim();
        const description = document.getElementById('custom-oracle-description').value.trim();
        
        if (!name) {
            alert('Please enter a name for the oracle');
            return;
        }

        const entries = [];
        document.querySelectorAll('.oracle-entry').forEach(entryDiv => {
            const min = parseInt(entryDiv.querySelector('.entry-min').value);
            const max = parseInt(entryDiv.querySelector('.entry-max').value);
            const result = entryDiv.querySelector('.entry-text').value.trim();
            
            if (result && min <= max) {
                entries.push({ min, max, result });
            }
        });

        if (entries.length === 0) {
            alert('Please add at least one oracle entry');
            return;
        }

        const oracle = {
            id: oracleId || `custom-${Date.now()}`,
            name,
            description,
            entries,
            created: oracleId ? this.customOracles.find(o => o.id === oracleId)?.created : new Date(),
            modified: new Date()
        };

        if (oracleId) {
            const index = this.customOracles.findIndex(o => o.id === oracleId);
            this.customOracles[index] = oracle;
        } else {
            this.customOracles.push(oracle);
        }

        this.saveCustomOracles();
        this.hideCustomOracleDialog();
        this.populateCustomOracles();
        
        alert(`Custom oracle "${name}" ${oracleId ? 'updated' : 'created'} successfully!`);
    }

    hideOracleDialog() {
        const dialog = document.getElementById('enhanced-oracle-dialog');
        if (dialog) {
            dialog.style.display = 'none';
        }
    }

    hideCustomOracleDialog() {
        const dialog = document.getElementById('custom-oracle-dialog');
        if (dialog) {
            dialog.remove();
        }
    }

    // Storage Management
    loadCustomOracles() {
        try {
            const stored = localStorage.getItem('starforged_custom_oracles');
            return stored ? JSON.parse(stored) : [];
        } catch (e) {
            console.error('Failed to load custom oracles:', e);
            return [];
        }
    }

    saveCustomOracles() {
        try {
            localStorage.setItem('starforged_custom_oracles', JSON.stringify(this.customOracles));
        } catch (e) {
            console.error('Failed to save custom oracles:', e);
        }
    }

    saveRecentRolls() {
        try {
            localStorage.setItem('starforged_recent_oracle_rolls', JSON.stringify(this.recentRolls));
        } catch (e) {
            console.error('Failed to save recent rolls:', e);
        }
    }

    loadRecentRolls() {
        try {
            const stored = localStorage.getItem('starforged_recent_oracle_rolls');
            this.recentRolls = stored ? JSON.parse(stored) : [];
        } catch (e) {
            console.error('Failed to load recent rolls:', e);
            this.recentRolls = [];
        }
    }
}

// Initialize the oracle system
const oracleSystem = new OracleSystem();