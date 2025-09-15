# Starforged Webapp: Continued Development Plan (as of 2025-09-15)

## Current Status

The webapp now offers a robust solo Ironsworn: Starforged play experience, grounded in Dataforged JSON data. Major foundational systems are complete, and the core gameplay loop is fully functional.

### Key Features Implemented

- **Scene Log System (Core Loop)**
  - Frame and describe new scenes
  - Execute moves (auto-logged)
  - Use oracle tools (auto-logged)
  - Activity history view, search, and filtering
  - Export game logs

- **Session 0 Wizard**
  - All Dataforged truths, paths, assets available
  - Full validation and character creation logic

- **Subflows**
  - **Vows:** Complete management system (create, update, fulfill, forsake, track progress)
  - **Expeditions:** Complete journey management system (track, update, end)
  - **Connections:** Complete relationship management system (Make/Develop/Forge a Bond) ✨ **NEWLY COMPLETED**
  - **Combat:** Foundation in place ("Enter the Fray" and basic structure)
  - **Progress Tracks:** Comprehensive system supporting Vows, Expeditions, Combat, and Connections

### Foundation Achieved

- All major data is loaded and validated from Dataforged JSON
- Persistent scene log captures complete gameplay narrative
- UI supports all completed systems with search/filter and export functions

---

## Recently Completed: Connections Subflow ✨

**Implementation Date:** September 15, 2025

The Connections subflow has been fully implemented with all core relationship mechanics from Starforged:

### Features Completed:
- **Make a Connection Move:** Create relationships with NPCs using Heart rolls
- **Develop Your Relationship Move:** Progress connections through meaningful interactions
- **Forge a Bond Move:** Complete relationships with legacy rewards and bond benefits
- **Progress Tracking:** Full 10-box progress system with tick management
- **Bond Benefits:** Choose between Bolster (+2 aid) or Expand (dual roles) influence
- **UI Integration:** Complete interface in Character screen with connection cards
- **Scene Log Integration:** All moves fully logged with detailed outcomes
- **Data Persistence:** All connections saved to character storage

### Technical Implementation:
- Complete connections.js subflow (985+ lines)
- Updated index.html with Connections UI section
- Enhanced styles.css with connection-specific styling
- Integrated with app.js initialization system
- Full modal dialog system for all three connection moves
- Comprehensive error handling and validation

---

## Next Steps & Remaining Tasks

### B. Recovery System ⭐ **NEXT PRIORITY**
- Implement healing/harm mechanics and moves
- Add stress management and spirit recovery
- Supply management and resupply mechanics
- Health condition tracking and effects

### C. Legacy / Advancement System  
- Implement XP/legacy point spending interface
- UI/logic for milestone and reward events
- Experience point management for asset advancement

### E. Move Runner Enhancement
- Expand move runner to support all advanced and narrative moves (beyond current core set)
- Add context-sensitive prompts and resolution helpers

### F. Oracle Tool Implementation
- Complete UI for all oracle tables (beyond currently logged oracles)
- Support custom oracles and results editing

### G. UI Completion and Polish
- Finalize responsive layouts, settings, and accessibility
- Add tutorial/onboarding elements
- Improve error messaging and edge-case handling

---

## Ongoing

- **Testing & Bugfixes:** Address edge cases, improve robustness
- **Documentation:** Update in-app and repo docs as new features are added

---

## Reference

For latest updates and details, see:  
[Commit History](https://github.com/St5mesh/dataforged/commits/main)
