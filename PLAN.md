# Implementation Plan (PLAN.md)

**Version 1.2**

---

This document outlines the development roadmap for **Amazon PPC Keyword Genius**. It is a living document that tracks the status of features from conception to completion.

---

## Sprint 1: Core Functionality (Complete)

| ID | Title | Status | Requirement |
|---|---|---|---|
| `[TASK-01]` | Initial UI Scaffolding & Componentization | Done | `PRO.md#3.0` |
| `[TASK-02]` | Gemini API Service Integration (`fetchKeywords`) | Done | `PRO.md#2.2` |
| `[TASK-03]` | Brand Management Logic (Create, Select, Delete) | Done | `PRO.md#2.1` |
| `[TASK-04]` | LocalStorage Persistence for State | Done | `PRO.md#4.1` |
| `[TASK-05]` | Simple & Advanced Search UI | Done | `PRO.md#2.2` |
| `[TASK-06]` | Results Table with Sorting & Visuals | Done | `PRO.md#2.3`, `PRO.md#3.3` |

---

## Sprint 2: AI-Powered Insights (Complete)

| ID | Title | Status | Requirement |
|---|---|---|---|
| `[TASK-07]` | Implement "Related Ideas" Feature | Done | `PRO.md#2.4` |
| `[TASK-08]` | Implement "Keyword Clustering" | Done | `PRO.md#2.4` |
| `[TASK-13]` | Implement "Keyword Deep Dive" Analysis | Done | `PRO.md#2.4` |

---

## Sprint 3: Campaign & Workflow Tools (Complete)

| ID | Title | Status | Requirement |
|---|---|---|---|
| `[TASK-09]` | Implement Campaign & Ad Group Hierarchy Management | Done | `PRO.md#2.6` |
| `[TASK-11]` | Bulk Keyword Actions (Assign to Campaign/Ad Group, Delete) | Done | `PRO.md#2.7` |
| `[TASK-15]` | Consolidate Campaign/Planner Views into Unified Workspace | Done | `PRO.md#2.5` |
| `[TASK-16]` | Enhance Campaign Templates with Detailed Taxonomy | Done | `PRO.md#2.6` |

---

## Sprint 4: Visualization & Usability (In Progress)

| ID | Title | Status | Requirement & Details |
|---|---|---|---|
| `[TASK-20]` | Export Campaign Plan | Done | **Requirement**: `PRO.md#2.7`<br>**Details**: Add a feature to the Campaign Manager that exports the complete campaign structure to a CSV file. The format should be compatible with Amazon's bulk upload templates, with columns for `Campaign Name`, `Ad Group Name`, `Keyword Text`, `Match Type`, `Status` (defaulted to 'Enabled'), and an empty `Bid` column for the user to fill in. |
| `[TASK-10]` | Data Visualization for Keyword Clusters | To Do | **Requirement**: `PRO.md#2.4`, `PRO.md#3.0`<br>**Details**: Implement an interactive visualization for the keyword clusters. This could be a bubble chart where each bubble represents a cluster, sized by the number of keywords it contains, or a tree map for a more compact view. Clicking on a cluster visualization should filter the main Keyword Bank table to show only the keywords from that cluster. |
| `[TASK-12]` | User Onboarding & Guided Tour | To Do | **Requirement**: `PRO.md#3.0`<br>**Details**: Implement a multi-step guided tour for first-time users (e.g., using Shepherd.js). The tour will walk through the core workflow: 1. Creating a Brand. 2. Performing the first keyword search. 3. Understanding the Keyword Bank and its data. 4. Navigating to the Campaign Planner. 5. Creating a campaign using a template. |
| `[TASK-14]` | Drag-and-Drop Keyword Assignment | To Do | **Requirement**: `PRO.md#2.6`<br>**Details**: Enhance the **Campaign Planner** view by allowing users to drag selected keywords from the Keyword Bank table (on the right) and drop them directly onto an ad group in the Campaign Manager list (on the left). This will provide a faster, more intuitive alternative to the current bulk-assign modal workflow. |


---

## Sprint 5: Advanced Features & Integrations (To Do)

| ID | Title | Status | Requirement & Details |
|---|---|---|---|
| `[TASK-17]` | Negative Keyword Management | To Do | **Requirement**: Future Enhancement<br>**Details**: Add a new primary view for managing Negative Keyword Lists. Users will be able to create and manage lists (e.g., "Brand Negatives," "Generic Negatives"). These lists can then be applied at the campaign level within the Campaign Planner. The UI will support adding, editing, and deleting negative keywords in bulk. |
| `[TASK-18]` | Performance Metrics Integration | To Do | **Requirement**: Future Enhancement<br>**Details**: Introduce an optional integration with the Amazon Advertising API via a secure OAuth flow. Once connected, the application will fetch key performance metrics (Impressions, Clicks, CPC, Spend, Sales, ACoS) for keywords and campaigns. This data will be displayed directly in the Keyword Bank table, allowing users to compare research data with actual performance. |
| `[TASK-19]` | AI-Powered Bid Suggestions | To Do | **Requirement**: Future Enhancement<br>**Details**: Expand the "Keyword Deep Dive" feature. When performance data is integrated (from `[TASK-18]`), the AI prompt will be enhanced to include the keyword's actual performance metrics and a user-defined target ACoS. The model will then provide a more data-driven bid suggestion (e.g., "Target ACoS is 30%, current CPC is high. Suggest lowering bid to $X.XX to improve profitability."). |