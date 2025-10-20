# User Path Testing Documentation

**Version 1.0**  
**Created**: 2025-10-20  
**Purpose**: Document user path simulation tests and test execution methodology

---

## Overview

This document describes the comprehensive user path simulation tests that trace complete user journeys through the Amazon PPC Keyword Genius application, from the root landing page through key workflows.

## Test Philosophy

User path tests simulate real user interactions with the application, ensuring that:

1. **End-to-end workflows function correctly** from start to finish
2. **State is properly maintained** across different views and interactions
3. **Error handling** provides appropriate feedback to users
4. **Functions are properly traced** during user journeys
5. **Data isolation** works correctly for multi-brand scenarios

## Test Suite Location

- **File**: `__tests__/e2e/userPath.simulation.test.tsx`
- **Type**: End-to-end (e2e) integration tests
- **Framework**: Vitest + React Testing Library

## Running User Path Tests

### Quick Start

```bash
# Run all user path tests
npm run test:run __tests__/e2e/userPath.simulation.test.tsx

# Or use the dedicated script
./scripts/run-user-path-tests.sh

# Run in watch mode during development
npm test -- __tests__/e2e/userPath.simulation.test.tsx
```

### Full Test Suite

```bash
# Run all tests including user path tests
npm test

# Run once (CI/CD mode)
npm run test:run

# Generate coverage report
npm run test:coverage
```

## Test Scenarios

### Path 1: First-Time User - Complete Onboarding Flow

**Purpose**: Verify that new users can successfully set up and start using the application.

**User Journey**:

1. Land at root with no brands
2. See Quick Start Guide with API key already configured
3. Create first brand via modal
4. See enabled research interface

**Key Assertions**:

- Quick Start Guide is visible
- Brand creation modal appears and works
- Search input becomes enabled after brand creation

---

### Path 2: Keyword Research Workflow

**Purpose**: Trace the complete keyword research process from search initiation to results.

**User Journey**:

1. Load with existing brand
2. Enter seed keyword
3. Initiate search
4. See loading state
5. (Results would appear - tested in other suites)

**Key Assertions**:

- Brand loads correctly
- Search input is functional
- Loading state appears during search

---

### Path 3: View Navigation and State Persistence

**Purpose**: Ensure users can navigate between views while maintaining application state.

**User Journey**:

1. Start at Research view (default)
2. Navigate to Keyword Bank
3. Navigate to Campaign Planner
4. Verify data persists across views

**Key Assertions**:

- View switching works correctly
- Keywords remain visible in Keyword Bank
- Campaign view loads properly

---

### Path 4: Settings and API Configuration

**Purpose**: Verify users can access and modify application settings.

**User Journey**:

1. Start with existing brand
2. Navigate to Settings view
3. Verify settings interface loads

**Key Assertions**:

- Settings navigation works
- Settings interface is accessible

---

### Path 5: Multi-Brand Workflow

**Purpose**: Ensure brand switching and data isolation work correctly.

**User Journey**:

1. Start with Brand A active
2. Verify Brand A's data is visible
3. Switch to Brand B
4. Verify data isolation (Brand B's data, not A's)

**Key Assertions**:

- Brand A loads with correct data
- Brand switching mechanism works
- Data is properly isolated between brands

---

### Path 6: Error Handling and Edge Cases

**Purpose**: Verify the application handles error conditions gracefully.

**Test Cases**:

1. **No API Key**: Application shows appropriate prompt
2. **No Brands**: Application shows empty state with creation prompt

**Key Assertions**:

- API key warning appears when unconfigured
- Empty state is displayed when no brands exist
- User is guided toward resolution

---

### Path 7: Campaign Planning Workflow

**Purpose**: Trace campaign creation and keyword assignment path.

**User Journey**:

1. Load with existing brand and keywords
2. Navigate to Campaign Planner
3. See campaign management interface
4. Verify "New Campaign" button exists

**Key Assertions**:

- Campaign planner loads correctly
- Campaign creation UI is accessible
- Keywords are available for assignment

---

### Path 8: Function Tracing

