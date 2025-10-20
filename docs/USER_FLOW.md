# User Flow Documentation

**Version 1.4**
**Last Updated**: 2025-10-19

---

## Overview

This document outlines the optimized user journey through the Amazon PPC Keyword Genius application, from first-time setup to advanced campaign management.

---

## First-Time User Experience

### Step 1: Landing Page
**What the user sees:**
- Welcome message with clear call-to-action
- Quick Start Guide showing 3 progressive steps
- Disabled search input (prompts user to create brand first)

**UX Improvements:**
- ✅ Progressive disclosure - show only what's needed
- ✅ Clear visual hierarchy with numbered steps
- ✅ Progress bar showing completion status
- ✅ Contextual help for each step

### Step 2: API Key Setup
**Trigger:** User clicks "Configure Now" in Quick Start Guide or tries to search without API key

**What happens:**
- API Key Prompt modal appears with:
  - Clear explanation of why API key is needed
  - Step-by-step instructions to get API key
  - Direct link to Google AI Studio
  - Security/privacy assurance
  - "Skip for Now" option for exploration

**UX Improvements:**
- ✅ Just-in-time education about API requirements
- ✅ Reduced friction with external link to API key creation
- ✅ Clear security messaging to build trust
- ✅ Non-blocking flow (can skip and configure later)

### Step 3: Brand Creation
**Trigger:** User clicks "Create Brand" in Quick Start Guide or Welcome Message

**What happens:**
- Brand Creation Modal opens
- Simple form with single input field
- Validation for empty/duplicate names
- Success redirects to research interface

**UX Improvements:**
- ✅ Minimal input required (just brand name)
- ✅ Inline validation and error messages
- ✅ Multiple entry points for convenience

### Step 4: First Search
**Trigger:** User enters keyword and clicks Search

**What happens:**
- **Without API Key:** API Key Prompt appears (prevents frustration)
- **With API Key:** 
  - Loading spinner shows progress
  - AI generates keyword suggestions
  - Auto-switches to Keyword Bank view (most relevant view)
  - Related keyword ideas displayed
  - Quick Start Guide dismisses automatically

**UX Improvements:**
- ✅ Proactive API key check prevents failed searches
- ✅ Automatic view switching to most relevant content
- ✅ Quick Start Guide dismisses once workflow is understood
- ✅ Related ideas encourage exploration

---

## Returning User Experience

### Navigation Flow

```
Dashboard View (Overview)
    ↓
Keyword Bank View (Research Results & Management)
    ↓
Campaign Planner View (Two-column workspace)
    ↓
Settings View (Configuration)
```

### View Switcher Behavior

**Conditional Display:**
- Quick Start Guide shows for new users (can be dismissed)
- View Switcher only appears when brand is active
- View Switcher hidden during keyword clustering view
- Settings accessible from all states

**Smart Defaults:**
- After search → Keyword Bank view
- After brand selection → Dashboard view
- After creating campaign → Campaign Planner view

---

## Key User Flows

### Flow 1: Research New Keywords
1. Select/create brand (if needed)
2. Enter seed keyword
3. (Optional) Toggle advanced options
4. Click Search
5. Review results in Keyword Bank
6. (Optional) Cluster keywords for organization
7. (Optional) Deep dive into specific keywords

### Flow 2: Build Campaign Structure
1. Navigate to Campaign Planner
2. Click "Create Campaign"
3. Choose template or custom
4. Add ad groups
5. Drag/drop or bulk-assign keywords from Keyword Bank
6. Set budgets and get AI projections
7. Export campaign plan for Amazon

### Flow 3: Manage Multiple Brands
1. Click brand dropdown in header
2. Select different brand
3. All data switches to selected brand
4. Continue research/planning for that brand
5. (Optional) Create new brand from header

### Flow 4: Export Data
1. Navigate to Keyword Bank
2. Click "Export" button
3. Choose "Keyword Bank" or "Campaign Plan"
4. CSV downloads automatically
5. Upload to Amazon Advertising Console

---

## UX Principles Applied

### 1. Progressive Disclosure
- Show Quick Start Guide only to new users
- Hide advanced options until requested
- Display View Switcher only when relevant

### 2. Contextual Guidance
- API Key Prompt appears when needed
- Helpful tooltips and descriptions
- Step-by-step wizard for complex tasks

### 3. Preventing Errors
- Disable search without brand
- Prompt for API key before failed search
- Validate brand names before creation
- Confirm destructive actions

### 4. Visual Feedback
- Loading spinners during API calls
- Progress indicators in Quick Start Guide
- Success/error messages with clear actions
- Completion checkmarks for finished steps

### 5. Efficient Workflows
- Auto-switch to relevant views
- Bulk operations for keywords
- Keyboard shortcuts (Enter to search)
- Smart defaults throughout

---

## Mobile/Responsive Considerations

- Collapsible sidebar for brand/history on small screens
- Touch-friendly button sizes (min 44px)
- Simplified Quick Start Guide on mobile
- Stacked layout for Campaign Planner (vertical)
- Full-page modals on mobile devices

---

## Accessibility Features

- Keyboard navigation support
- ARIA labels on interactive elements
- High contrast mode (dark theme)
- Descriptive button labels
- Focus indicators on all interactive elements

---

## Common User Questions Addressed

**Q: "Why do I need an API key?"**
A: API Key Prompt modal explains this with visual clarity

**Q: "What's a brand workspace?"**
A: Welcome Message and Quick Start Guide explain the concept

**Q: "Where do I start?"**
A: Quick Start Guide provides clear numbered steps

**Q: "How do I get keywords into campaigns?"**
A: Campaign Planner's two-column layout makes this obvious

**Q: "What should I do first?"**
A: Progress bar in Quick Start Guide shows the path

---

## Future Enhancements

### Planned Improvements
- [ ] Interactive tutorial/walkthrough (Shepherd.js)
- [ ] Keyboard shortcuts guide
- [ ] Video tutorials embedded in UI
- [ ] Tooltips with contextual help
- [ ] Undo/redo functionality
- [ ] Search history with filtering
- [ ] Saved searches/templates
- [ ] Bulk brand operations

### User Testing Goals
- Measure time-to-first-search for new users
- Track Quick Start Guide completion rate
- Monitor API key setup success rate
- Identify common drop-off points
- Gather feedback on view organization

---

## Metrics to Track

### Onboarding Success
- % of users who complete Quick Start Guide
- Time from landing to first search
- API key setup success rate
- Brand creation completion rate

### Feature Adoption
- % using advanced search options
- % using keyword clustering
- % using campaign planner
- Export frequency

### User Engagement
- Average session duration
- Searches per session
- Brands per user
- Return visit frequency

---

## Changelog

### v1.4 (2025-10-19)
- Added Quick Start Guide for first-time users
- Implemented API Key Prompt with contextual help
- Added smart view switching after search
- Improved progressive disclosure throughout
- Enhanced mobile responsiveness

### v1.3
- Added Campaign Planner view
- Implemented drag-and-drop keyword assignment
- Added export functionality

### v1.2
- Added keyword clustering
- Implemented deep dive analysis
- Added related keyword ideas

### v1.1
- Added brand management
- Implemented keyword bank
- Added dashboard view

---

**Last Review**: 2025-10-19
**Next Review**: 2025-11-19
