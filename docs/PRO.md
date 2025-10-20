# Product Requirements Document (PRO.md): Amazon PPC Keyword Genius

**Version 1.3**
**Last Updated**: 2025-10-18

---

## 1. Overview

**Amazon PPC Keyword Genius** is a specialized, AI-powered web tool designed for Amazon sellers and PPC managers. Its primary purpose is to streamline and enhance keyword research, campaign planning, and strategic analysis for Amazon advertising. By leveraging the Google Gemini API, the tool transforms a simple seed keyword into a comprehensive, actionable set of keywords, complete with data points like estimated search volume, competition levels, and relevance scores. The application is built around the concept of "Brands," allowing users to manage distinct workspaces for different products or clients.

## 2. Core Features & User Stories

### 2.1. Brand Management

-   **Description**: Users can create, select, and delete "Brands" to organize their work. All data—including keyword banks, search history, and campaign structures—is scoped to the currently active brand.
-   **User Stories**:
    -   *As a PPC manager, I want to create separate brands for each of my clients so I can keep their keyword research and campaign plans isolated.*
    -   *As an Amazon seller, I want to select my brand from a list to resume my work or start a new research session.*
    -   *As a user, I want to delete a brand I no longer need to clean up my workspace.*

### 2.2. Keyword Research Engine

-   **Description**: The core functionality for generating keywords, supporting both simple and advanced search modes.
-   **Sub-features**:
    -   **Simple Search**: A user enters one seed keyword or product description to get a list of related keywords.
    -   **Advanced Search**: Users can input multiple keywords, filter by search volume, and provide their own brand name for more targeted "Branded" keyword generation (for both their brand and competitors).
    -   **Web Analysis**: An advanced option that grounds the AI's generation in real-time Google Search results to identify current competitors, trends, and long-tail questions. Keywords are sourced as "AI" or "Web."

### 2.3. Data-Rich Results

-   **Description**: Every search returns a detailed table of keywords.
-   **Data Points for each Keyword**:
    -   **Keyword**: The keyword phrase.
    -   **Source**: Origin of the keyword (`AI` or `Web`).
    -   **Type**: PPC match type (`Broad`, `Phrase`, `Exact`, `Long-tail`).
    -   **Category**: Strategic grouping (`Core`, `Opportunity`, `Branded`, `Low-hanging Fruit`, `Complementary`).
    -   **Est. Search Volume**: A string representing estimated monthly searches (e.g., `10k-20k`).
    -   **Competition**: An assessment of PPC competition (`Low`, `Medium`, `High`).
    -   **Relevance**: A 1-10 score of relevance to the seed keyword.

### 2.4. AI-Powered Strategic Insights

-   **Description**: Beyond keyword generation, the tool provides higher-level analysis to guide strategy.
-   **Sub-features**:
    -   **Related Ideas**: Suggests alternative search queries to explore new avenues.
    -   **Keyword Clustering**: On-demand grouping of keywords into thematic clusters based on user intent.
    -   **Keyword Deep Dive**: An in-depth analysis of a single keyword, providing suggested ad copy angles, a recommended bid strategy, and potential negative keywords.

### 2.5. Keyword Bank & Campaign Planner

-   **Description**: A persistent, multi-view system for managing research and campaigns, scoped per brand.
-   **Core Views**:
    -   **Dashboard**: A high-level overview of the keyword bank's statistics.
    -   **Keyword Bank**: A centralized library for viewing, filtering, and managing all keywords generated for the active brand.
    -   **Campaign Planner**: A dedicated, two-column workspace for building and managing PPC campaign structures while simultaneously viewing and assigning keywords from the bank.
-   **User Stories**:
    -   *As a seller, I want all my generated keywords to be automatically saved to my brand's bank so I don't lose my work.*
    -   *As a user, I want to switch to the "Campaign Planner" view to see my campaign structures and my keyword bank at the same time, making it easy to organize keywords.*

### 2.6. Campaign Management

-   **Description**: Users can create, manage, and analyze PPC campaign structures within the unified "Campaign Planner" view.
-   **Sub-features**:
    -   **Template-based Creation**: Create campaigns using a comprehensive library of over a dozen pre-defined templates based on standard Amazon PPC taxonomy (e.g., SP - Auto Research, SB - Video Awareness, SD - Remarketing).
    -   **Custom Campaigns**: A manual option for building custom campaign structures from scratch.
    -   **Ad Group Management**: Add or remove ad groups within each campaign.
    -   **Keyword Assignment**: Assign keywords from the bank to specific ad groups using a bulk-action toolbar, or unassign them to return them to the general pool.
    -   **Integrated AI Projections**: Within each campaign card in the manager, users can set a budget and receive AI-generated performance projections, including estimated clicks, CPC, and a strategic summary.

### 2.7. Data Export & Management

-   **Description**: Users can manage and export their data for use in external tools.
-   **Sub-features**:
    -   **Export Keyword Bank**: Export the entire keyword library, including campaign assignments, to a comprehensive CSV file for analysis.
    -   **Export Campaign Plan**: Export the complete campaign structure (Campaigns, Ad Groups, Keywords, Match Types) to a separate, upload-ready CSV formatted for Amazon's bulk operations.
    -   **Clear Brand Keywords**: A function to reset the keyword bank for the active brand.
    -   **Delete Keywords**: Users can remove individual or bulk-selected keywords from their bank.

## 3. User Interface & Experience (UI/UX)

-   **Three-View Layout**: The application is organized into three main views: **Dashboard**, **Keyword Bank**, and the **Campaign Planner**, accessible via a clear view switcher.
-   **Unified Planner Workspace**: The Campaign Planner view features a two-column layout, with the Campaign Manager on the left and the Keyword Bank on the right, creating a cohesive environment for campaign construction.
-   **Responsive Design**: The application is fully responsive, with a collapsible sidebar for managing brands and search history on mobile devices.
-   **Interactive Tables**: All keyword data is presented in sortable, interactive tables with expandable rows for "deep dive" details.
-   **Visual Indicators**: The UI uses clear visual cues like badges, progress bars (for relevance), and icons (for competition) to make data easily scannable.
-   **Loading & Error States**: The application provides clear feedback to the user when data is being fetched from the API or when an error occurs.

## 4. Non-Functional Requirements

-   **Persistence**: All brand, keyword, and campaign data must be persisted in the browser's `localStorage` to ensure work is not lost between sessions.
-   **Performance**: The UI must remain interactive and responsive during API calls. Animations and transitions should be smooth.
-   **Browser Compatibility**: The application must be compatible with the latest versions of major modern browsers (Chrome, Firefox, Safari, Edge).