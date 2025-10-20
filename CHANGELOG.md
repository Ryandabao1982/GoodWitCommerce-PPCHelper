# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [Unreleased]

### Added

- **Documentation Organization**: Created `/docs` folder and moved 29 technical documents from root to improve project navigation and maintainability. Added comprehensive `docs/README.md` index.
- **CODE_REVIEW_SUMMARY.md**: Comprehensive code review document in `/docs` covering architecture analysis, improvements made, code quality metrics, and future optimization recommendations.
- **SOP Service Test**: Added `__tests__/services/sopService.test.ts` to validate service initialization and reinitialization functionality.

### Fixed

- **SOP Creation Bug**: Fixed critical initialization bug in `services/sopService.ts` that prevented SOP creation from working:
  - Changed conditional initialization from `if (apiKey && !genAI)` to `if (apiKey)` to allow proper reinitialization
  - Added module-level initialization call
  - Exported `reinitializeSOPService()` function for when API settings change
  - Integrated reinitialization into App.tsx when API settings are saved/reset
  - Now matches the proven pattern used in `geminiService.ts`

### Changed

- **README.md**: Updated documentation section to reference new `/docs` folder structure with clear navigation to technical documentation.
- **Root Directory**: Cleaned up root from 32 markdown files to just 3 essential files (README.md, CHANGELOG.md, GEMINI.md), improving project organization by 90.6%.

### Technical Improvements

- **Service Consistency**: All AI services (geminiService, sopService) now follow the same initialization pattern
- **Better Integration**: SOP service properly reinitializes when API key is configured or changed
- **Code Quality**: Improved maintainability with organized documentation structure

---

## [Previous Releases]

### Added

-   **BACKEND_PLAN.md**: Comprehensive backend implementation architecture document covering database schema design, API endpoints specification, technology stack recommendations, migration strategy from localStorage to backend, security considerations, deployment architecture, performance optimization, cost estimation, and 16-week implementation timeline. This establishes the foundation for transitioning from browser-based localStorage to a scalable cloud backend system.
-   **Sprint 7 in PLAN.md**: Added new sprint "Backend Infrastructure & Database" with 5 tasks tracking the backend implementation journey from initial planning through MVP, API development, frontend integration, and production launch.
-   **METRICS.md**: Created comprehensive project metrics dashboard tracking development velocity, code quality, documentation health, sprint progress, and technical debt. This fulfills the requirements of the AI Vibe Coder Protocol v3.0.
-   **README.md**: Complete rewrite from placeholder text to comprehensive project documentation including installation guide, feature documentation, technical architecture, development workflow, and roadmap.

### Changed

-   **PLAN.md**: Updated to version 1.4, added Sprint 7 with backend infrastructure tasks, and updated documentation status to include BACKEND_PLAN.md.
-   **BUILD_LOG.md**: Added entry documenting the backend implementation planning work performed on 2025-10-18, including technical highlights, rationale for backend migration, and next steps.

---

## [1.3.0] - 2024-05-23

### Added

-   **Expert Campaign Templates**: Expanded the campaign creation tool with 15 expert-level templates based on the Amazon PPC Campaign Type Taxonomy. This includes pre-configured structures for Sponsored Products, Sponsored Brands, and Sponsored Display campaigns, each with strategy-driven ad group setups.

### Changed

-   The campaign creation templates in the `CampaignManager` have been completely overhauled to replace generic options with specific, professionally recognized campaign types, complete with detailed descriptions to guide user strategy.

---

## [1.2.0] - 2024-05-23

### Changed

-   **Unified Campaign Planner**: Major UI refactor to improve workflow. The campaign management and planning features have been consolidated from fragmented views into a single, cohesive "Campaign Planner" screen. This new view features a two-column layout with the `CampaignManager` on the left and the new `CampaignPlannerView` on the right, creating a unified workspace.
-   **Streamlined Keyword Bank**: The `KeywordBank` view has been simplified to focus solely on managing keywords. The `CampaignManager` sidebar has been removed from this view to support the new, centralized approach to campaign planning.
-   **Improved Navigation**: The main view switcher labels have been updated to "Dashboard", "Keyword Bank", and "Campaign Planner" to more accurately reflect the application's structure and guide the user through a more logical workflow.

### Removed

-   **Redundant Component**: Deleted the `CampaignsView.tsx` component. Its functionality has been migrated into the new, more comprehensive `CampaignPlannerView.tsx`.

---

## [1.1.0] - 2024-05-23

### Added

-   **Architectural Stability**: Introduced internal utility modules (`storage.ts`, `helpers.ts`) to centralize and safely handle data operations, significantly improving application stability and maintainability.

### Fixed

-   **Campaign Projections**: Resolved a critical bug that caused the "Generate Projections" feature to fail with a `400 INVALID_ARGUMENT` error from the Gemini API. The feature is now stable and reliable.
-   **Type Safety**: Eliminated a persistent class of TypeScript errors that occurred when loading data from `localStorage` or deep-cloning application state, making the app more robust.

### Removed

-   **Code Cleanup**: Removed an empty and unused `CampaignPlanner.tsx` component to reduce project clutter.

---

## [1.0.2] - 2024-05-23

### Fixed

-   **Gemini API Schema**: Corrected a `400 INVALID_ARGUMENT` error in the `fetchCampaignProjections` service. The `responseSchema` for `suggestedAdGroupBudgets` was updated from an invalid `Type.OBJECT` with dynamic keys to a valid `Type.ARRAY` of objects with defined `adGroupId` and `budget` properties. The service now transforms this array back to the dictionary format expected by the app, isolating the fix.

---

## [1.0.1] - 2024-05-22

### Changed

-   **Improved UX**: The welcome message now appears above the keyword input section for a more logical user flow when a brand is empty.

### Fixed

-   **TypeScript Typing**: Resolved runtime errors caused by `JSON.parse` losing type information for nested data structures. Added explicit type assertions in `KeywordBank.tsx` and `App.tsx` after parsing data from `localStorage` or deep cloning state to ensure type safety.
-   **Component Types**: Corrected a type definition in `ViewSwitcher.tsx` from `JSX.Element` to `React.ReactNode` to resolve a namespace conflict and improve type compatibility.

---

## [1.0.0] - 2024-05-21

### Added

-   **Initial Release** of the Amazon PPC Keyword Genius application.
-   **Brand Management**: Ability to create, select, and delete brands to sandbox keyword research. All data is saved to `localStorage`.
-   **Keyword Research**:
    -   Simple search mode for single seed keywords.
    -   Advanced search mode with multi-keyword input, volume filters, and brand context.
    -   Optional "Web Analysis" feature to ground results with Google Search.
-   **Results Display**:
    -   Comprehensive results table with sortable columns for Keyword, Source, Type, Category, Volume, Competition, and Relevance.
    -   Visual badges and indicators for scannable data analysis.
-   **AI-Powered Insights**:
    -   "Related Ideas" suggestions to inspire new research paths.
    -   "Keyword Clusters" feature to thematically group keywords in the bank.
    -   "Analyze" deep-dive feature for individual keywords, providing ad copy angles, bid strategies, and negative keyword ideas.
-   **Dashboard & Views**:
    -   Dashboard view summarizing total keywords, average volume, and breakdowns for the active brand.
    -   "Research" and "Keyword Bank" views to separate new searches from the persistent keyword collection.
-   **Data Management**:
    -   Export functionality to download keyword lists as a CSV file.
    -   Ability to delete individual keywords or clear all keywords for a brand.