**Purpose**: Trace storage and state update functions during user journeys.

**Test Cases**:

1. **Storage Function Tracing**: Track localStorage calls during initial load
2. **State Update Tracing**: Track storage updates during brand creation

**Key Assertions**:

- Storage functions are called appropriately
- State updates trigger correct storage operations
- Function call counts match expected patterns

---

## Test Structure

### Setup and Mocking

```typescript
// Mock localStorage
const localStorageMock = createLocalStorageMock();
Object.defineProperty(window, 'localStorage', { value: localStorageMock });

// Mock Gemini API
vi.mock('@google/genai', () => ({
  /* ... */
}));

// Mock Supabase client
vi.mock('../../services/supabaseClient', () => ({
  /* ... */
}));
```

### Common Patterns

```typescript
// Wait for async operations
await waitFor(
  () => {
    expect(screen.getByText('Expected Text')).toBeInTheDocument();
  },
  { timeout: 3000 }
);

// Simulate user interactions
const button = screen.getByRole('button', { name: /Button Text/i });
fireEvent.click(button);

// Check storage operations
const spy = vi.spyOn(window.Storage.prototype, 'setItem');
// ... perform actions ...
expect(spy).toHaveBeenCalled();
```

## Debugging Tests

### View Test Output

```bash
# Run with verbose output
npm test -- __tests__/e2e/userPath.simulation.test.tsx --reporter=verbose

# Run in UI mode for interactive debugging
npm run test:ui
```

### Common Issues

1. **Timeouts**: Increase timeout for slow operations

   ```typescript
   await waitFor(
     () => {
       /* ... */
     },
     { timeout: 5000 }
   );
   ```

2. **Element Not Found**: Check if component is rendered conditionally

   ```typescript
   const element = screen.queryByText('Text'); // Returns null if not found
   if (element) {
     expect(element).toBeInTheDocument();
   }
   ```

3. **Mock Issues**: Ensure all required exports are mocked
   ```typescript
   vi.mock('../../services/supabaseClient', () => ({
     supabase: {
       /* all required properties */
     },
     isSupabaseConfigured: vi.fn().mockReturnValue(false),
   }));
   ```

## Test Maintenance

### Adding New Paths

1. Identify the user journey to test
2. Create a new describe block in the test file
3. Set up necessary mocks and initial state
4. Write tests that follow the user's steps
5. Add assertions at key checkpoints
6. Update this documentation

### Updating Existing Paths

1. Review the current test implementation
2. Update assertions to match new UI/behavior
3. Ensure mocks match current API
4. Run tests to verify changes
5. Update documentation if workflow changed

## Test Coverage Goals

- **Path Coverage**: All major user workflows should have tests
- **State Transitions**: All view transitions should be tested
- **Error Cases**: Common error scenarios should be covered
- **Function Tracing**: Critical functions should have tracing tests

## Integration with CI/CD

These tests run as part of the standard test suite:

```bash
# In CI/CD pipeline
npm run test:run
```

For focused user path testing:

```bash
# Run only user path tests
npm run test:run __tests__/e2e/userPath.simulation.test.tsx
```

## Related Documentation

- [USER_PATH_SIMULATION.md](./USER_PATH_SIMULATION.md) - UX analysis and user journey documentation
- [TEST_README.md](./TEST_README.md) - General testing documentation
- [USER_FLOW.md](./USER_FLOW.md) - User flow and experience documentation

---

## Test Results Summary

**Current Status** (as of 2025-10-20):

- Total Test Scenarios: 10
- Passing: 2
- Failing: 8
- Reason for Failures: Primarily timeout and element selection issues in complex UI
- Action Items: Refine selectors and add more specific wait conditions

### Known Issues

1. Some tests timeout waiting for async state updates
2. Element selectors may need refinement for dynamic content
3. Brand switching test needs better state isolation checks

### Future Improvements

1. Add visual regression testing for user paths
2. Implement performance metrics tracking
3. Add accessibility testing to user path tests
4. Create user path test generator for new features

---

**Last Updated**: 2025-10-20  
**Maintained By**: Development Team
