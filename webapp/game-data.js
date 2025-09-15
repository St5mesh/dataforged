// Game Data Management
class GameData {
    constructor() {
        this.starforgedData = null;
        this.schema = null;
        this.loaded = false;
    }

    async loadData() {
        try {
            // Load the main data file and schema
            const [dataResponse, schemaResponse] = await Promise.all([
                fetch('/dist/starforged/dataforged.json'),
                fetch('/dist/starforged/schema.json')
            ]);

            if (!dataResponse.ok || !schemaResponse.ok) {
                throw new Error('Failed to fetch data files');
            }

            this.starforgedData = await dataResponse.json();
            this.schema = await schemaResponse.json();
            this.loaded = true;

            console.log('Game data loaded successfully');
            return true;
        } catch (error) {
            console.error('Error loading game data:', error);
            return false;
        }
    }

    // Get all moves categorized
    getMoveCategories() {
        if (!this.loaded) return [];
        return this.starforgedData['Move Categories'] || [];
    }

    // Get moves by category name
    getMovesByCategory(categoryName) {
        const categories = this.getMoveCategories();
        const category = categories.find(cat => cat.Name === categoryName);
        return category ? category.Moves : [];
    }

    // Get a specific move by ID
    getMove(moveId) {
        const categories = this.getMoveCategories();
        for (const category of categories) {
            const move = category.Moves.find(m => m.$id === moveId);
            if (move) return move;
        }
        return null;
    }

    // Get all asset types
    getAssetTypes() {
        if (!this.loaded) return [];
        return this.starforgedData['Asset Types'] || [];
    }

    // Get assets by type name
    getAssetsByType(typeName) {
        const assetTypes = this.getAssetTypes();
        const assetType = assetTypes.find(type => type.Name === typeName);
        return assetType ? assetType.Assets : [];
    }

    // Get all path assets
    getPathAssets() {
        return this.getAssetsByType('Path');
    }

    // Get command vehicle assets
    getCommandVehicleAssets() {
        return this.getAssetsByType('Command Vehicle');
    }

    // Get setting truths
    getSettingTruths() {
        if (!this.loaded) return [];
        return this.starforgedData['Setting Truths'] || [];
    }

    // Get oracles
    getOracleCategories() {
        if (!this.loaded) return [];
        return this.starforgedData['Oracle Categories'] || [];
    }

    // Get a specific oracle by path
    getOracle(oraclePath) {
        const categories = this.getOracleCategories();
        
        function findOracleRecursive(items, path) {
            for (const item of items) {
                if (item.$id === path) return item;
                if (item.Oracles) {
                    const found = findOracleRecursive(item.Oracles, path);
                    if (found) return found;
                }
            }
            return null;
        }

        return findOracleRecursive(categories, oraclePath);
    }

    // Helper method to roll on an oracle table
    rollOnOracle(oracle) {
        if (!oracle || !oracle.Table) return null;
        
        const roll = Math.floor(Math.random() * 100) + 1;
        
        for (const entry of oracle.Table) {
            if (roll >= entry.Floor && roll <= entry.Ceiling) {
                let result = {
                    roll: roll,
                    result: entry.Result,
                    entry: entry
                };

                // Handle subtables
                if (entry.Subtable && entry.Subtable.length > 0) {
                    const subRoll = Math.floor(Math.random() * 100) + 1;
                    for (const subEntry of entry.Subtable) {
                        if (subRoll >= subEntry.Floor && subRoll <= subEntry.Ceiling) {
                            result.subResult = subEntry.Result;
                            result.subRoll = subRoll;
                            break;
                        }
                    }
                }

                return result;
            }
        }

        return null;
    }

    // Helper method to get truth options for a category
    getTruthOptions(truthName) {
        const truths = this.getSettingTruths();
        const truth = truths.find(t => t.Name === truthName);
        return truth ? truth.Table : [];
    }

    // Get all non-path, non-command vehicle asset types for third asset selection
    getSelectableAssetTypes() {
        const assetTypes = this.getAssetTypes();
        return assetTypes.filter(type => 
            type.Name !== 'Path' && 
            type.Name !== 'Command Vehicle'
        );
    }

    // Get all encounters
    getEncounters() {
        if (!this.loaded) return [];
        return this.starforgedData['Encounters'] || [];
    }
}

// Create global instance
window.gameData = new GameData();