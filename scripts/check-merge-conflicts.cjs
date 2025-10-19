#!/usr/bin/env node

/**
 * Pre-merge conflict checker
 * Run this script before merging to check for potential conflicts
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

function runCommand(command) {
  try {
    return execSync(command, { encoding: 'utf-8' });
  } catch (error) {
    return error.stdout || error.stderr || '';
  }
}

function checkForConflictMarkers(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    const lines = content.split('\n');
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      // Check for actual git conflict markers (not in comments)
      if (line.startsWith('<<<<<<< ') || 
          (line === '=======' && i > 0 && lines[i-1].trim().startsWith('<<<<<<< ')) ||
          line.startsWith('>>>>>>> ')) {
        // Additional check: ensure it's not a comment
        const uncommentedLine = line.replace(/^(\/\/|#|--|\*)\s*/, '');
        if (uncommentedLine.startsWith('<<<<<<< ') || 
            uncommentedLine.startsWith('>>>>>>> ') ||
            (uncommentedLine === '=======' && i > 0)) {
          return true;
        }
      }
    }
    return false;
  } catch (error) {
    return false;
  }
}

function main() {
  console.log('🔍 Pre-Merge Conflict Checker\n');
  console.log('='.repeat(50));
  
  // Check git status
  const status = runCommand('git status --porcelain');
  const statusFull = runCommand('git status');
  
  // Check if working tree is clean
  const isClean = statusFull.includes('nothing to commit, working tree clean');
  
  console.log('\n📋 Git Status:');
  if (isClean) {
    console.log('✅ Working tree is clean');
  } else {
    console.log('⚠️  Working tree has uncommitted changes');
    console.log(status);
  }
  
  // Check for conflict markers in files
  console.log('\n🔎 Scanning for conflict markers...');
  const files = runCommand('git ls-files').split('\n').filter(Boolean);
  const filesWithConflicts = [];
  
  for (const file of files) {
    if (file && fs.existsSync(file) && checkForConflictMarkers(file)) {
      filesWithConflicts.push(file);
    }
  }
  
  if (filesWithConflicts.length > 0) {
    console.log('❌ Found conflict markers in the following files:');
    filesWithConflicts.forEach(file => console.log(`   - ${file}`));
  } else {
    console.log('✅ No conflict markers found');
  }
  
  // Get branch info
  const currentBranch = runCommand('git branch --show-current').trim();
  console.log(`\n🌿 Current branch: ${currentBranch}`);
  
  // Check for unmerged files
  const unmergedFiles = runCommand('git diff --name-only --diff-filter=U').trim();
  if (unmergedFiles) {
    console.log('\n❌ Unmerged files detected:');
    unmergedFiles.split('\n').forEach(file => console.log(`   - ${file}`));
  } else {
    console.log('\n✅ No unmerged files');
  }
  
  // Get commit stats
  try {
    const commits = runCommand(`git rev-list --count ${currentBranch}`).trim();
    console.log(`\n📊 Total commits in branch: ${commits}`);
  } catch (e) {
    // Ignore error
  }
  
  // Summary
  console.log('\n' + '='.repeat(50));
  console.log('📝 Summary:');
  
  const hasIssues = !isClean || filesWithConflicts.length > 0 || unmergedFiles;
  
  if (hasIssues) {
    console.log('⚠️  Issues found - Review before merging');
    console.log('\n🛠️  Suggested actions:');
    if (!isClean) {
      console.log('   • Commit or stash uncommitted changes');
    }
    if (filesWithConflicts.length > 0) {
      console.log('   • Resolve conflict markers in files');
    }
    if (unmergedFiles) {
      console.log('   • Complete the merge or reset');
    }
    process.exit(1);
  } else {
    console.log('✅ Branch appears ready for merging');
    console.log('\n✨ Pre-merge checklist:');
    console.log('   • All tests passing');
    console.log('   • Code reviewed and approved');
    console.log('   • Documentation updated');
    console.log('   • CI/CD pipeline passing');
    process.exit(0);
  }
}

main();
