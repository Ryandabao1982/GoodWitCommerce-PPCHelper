#!/usr/bin/env python3
"""
Agent Specification Validator

This script validates that all agent specification files in docs/agents/
contain the required sections and fields as defined in the template.

Usage:
    python scripts/validate_agent_specs.py

Exit codes:
    0 - All validations passed
    1 - Validation failures found
"""

import os
import sys
import re
from pathlib import Path
from typing import List, Tuple, Dict

# Required sections that must be present in every agent spec
REQUIRED_SECTIONS = [
    "Agent Name",
    "Overview",
    "Responsibilities",
    "Capabilities",
    "Triggers & Activation",
    "Operational Guidelines",
    "Telemetry & Monitoring",
    "Safety & Security",
    "Integration Points",
    "Runbooks & Documentation",
    "Ownership & Maintenance",
    "Change Log",
]

# Required subsections within specific sections
REQUIRED_SUBSECTIONS = {
    "Responsibilities": ["Primary Responsibilities", "Secondary Responsibilities"],
    "Capabilities": ["Core Capabilities", "Technical Skills"],
    "Operational Guidelines": ["Decision Framework", "Quality Standards", "Constraints"],
    "Telemetry & Monitoring": ["Events to Track", "Metrics to Monitor", "Monitoring Dashboard"],
    "Safety & Security": ["Safety Considerations", "Security Requirements", "Failure Handling"],
    "Integration Points": ["Dependencies", "Interactions with Other Agents"],
    "Runbooks & Documentation": ["Runbook Links", "Related Documentation"],
    "Ownership & Maintenance": [],
}

# Required fields in Ownership & Maintenance
REQUIRED_OWNERSHIP_FIELDS = ["Owner", "Backup Owner", "Last Updated", "Review Frequency"]


class ValidationError:
    """Represents a validation error"""
    def __init__(self, filename: str, error_type: str, details: str):
        self.filename = filename
        self.error_type = error_type
        self.details = details

    def __str__(self):
        return f"❌ {self.filename}: [{self.error_type}] {self.details}"


