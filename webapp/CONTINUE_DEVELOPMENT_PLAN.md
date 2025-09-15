# Starforged Webapp: Continued Development Plan

This plan picks up from commit `ed2206b` of [@St5mesh/dataforged](https://github.com/St5mesh/dataforged), focusing on delivering a solo-play Starforged webapp fully grounded in the Dataforged JSON data. The blueprint and next actionable areas are driven by your requirements and the current application structure.

---

## 1. Review: Current State

- **Session 0**: Wizard for world truths, character, starship, assets, stats, and background vow are implemented.
- **Core Data Load**: Dataforged JSON and schema loading is in place via `game-data.js`.
- **Moves/Oracles**: Moves and oracles are loaded, selectable, and executable. Dice system is present.
- **Character Model**: Covers stats/meters/momentum/assets/vows/truths and validation.
- **UI**: Multi-screen (Session 0, Play, Character), with navigation and core displays.

---

## 2. Major Next Steps

### A. Progress Tracks & Subflows

#### 1. **Generic Progress Track System**
- Abstract progress tracks for Vows, Expeditions, Combats, Connections, and Legacy.
- UI to view/add/manage tracks of each type (not just Vows).
- Track ranks, progress, ticks, labels, and link to relevant entities.
- Allow marking progress per move/rank and handling progress roll logic.

#### 2. **Full Move Runner**
- Support all move types: Action, Progress, and Threshold (with subflows, e.g. Endure Harm).
- UI prompts for move-specific context/inputs (choose stat, select track, etc).
- Handle momentum burn legality (only for action rolls).
- Parse Dataforged move definitions for outcome handling, required state updates, and narrative prompts.
- Show outcome text and effects; update character state as needed.

#### 3. **Subflows Coverage**
- **Vows**: Swearing, marking milestones, fulfilling, abandoning.
- **Exploration**: Expeditions, Waypoints, Discoveries, Finish Expedition.
- **Combat**: Fray/Strike/Clash/Decisive Action/Battle.
- **Connections/Bonds**: Make/Develop/Forge/Test.
- **Recover/Suffer**: Sojourn, Heal, Endure Harm/Stress, Face Death/Desolation.

#### 4. **Legacy/Advancement**
- Tracks for Quests, Bonds, Discoveries.
- Earning XP, advancing assets, fulfilling background vow, retiring/continuing.

---

### B. UI Improvements & Additions

#### 1. **Progress Track Management UI**
- View/add/edit all progress tracks by type.
- Mark progress (boxes/ticks) per move.
- Progress roll dialog and resolution.

#### 2. **Scene Loop & Log**
- Scene framing tool and log (add/describe scenes, record outcomes).
- Display history of moves, oracles, key events.

#### 3. **Oracle Tools**
- Full oracle browser with search/filter.
- Quick oracle roll interface for "Ask the Oracle", "Pay the Price", and custom oracles.

#### 4. **Resolution Dialogs**
- Move outcome/resolution popup with effect selection when required (e.g. pick suffer move).

#### 5. **Asset & Advancement UI**
- List, enable/disable, and advance assets (spend XP).
- Asset ability input/checkboxes where relevant.

---

### C. System/Code Enhancements

- **Data Indexing**: Pre-index moves, assets, oracles for fast access by ID.
- **State Sync**: Track and update all game state, including progress tracks, legacy, assets, connections, etc.
- **Persistence**: Ensure all player state is saved/loaded from storage.
- **Validation**: Rules compliance for all state transitions.

---

## 3. Immediate Concrete Tasks

1. **Progress Track Model/UI**  
   - Create a UI component for adding/viewing all progress tracks (not just Vows).
   - Allow marking progress, viewing rank, and making progress rolls.

2. **Move Runner Enhancements**  
   - When a move is selected, if it requires a progress track (e.g., Fulfill a Vow), prompt for which track.
   - Parse Dataforged move outcomes and display appropriate text/effects.
   - Allow momentum burn only when legal.

3. **Scene Log/History**  
   - Implement a simple scene/event log: add entries for scene framing, move results, oracle rolls.

4. **Oracle Browser**  
   - Allow browsing/searching all oracles and rolling on them.

5. **Advancement/Legacy System**  
   - Track XP, legacy progress, and enable asset upgrades.

---

## 4. Example: Progress Track UI Skeleton

Below is a skeleton for a reusable progress track management UI, to be added to the Play or Character screen.

```html
<!-- In index.html, near vows section -->
<div class="progress-tracks-section">
  <h3>Progress Tracks</h3>
  <button id="add-progress-track" class="btn">Add Progress Track</button>
  <div id="progress-tracks-list"></div>
</div>
```
```javascript
// In app.js or progress-tracks.js
function renderProgressTracks() {
  const container = document.getElementById('progress-tracks-list');
  container.innerHTML = '';
  character.progressTracks.forEach(track => {
    const div = document.createElement('div');
    div.className = 'progress-track-display';
    div.innerHTML = `
      <strong>${track.label}</strong> (${track.type}, ${track.rank})<br>
      Progress: ${track.progress} boxes, ${track.ticks} ticks
      <button onclick="markProgress('${track.id}')">Mark Progress</button>
      <button onclick="rollProgress('${track.id}')">Progress Roll</button>
    `;
    container.appendChild(div);
  });
}
```

---

## 5. Collaboration/Next Steps

- **Add a new file for progress track models and management.**
- **Expand move runner to prompt/select progress tracks.**
- **Iterate UI to cover full subflows and legacy features.**

---

## 6. Reference

- All logic, moves, oracles, assets, and truths must be derived from or validated against Dataforged JSON.
- For canonical move/oracle/asset details, always consult Dataforged JSON/schema.

---

**Ready for concrete implementation.**  
If you want to begin with a specific feature (e.g., progress tracks or full move runner), say so and I will generate the code for that next.
