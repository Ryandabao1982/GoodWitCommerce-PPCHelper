# Test Coverage Summary

Updated on: 2025-10-19

## Overview
Comprehensive unit tests were generated for files introduced in this branch, prioritizing React components and TypeScript services. The project uses Vitest + React Testing Library with jsdom, matching existing patterns.

## What was added in this branch
- New component tests:
  - Footer
  - ScrollToTopButton
  - ViewSwitcher
  - RelatedKeywords
  - KeywordClusters
  - SessionManager
  - BrandCreationModal
  - Header
  - Sidebar
  - KeywordInput
  - Dashboard
  - Settings
  - CampaignManager
  - KeywordBank
- New service tests:
  - databaseService (BrandAPI, KeywordAPI, CampaignAPI, AdGroupAPI, SearchHistoryAPI, KeywordClusterAPI)
  - supabaseClient (initialization, env/saved settings, proxy)
  - testConnection (success/failure paths)
- Existing tests retained:
  - ApiKeyPrompt, ErrorMessage, LoadingSpinner, QuickStartGuide, WelcomeMessage
  - utils: campaignTemplates, sorting, storage
  - services: geminiService

## Running tests
- All: npm test
- With coverage: npm test -- --coverage
- Watch: npm test -- --watch

## Suggested next steps
- Add integration/e2e flows across App.tsx (research → bank → planner)
- Expand service tests for auth helpers (signIn/signUp/resetPassword) using mocked client
- Visual regression snapshots for core dashboards