class AgentSpecValidator:
    """Validates agent specification files"""

    def __init__(self, agents_dir: Path):
        self.agents_dir = agents_dir
        self.errors: List[ValidationError] = []

    def validate_all(self) -> bool:
        """Validate all agent spec files in the directory"""
        if not self.agents_dir.exists():
            print(f"❌ Error: Directory {self.agents_dir} does not exist")
            return False

        # Get all markdown files except TEMPLATE.md
        agent_files = [
            f for f in self.agents_dir.glob("*.md")
            if f.name != "TEMPLATE.md" and f.name != "README.md"
        ]

        if not agent_files:
            print(f"⚠️  Warning: No agent specification files found in {self.agents_dir}")
            return True

        print(f"🔍 Validating {len(agent_files)} agent specification(s)...\n")

        for agent_file in sorted(agent_files):
            self.validate_file(agent_file)

        return len(self.errors) == 0

    def validate_file(self, filepath: Path) -> None:
        """Validate a single agent specification file"""
        print(f"📄 Validating {filepath.name}...")

        try:
            content = filepath.read_text(encoding='utf-8')
        except Exception as e:
            self.errors.append(
                ValidationError(filepath.name, "READ_ERROR", f"Failed to read file: {e}")
            )
            return

        # Extract all section headers (lines starting with ##)
        sections = self._extract_sections(content)

        # Check for required sections
        self._check_required_sections(filepath.name, sections)

        # Check for required subsections
        self._check_required_subsections(filepath.name, content, sections)

        # Check ownership fields
        self._check_ownership_fields(filepath.name, content)

        # Check for role field at the top
        self._check_role_field(filepath.name, content)

        # Check telemetry events follow naming convention
        self._check_telemetry_events(filepath.name, content)

    def _extract_sections(self, content: str) -> Dict[str, str]:
        """Extract all sections from the markdown content"""
        sections = {}
        current_section = None
        current_content = []

        for line in content.split('\n'):
            # Check for section headers (## Header)
            match = re.match(r'^##\s+(.+)$', line)
            if match:
                # Save previous section
                if current_section:
                    sections[current_section] = '\n'.join(current_content)
                # Start new section
                current_section = match.group(1).strip()
                current_content = []
            elif current_section:
                current_content.append(line)

        # Save last section
        if current_section:
            sections[current_section] = '\n'.join(current_content)

        return sections

    def _check_required_sections(self, filename: str, sections: Dict[str, str]) -> None:
        """Check if all required sections are present"""
        for required_section in REQUIRED_SECTIONS:
            if required_section not in sections:
                self.errors.append(
                    ValidationError(
                        filename,
                        "MISSING_SECTION",
                        f"Required section '## {required_section}' not found"
                    )
                )

    def _check_required_subsections(
        self, filename: str, content: str, sections: Dict[str, str]
    ) -> None:
        """Check if required subsections are present within sections"""
        for section, required_subsections in REQUIRED_SUBSECTIONS.items():
            if section not in sections:
                continue  # Already reported as missing section

            section_content = sections[section]
            for subsection in required_subsections:
                # Check for subsection header (### Subsection)
                if f"### {subsection}" not in section_content:
                    self.errors.append(
                        ValidationError(
                            filename,
                            "MISSING_SUBSECTION",
                            f"Required subsection '### {subsection}' not found in '## {section}'"
                        )
                    )

    def _check_ownership_fields(self, filename: str, content: str) -> None:
        """Check if required ownership fields are present"""
        # Find the Ownership & Maintenance section
        ownership_match = re.search(
            r'## Ownership & Maintenance\s+(.+?)(?=\n##|\Z)',
            content,
            re.DOTALL
        )

        if not ownership_match:
            return  # Already reported as missing section

        ownership_content = ownership_match.group(1)

        for field in REQUIRED_OWNERSHIP_FIELDS:
            # Look for field in format "- **Field**: value" or "**Field**: value"
            field_pattern = f"\\*\\*{re.escape(field)}\\*\\*:"
            if not re.search(field_pattern, ownership_content):
                self.errors.append(
                    ValidationError(
                        filename,
                        "MISSING_FIELD",
                        f"Required field '**{field}:**' not found in Ownership & Maintenance"
                    )
                )

    def _check_role_field(self, filename: str, content: str) -> None:
        """Check if **Role**: field is present near the top"""
        # Look for Role field in first 500 characters
        if not re.search(r'\*\*Role\*\*:', content[:500]):
            self.errors.append(
                ValidationError(
                    filename,
                    "MISSING_FIELD",
                    "Required field '**Role:**' not found near the top of the file"
                )
            )

    def _check_telemetry_events(self, filename: str, content: str) -> None:
        """Check that telemetry events follow naming convention"""
        # Find Events to Track section
        events_match = re.search(
            r'### Events to Track\s+(.+?)(?=\n###|\n##|\Z)',
            content,
            re.DOTALL
        )

        if not events_match:
            return  # Subsection validation will catch this

        events_content = events_match.group(1)

        # Extract agent name from filename (e.g., frontend-assistant.md -> frontend-assistant)
        agent_name = Path(filename).stem

        # Look for event patterns like `agent.NAME.event`
        event_pattern = r'`agent\.([a-z-]+)\.'
        events = re.findall(event_pattern, events_content)

        if events:
            # Check if at least some events use the correct agent name
            correct_events = [e for e in events if e == agent_name]
            if not correct_events:
                self.errors.append(
                    ValidationError(
                        filename,
                        "TELEMETRY_NAMING",
                        f"Telemetry events should follow pattern `agent.{agent_name}.*`"
                    )
                )

    def print_summary(self) -> None:
        """Print validation summary"""
        print()
        if self.errors:
            print("=" * 70)
            print("VALIDATION FAILURES")
            print("=" * 70)
            for error in self.errors:
                print(error)
            print()
            print(f"❌ Validation failed with {len(self.errors)} error(s)")
        else:
            print("=" * 70)
            print("✅ All agent specifications passed validation!")
            print("=" * 70)


def main():
    """Main entry point"""
    # Determine the repository root (parent of scripts/)
    script_dir = Path(__file__).parent
    repo_root = script_dir.parent
    agents_dir = repo_root / "docs" / "agents"

    print("Agent Specification Validator")
    print("=" * 70)
    print(f"Repository root: {repo_root}")
    print(f"Agents directory: {agents_dir}")
    print()

    validator = AgentSpecValidator(agents_dir)
    success = validator.validate_all()
    validator.print_summary()

    sys.exit(0 if success else 1)


if __name__ == "__main__":
    main()
