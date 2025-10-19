# Test Suite Documentation

This document describes the test infrastructure and test suite for the Amazon PPC Keyword Genius application.

## Overview

The application uses **Vitest** as the test runner, along with **React Testing Library** for component testing. All tests are located in the `__tests__` directory, organized by feature area.

## Test Structure

```text
__tests__/
├── components/          # React component tests
│   ├── ErrorMessage.test.tsx
│   ├── LoadingSpinner.test.tsx
│   └── WelcomeMessage.test.tsx
├── services/            # Service layer tests
│   └── geminiService.test.ts
└── utils/               # Utility function tests
    ├── sorting.test.ts
    └── storage.test.ts
```

## Running Tests

### Available Commands

```bash
# Run tests in watch mode (interactive)
npm test

# Run tests once and exit
npm run test:run

# Run tests with UI
npm run test:ui

# Run tests with coverage report
npm run test:coverage
```

### Test Scripts

- `npm test` - Runs Vitest in watch mode, re-running tests when files change
- `npm run test:ui` - Opens the Vitest UI for interactive test exploration
- `npm run test:run` - Runs all tests once (useful for CI/CD)
- `npm run test:coverage` - Generates a code coverage report

## Test Coverage

### Utilities (100% Coverage)

#### `utils/storage.ts`
- **Tests**: 18 tests
- **Coverage**: Complete coverage of localStorage operations
- **Key Tests**:
  - Loading data with default values
  - Saving complex objects and arrays
  - Error handling for invalid JSON
  - Integration tests for save/load cycles

#### `utils/sorting.ts`
- **Tests**: 19 tests
- **Coverage**: Complete coverage of search volume parsing and sorting
- **Key Tests**:
  - Parsing numeric values with k/K/m/M multipliers
  - Handling ranges (e.g., "10k-20k")
  - Sorting in ascending/descending order
  - Edge cases (N/A, empty strings, invalid formats)

### Services

#### `services/geminiService.ts`
- **Tests**: 13 tests
- **Coverage**: Core API interaction logic
- **Key Tests**:
  - Keyword fetching with various configurations
  - Keyword clustering
  - Deep dive analysis
  - Error handling
  - JSON parsing from code blocks
  - Web analysis mode

**Note**: The geminiService tests use mocked API calls to avoid requiring an actual API key and to ensure consistent test results.

### Components

#### `components/LoadingSpinner.tsx`
- **Tests**: 5 tests
- **Coverage**: Complete component behavior
- **Key Tests**:
  - Default message rendering
  - Custom message rendering
  - Spinner element presence
  - Styling classes

#### `components/ErrorMessage.tsx`
- **Tests**: 7 tests
- **Coverage**: Complete component behavior
- **Key Tests**:
  - Error message display
  - Accessibility (alert role)
  - Error styling
  - Multiple error scenarios

#### `components/WelcomeMessage.tsx`
- **Tests**: 11 tests
- **Coverage**: Complete component behavior including conditional rendering
- **Key Tests**:
  - No brand state (welcome screen)
  - Active brand state (workflow display)
  - Button interactions
  - Brand switching behavior

## Test Configuration

### Vitest Configuration (`vitest.config.ts`)

```typescript
{
  environment: 'jsdom',        // DOM simulation for component tests
  globals: true,               // Global test functions (describe, it, expect)
  setupFiles: './src/test/setup.ts',
  coverage: {
    provider: 'v8',
    reporter: ['text', 'json', 'html'],
    exclude: [/* ... */]
  }
}
```

### Test Setup (`src/test/setup.ts`)

The setup file configures:
- **Cleanup**: Automatic cleanup after each test
- **localStorage Mock**: In-memory implementation for testing
- **window.matchMedia Mock**: For dark mode detection
- **Environment Variables**: Mock API keys for testing

## Writing New Tests

### Example: Testing a Utility Function

```typescript
import { describe, it, expect } from 'vitest';
import { myFunction } from '../../utils/myUtil';

describe('myUtil', () => {
  describe('myFunction', () => {
    it('should handle basic input', () => {
      expect(myFunction('input')).toBe('expected output');
    });

    it('should handle edge cases', () => {
      expect(myFunction('')).toBe('default');
      expect(myFunction(null)).toBe('default');
    });
  });
});
```

