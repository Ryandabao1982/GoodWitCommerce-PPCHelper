/**
 * Utility to check for potential merge conflicts
 * This helps identify if there might be conflicts before merging
 */

export interface ConflictCheckResult {
  hasConflicts: boolean;
  conflictingFiles: string[];
  message: string;
  suggestions: string[];
}

/**
 * Check for common patterns that might indicate merge conflicts
 */
export function checkForMergeConflicts(fileContent: string, filePath: string): boolean {
  const conflictMarkers = [
    '<<<<<<< HEAD',
    '=======',
    '>>>>>>> ',
    '<<<<<<< ',
  ];

  return conflictMarkers.some(marker => fileContent.includes(marker));
}

/**
 * Analyze git status for potential conflict indicators
 */
export function analyzeGitStatus(statusOutput: string): ConflictCheckResult {
  const conflictingFiles: string[] = [];
  const lines = statusOutput.split('\n');

  for (const line of lines) {
    // Check for conflict markers in git status
    if (line.includes('both modified:') || 
        line.includes('both added:') ||
        line.includes('deleted by us:') ||
        line.includes('deleted by them:')) {
      const match = line.match(/:\s+(.+)$/);
      if (match) {
        conflictingFiles.push(match[1].trim());
      }
    }
  }

  const hasConflicts = conflictingFiles.length > 0;

  return {
    hasConflicts,
    conflictingFiles,
    message: hasConflicts
      ? `Found ${conflictingFiles.length} file(s) with potential conflicts`
      : 'No merge conflicts detected',
    suggestions: hasConflicts
      ? [
          'Review the conflicting files before merging',
          'Use git mergetool or manually resolve conflicts',
          'Test thoroughly after resolving conflicts',
          'Consider creating a backup branch before merging',
        ]
      : [
          'Branch appears clean for merging',
          'Review changes one more time',
          'Ensure all tests pass before merging',
        ],
  };
}

/**
 * Generate a pre-merge checklist
 */
export function generatePreMergeChecklist(): string[] {
  return [
    '✓ All tests passing',
    '✓ Code reviewed and approved',
    '✓ No merge conflicts detected',
    '✓ Branch is up to date with main',
    '✓ Documentation updated if needed',
    '✓ Breaking changes documented',
    '✓ CI/CD pipeline passing',
  ];
}

/**
 * Validate that the working tree is clean
 */
export function isWorkingTreeClean(statusOutput: string): boolean {
  return statusOutput.includes('nothing to commit, working tree clean') ||
         statusOutput.includes('working tree clean');
}

/**
 * Get summary of changes in the branch
 */
export interface BranchSummary {
  filesChanged: number;
  insertions: number;
  deletions: number;
  commits: number;
}

export function parseDiffStat(diffStatOutput: string): BranchSummary {
  const summary: BranchSummary = {
    filesChanged: 0,
    insertions: 0,
    deletions: 0,
    commits: 0,
  };

  const match = diffStatOutput.match(/(\d+) files? changed(?:, (\d+) insertions?\(\+\))?(?:, (\d+) deletions?\(-\))?/);
  
  if (match) {
    summary.filesChanged = parseInt(match[1]) || 0;
    summary.insertions = parseInt(match[2]) || 0;
    summary.deletions = parseInt(match[3]) || 0;
  }

  return summary;
}

/**
 * Format conflict check results for display
 */
export function formatConflictReport(result: ConflictCheckResult): string {
  let report = `Merge Conflict Check Report\n`;
  report += `============================\n\n`;
  report += `Status: ${result.hasConflicts ? '⚠️ CONFLICTS FOUND' : '✅ CLEAN'}\n`;
  report += `Message: ${result.message}\n\n`;

  if (result.conflictingFiles.length > 0) {
    report += `Conflicting Files:\n`;
    result.conflictingFiles.forEach(file => {
      report += `  - ${file}\n`;
    });
    report += `\n`;
  }

  report += `Suggestions:\n`;
  result.suggestions.forEach(suggestion => {
    report += `  • ${suggestion}\n`;
  });

  return report;
}
