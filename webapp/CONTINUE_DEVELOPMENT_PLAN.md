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
  - **Combat:** Foundation in place ("Enter the Fray" and basic structure)
  - **Progress Tracks:** Comprehensive system supporting Vows, Expeditions, and (partially) Combat

### Foundation Achieved

- All major data is loaded and validated from Dataforged JSON
- Persistent scene log captures complete gameplay narrative
- UI supports all completed systems with search/filter and export functions

---

## Next Steps & Remaining Tasks

### B. Subflow Integration (Connections, Recovery)
- **Connections:** Implement full subflow (creation, progress, benefits, and logging)
- **Recovery:** Add support for healing/harm, stress management, and related moves

### C. Legacy / Advancement System
- Implement XP/legacy point tracking and advancement spends
- UI/logic for milestone and reward events

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