### Example: Testing a Component

```typescript
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MyComponent } from '../../components/MyComponent';

describe('MyComponent', () => {
  it('should render correctly', () => {
    render(<MyComponent prop="value" />);
    expect(screen.getByText('Expected Text')).toBeInTheDocument();
  });

  it('should handle user interactions', async () => {
    const handleClick = vi.fn();
    const user = userEvent.setup();
    
    render(<MyComponent onClick={handleClick} />);
    await user.click(screen.getByRole('button'));
    
    expect(handleClick).toHaveBeenCalledTimes(1);
  });
});
```

### Example: Testing with Mocks

```typescript
import { describe, it, expect, vi } from 'vitest';

vi.mock('../../services/api', () => ({
  fetchData: vi.fn().mockResolvedValue({ data: 'mocked' }),
}));

import { fetchData } from '../../services/api';

describe('with mocks', () => {
  it('should use mocked data', async () => {
    const result = await fetchData();
    expect(result).toEqual({ data: 'mocked' });
  });
});
```

## Best Practices

### 1. Test Organization
- Group related tests using `describe` blocks
- Use descriptive test names starting with "should"
- Keep tests focused on a single behavior

### 2. Test Independence
- Each test should be independent
- Use `beforeEach` for common setup
- Clean up after tests automatically (handled by setup)

### 3. Assertions
- Use specific matchers (`toBe`, `toEqual`, `toContain`, etc.)
- Test both positive and negative cases
- Include edge cases and error conditions

### 4. Mocking
- Mock external dependencies (APIs, services)
- Use `vi.fn()` for function mocks
- Reset mocks in `beforeEach` to ensure test isolation

### 5. Component Testing
- Test user-visible behavior, not implementation
- Use Testing Library's queries (`getByRole`, `getByText`)
- Simulate real user interactions with `userEvent`

## Continuous Integration

Tests are designed to run in CI/CD pipelines:

```yaml
# Example GitHub Actions workflow
- name: Install dependencies
  run: npm install
  
- name: Run tests
  run: npm run test:run
  
- name: Generate coverage
  run: npm run test:coverage
```

## Troubleshooting

### Tests Failing Locally

1. **Clear node_modules**: `rm -rf node_modules && npm install`
2. **Clear cache**: `npx vitest --clearCache`
3. **Check environment**: Ensure you're using Node.js v16+

### Mocking Issues

- Ensure mocks are defined before imports
- Use `vi.stubEnv()` for environment variables
- Reset mocks between tests with `vi.clearAllMocks()`

### Component Test Issues

- Check that jsdom is installed
- Verify setup file is being loaded
- Use `screen.debug()` to inspect rendered output

## Coverage Goals

Current coverage targets:
- **Overall**: 80%+ coverage
- **Critical paths**: 100% coverage (utils, services)
- **Components**: 80%+ coverage

View detailed coverage reports by running:
```bash
npm run test:coverage
```

Then open `coverage/index.html` in your browser.

## Contributing

When adding new features:
1. Write tests before or alongside code
2. Ensure all tests pass: `npm run test:run`
3. Maintain coverage levels: `npm run test:coverage`
4. Follow existing test patterns and naming conventions

## Resources

- [Vitest Documentation](https://vitest.dev/)
- [React Testing Library](https://testing-library.com/react)
- [Jest DOM Matchers](https://github.com/testing-library/jest-dom)
- [User Event](https://testing-library.com/docs/user-event/intro)

---

## 2025-10-19 — Test Generation Note for copilot/fix-jest-dom-matchers

No files differ between this ref and the base ref (main) for the purposes of scoped unit test generation.
Per instructions to "only generate unit tests for those specific files within the diff," no new tests were added in this run.

Details:
- Current ref: fe10659 (Initial plan)
- Base ref: main
- Command used: `git diff --name-only --diff-filter=AM main..HEAD` → no changed files

If new commits are pushed to this branch or the base ref changes, re-run the test generator to target the updated diff set.

---