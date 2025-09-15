// Dice Rolling System
class DiceRoller {
    constructor() {
        this.lastRoll = null;
    }

    // Roll a single die
    rollDie(sides) {
        return Math.floor(Math.random() * sides) + 1;
    }

    // Roll multiple dice
    rollDice(count, sides) {
        const results = [];
        for (let i = 0; i < count; i++) {
            results.push(this.rollDie(sides));
        }
        return results;
    }

    // Action roll: 1d6 + stat + modifiers vs 2d10
    actionRoll(stat, modifiers = 0) {
        const actionDie = this.rollDie(6);
        const challengeDice = this.rollDice(2, 10);
        const total = actionDie + stat + modifiers;

        let outcome;
        let hits = 0;
        
        // Count how many challenge dice the total beats or ties
        if (total >= challengeDice[0]) hits++;
        if (total >= challengeDice[1]) hits++;

        // Determine outcome
        if (hits === 2) {
            outcome = 'strong-hit';
        } else if (hits === 1) {
            outcome = 'weak-hit';
        } else {
            outcome = 'miss';
        }

        // Check for match (both challenge dice are the same)
        const isMatch = challengeDice[0] === challengeDice[1];

        this.lastRoll = {
            type: 'action',
            actionDie,
            challengeDice,
            stat,
            modifiers,
            total,
            outcome,
            isMatch,
            hits
        };

        return this.lastRoll;
    }

    // Progress roll: Challenge dice vs progress score
    progressRoll(progressScore) {
        const challengeDice = this.rollDice(2, 10);
        let hits = 0;

        // Count how many challenge dice the progress score beats
        if (progressScore > challengeDice[0]) hits++;
        if (progressScore > challengeDice[1]) hits++;

        let outcome;
        if (hits === 2) {
            outcome = 'strong-hit';
        } else if (hits === 1) {
            outcome = 'weak-hit';
        } else {
            outcome = 'miss';
        }

        // Check for match (both challenge dice are the same)
        const isMatch = challengeDice[0] === challengeDice[1];

        this.lastRoll = {
            type: 'progress',
            challengeDice,
            progressScore,
            outcome,
            isMatch,
            hits
        };

        return this.lastRoll;
    }

    // Oracle roll (1d100)
    oracleRoll() {
        const result = Math.floor(Math.random() * 100) + 1;
        
        this.lastRoll = {
            type: 'oracle',
            result
        };

        return this.lastRoll;
    }

    // Generic die roll
    customRoll(notation) {
        // Parse dice notation like "2d6", "1d10", etc.
        const match = notation.match(/(\d+)d(\d+)(?:\+(\d+))?/i);
        if (!match) {
            throw new Error('Invalid dice notation');
        }

        const count = parseInt(match[1]);
        const sides = parseInt(match[2]);
        const modifier = parseInt(match[3]) || 0;

        const dice = this.rollDice(count, sides);
        const total = dice.reduce((sum, die) => sum + die, 0) + modifier;

        this.lastRoll = {
            type: 'custom',
            notation,
            dice,
            modifier,
            total
        };

        return this.lastRoll;
    }

    // Get outcome display text
    getOutcomeText(outcome) {
        switch (outcome) {
            case 'strong-hit':
                return 'Strong Hit';
            case 'weak-hit':
                return 'Weak Hit';
            case 'miss':
                return 'Miss';
            default:
                return 'Unknown';
        }
    }

    // Get outcome color class
    getOutcomeClass(outcome) {
        switch (outcome) {
            case 'strong-hit':
                return 'strong-hit';
            case 'weak-hit':
                return 'weak-hit';
            case 'miss':
                return 'miss';
            default:
                return '';
        }
    }

    // Display roll results in the UI
    displayRollResult(container, roll) {
        container.innerHTML = '';
        
        const resultDiv = document.createElement('div');
        resultDiv.className = `roll-result ${this.getOutcomeClass(roll.outcome)}`;

        let html = '';

        if (roll.type === 'action') {
            html = `
                <h4>${this.getOutcomeText(roll.outcome)}</h4>
                <div class="dice-roll">
                    <div class="die d6">${roll.actionDie}</div>
                    <span>+</span>
                    <span>${roll.stat}</span>
                    ${roll.modifiers !== 0 ? `<span>${roll.modifiers >= 0 ? '+' : ''}${roll.modifiers}</span>` : ''}
                    <span>=</span>
                    <span class="total">${roll.total}</span>
                    <span>vs</span>
                    <div class="die d10">${roll.challengeDice[0]}</div>
                    <div class="die d10">${roll.challengeDice[1]}</div>
                </div>
                ${roll.isMatch ? '<p><strong>Match!</strong> Something unexpected happens.</p>' : ''}
            `;
        } else if (roll.type === 'progress') {
            html = `
                <h4>${this.getOutcomeText(roll.outcome)}</h4>
                <div class="dice-roll">
                    <span>Progress ${roll.progressScore}</span>
                    <span>vs</span>
                    <div class="die d10">${roll.challengeDice[0]}</div>
                    <div class="die d10">${roll.challengeDice[1]}</div>
                </div>
                ${roll.isMatch ? '<p><strong>Match!</strong> Something unexpected happens.</p>' : ''}
            `;
        } else if (roll.type === 'oracle') {
            html = `
                <h4>Oracle Roll</h4>
                <div class="dice-roll">
                    <span>Result: ${roll.result}</span>
                </div>
            `;
        } else if (roll.type === 'custom') {
            html = `
                <h4>Custom Roll: ${roll.notation}</h4>
                <div class="dice-roll">
                    ${roll.dice.map(die => `<div class="die">${die}</div>`).join('')}
                    ${roll.modifier !== 0 ? `<span>${roll.modifier >= 0 ? '+' : ''}${roll.modifier}</span>` : ''}
                    <span>=</span>
                    <span class="total">${roll.total}</span>
                </div>
            `;
        }

        resultDiv.innerHTML = html;
        container.appendChild(resultDiv);
        container.classList.add('active');
    }
}

// Create global instance
window.diceRoller = new DiceRoller();