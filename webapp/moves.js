// Moves System
class MovesSystem {
    constructor() {
        this.currentMove = null;
        this.moveHistory = [];
    }

    // Execute a move
    executeMove(moveId, options = {}) {
        const move = gameData.getMove(moveId);
        if (!move) {
            console.error('Move not found:', moveId);
            return null;
        }

        this.currentMove = move;

        // Handle different move types
        if (move['Progress Move']) {
            return this.executeProgressMove(move, options);
        } else {
            return this.executeActionMove(move, options);
        }
    }

    // Execute an action move
    executeActionMove(move, options) {
        const { stat, modifiers = 0, burnMomentum = false } = options;
        
        let actionTotal = character.getStat(stat) + modifiers;
        let roll = diceRoller.actionRoll(character.getStat(stat), modifiers);
        
        // Handle momentum burning
        if (burnMomentum && character.momentum > roll.total) {
            const burnedMomentum = character.burnMomentum();
            roll.momentumBurned = burnedMomentum;
            roll.total = burnedMomentum;
            roll.outcome = this.recalculateOutcome(burnedMomentum, roll.challengeDice);
        }

        const result = {
            move,
            roll,
            timestamp: Date.now()
        };

        this.moveHistory.push(result);
        this.processOutcome(move, roll);

        return result;
    }

    // Execute a progress move
    executeProgressMove(move, options) {
        const { vowId, connectionId, otherProgressScore } = options;
        
        let progressScore = 0;
        
        if (vowId) {
            progressScore = character.getVowProgressScore(vowId);
        } else if (otherProgressScore !== undefined) {
            progressScore = otherProgressScore;
        }

        const roll = diceRoller.progressRoll(progressScore);

        const result = {
            move,
            roll,
            progressScore,
            timestamp: Date.now()
        };

        this.moveHistory.push(result);
        this.processOutcome(move, roll);

        return result;
    }

    // Recalculate outcome after momentum burn
    recalculateOutcome(total, challengeDice) {
        let hits = 0;
        if (total >= challengeDice[0]) hits++;
        if (total >= challengeDice[1]) hits++;

        if (hits === 2) return 'strong-hit';
        if (hits === 1) return 'weak-hit';
        return 'miss';
    }

    // Process move outcomes and apply effects
    processOutcome(move, roll) {
        const outcome = roll.outcome;
        
        // Get the outcome text from the move
        const outcomeData = move.Outcomes ? move.Outcomes[this.capitalizeFirst(outcome.replace('-', ' '))] : null;
        
        // Apply automatic effects based on common move patterns
        if (move.Name === 'Face Danger') {
            if (outcome === 'strong-hit') {
                character.adjustMomentum(1);
            } else if (outcome === 'weak-hit') {
                // Player chooses a suffer move with -1
                this.showSufferMoveChoice();
            } else if (outcome === 'miss') {
                // Pay the Price
                this.triggerPayThePrice();
            }
        }

        // Add more move-specific logic here as needed
        return {
            outcome,
            outcomeData,
            effects: this.getOutcomeEffects(move, outcome)
        };
    }

    // Get standardized effects for common outcomes
    getOutcomeEffects(move, outcome) {
        const effects = [];
        
        // Common patterns based on move types
        if (move.Name.includes('Secure') || move.Name.includes('Gather')) {
            if (outcome === 'strong-hit') {
                effects.push('Take +2 momentum');
            } else if (outcome === 'weak-hit') {
                effects.push('Take +1 momentum');
            }
        }

        if (move['Progress Move']) {
            if (outcome === 'strong-hit') {
                effects.push('Mark appropriate legacy reward');
            } else if (outcome === 'weak-hit') {
                effects.push('Mark legacy reward, but complications arise');
            } else if (outcome === 'miss') {
                effects.push('Clear progress and increase rank, or abandon');
            }
        }

        return effects;
    }

    // Show options for suffer moves
    showSufferMoveChoice() {
        const sufferMoves = [
            'Lose Momentum',
            'Endure Harm', 
            'Endure Stress',
            'Sacrifice Resources',
            'Withstand Damage'
        ];

        // This would trigger UI to show suffer move options
        // For now, just log
        console.log('Choose a suffer move:', sufferMoves);
    }

    // Trigger Pay the Price
    triggerPayThePrice() {
        // This would trigger the Pay the Price move
        console.log('Pay the Price triggered');
    }

    // Get available stat options for a move
    getStatOptionsForMove(move) {
        if (!move.Trigger || !move.Trigger.Options) {
            return [];
        }

        return move.Trigger.Options.map(option => ({
            text: option.Text,
            stats: option.Using || [],
            rollType: option['Roll type']
        }));
    }

    // Check if momentum can be burned for current roll
    canBurnMomentum(roll) {
        return roll && roll.type === 'action' && character.momentum > roll.total;
    }

    // Helper function to capitalize first letter
    capitalizeFirst(str) {
        return str.charAt(0).toUpperCase() + str.slice(1);
    }

    // Get move by category for UI
    getMovesByCategory(categoryName) {
        return gameData.getMovesByCategory(categoryName);
    }

    // Get all move categories for UI
    getMoveCategories() {
        return gameData.getMoveCategories().map(cat => ({
            id: cat.$id,
            name: cat.Name,
            description: cat.Description,
            color: cat.Display?.Color
        }));
    }

    // Get formatted move text for display
    getFormattedMoveText(move) {
        if (!move) return '';
        
        let text = move.Text || '';
        
        // Replace move references with clickable links (simplified)
        text = text.replace(/\[([^\]]+)\]\([^)]+\)/g, '<strong>$1</strong>');
        
        return text;
    }

    // Oracle integration
    askTheOracle(oraclePath) {
        const oracle = gameData.getOracle(oraclePath);
        if (!oracle) {
            console.error('Oracle not found:', oraclePath);
            return null;
        }

        const result = gameData.rollOnOracle(oracle);
        
        // Log to move history
        this.moveHistory.push({
            move: { Name: 'Ask the Oracle', $id: 'oracle' },
            oracle: oracle,
            result: result,
            timestamp: Date.now()
        });

        return result;
    }

    // Common oracles for quick access
    getCommonOracles() {
        return [
            'Starforged/Oracles/Moves/Ask_the_Oracle/Almost_Certain',
            'Starforged/Oracles/Moves/Ask_the_Oracle/Likely', 
            'Starforged/Oracles/Moves/Ask_the_Oracle/Fifty_fifty',
            'Starforged/Oracles/Moves/Ask_the_Oracle/Unlikely',
            'Starforged/Oracles/Moves/Ask_the_Oracle/Small_Chance',
            'Starforged/Oracles/Moves/Pay_the_Price'
        ];
    }

    // Get Pay the Price oracle
    payThePrice() {
        return this.askTheOracle('Starforged/Oracles/Moves/Pay_the_Price');
    }

    // Clear move history
    clearHistory() {
        this.moveHistory = [];
    }

    // Get recent moves for display
    getRecentMoves(count = 10) {
        return this.moveHistory.slice(-count).reverse();
    }
}

// Create global instance
window.movesSystem = new MovesSystem();