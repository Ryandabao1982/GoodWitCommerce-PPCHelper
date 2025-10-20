# Agent Specifications

This directory contains specifications for AI agents that work on the Amazon PPC Keyword Genius project. Each agent has defined responsibilities, capabilities, and operational guidelines.

## Purpose

Agent specifications provide:

- **Clear Responsibilities**: What each agent is responsible for
- **Activation Triggers**: When to use each agent
- **Quality Standards**: Expected quality levels and constraints
- **Telemetry**: Events and metrics to track
- **Safety Guidelines**: Security and safety considerations
- **Integration Points**: How agents interact with each other and external systems

## Available Agents

### Development Agents

- **[frontend-assistant](./frontend-assistant.md)** - React/TypeScript development specialist
- **[backend-decision-agent](./backend-decision-agent.md)** - Backend architecture and API integration specialist
- **[uiux-content-agent](./uiux-content-agent.md)** - User experience design and content strategy specialist

### Operations Agents

- **[systems-manager](./systems-manager.md)** - Infrastructure, build tooling, and development environment specialist
- **[ops-manager](./ops-manager.md)** - Production deployment, monitoring, and operational excellence specialist

### Quality Agents

- **[qa-agent](./qa-agent.md)** - Quality assurance, testing, and validation specialist
- **[security-guard](./security-guard.md)** - Security, privacy, and compliance specialist

## Creating New Agent Specs

When creating a new agent specification:

1. Copy `TEMPLATE.md` to a new file with a descriptive name (e.g., `my-agent.md`)
2. Fill in all required sections following the template structure
3. Ensure all required fields are present (see validation requirements below)
4. Run the validation script to verify compliance: `python3 scripts/validate_agent_specs.py`
5. Submit a pull request with your new specification

## Validation

All agent specifications are automatically validated on push and PR via GitHub Actions. The validation script checks for:

### Required Sections

- Agent Name
- Overview
- Responsibilities
- Capabilities
- Triggers & Activation
- Operational Guidelines
- Telemetry & Monitoring
- Safety & Security
- Integration Points
- Runbooks & Documentation
- Ownership & Maintenance
- Change Log

### Required Subsections

**Responsibilities:**

- Primary Responsibilities
- Secondary Responsibilities

**Capabilities:**

- Core Capabilities
- Technical Skills

**Operational Guidelines:**

- Decision Framework
- Quality Standards
- Constraints

**Telemetry & Monitoring:**

- Events to Track
- Metrics to Monitor
- Monitoring Dashboard

**Safety & Security:**

- Safety Considerations
- Security Requirements
- Failure Handling

**Integration Points:**

- Dependencies
- Interactions with Other Agents

**Runbooks & Documentation:**

- Runbook Links
- Related Documentation

### Required Fields

**Ownership & Maintenance:**

- Owner
- Backup Owner
- Last Updated
- Review Frequency

**Agent Name:**

- Role (brief description at the top)

### Telemetry Naming Convention

Telemetry events should follow the pattern: `agent.[agent-name].[event-type]`

Example for `frontend-assistant.md`:

- ✅ `agent.frontend-assistant.activated`
- ✅ `agent.frontend-assistant.component.created`
- ❌ `agent.frontend.activated` (missing -assistant)

## Running Validation Locally

Before committing changes, run the validation script:

```bash
python3 scripts/validate_agent_specs.py
```

Expected output for passing validation:

```
Agent Specification Validator
======================================================================
Repository root: /path/to/repo
Agents directory: /path/to/repo/docs/agents

🔍 Validating X agent specification(s)...

📄 Validating agent-name.md...

======================================================================
✅ All agent specifications passed validation!
======================================================================
```

## Maintenance

### Review Frequency

Agent specifications should be reviewed according to their defined review frequency (typically quarterly or monthly). During review:

1. Update responsibilities if they have changed
2. Add new capabilities as they are developed
3. Update telemetry events and metrics
4. Refresh runbook and documentation links
5. Update the Last Updated field
6. Add a new entry to the Change Log

### Updating Specifications

When updating an agent specification:

1. Make your changes following the template structure
2. Update the "Last Updated" field in Ownership & Maintenance
3. Add an entry to the Change Log describing your changes
4. Run validation locally: `python3 scripts/validate_agent_specs.py`
5. Submit a pull request with your changes

### Deprecating Agents

If an agent is no longer needed:

1. Add a deprecation notice at the top of the specification
2. Update the status in this README
3. Keep the file for historical reference
4. Don't delete the file immediately - mark as deprecated for one release cycle

## Benefits of Agent Specifications

### For Developers

- Understand which agent to activate for specific tasks
- Know what each agent can and cannot do
- Follow established patterns and constraints

### For Reviewers

- Verify that agents are being used correctly
- Ensure responsibilities are properly distributed
- Identify gaps in coverage or overlapping responsibilities

### For Operations

- Monitor agent usage through telemetry
- Track agent performance metrics
- Identify agents that need improvement

### For Security

- Understand security boundaries for each agent
- Verify safety considerations are addressed
- Track security-relevant telemetry

## CI/CD Integration

The validation workflow runs automatically on:

- Pushes to `main` or `develop` branches
- Pull requests targeting `main` or `develop` branches
- Changes to files in `docs/agents/`
- Changes to `scripts/validate_agent_specs.py`
- Changes to `.github/workflows/validate-agent-specs.yml`

The workflow will:

1. Checkout the code
2. Setup Python 3.11
3. Run the validation script
4. Report any validation errors

Pull requests with validation failures will not be mergeable until errors are resolved.

## Additional Resources

- [TEMPLATE.md](./TEMPLATE.md) - Template for creating new agent specifications
- [Validation Script](../../scripts/validate_agent_specs.py) - Script for validating specifications
- [CI Workflow](../../.github/workflows/validate-agent-specs.yml) - GitHub Actions workflow

## Questions or Issues?

If you have questions about agent specifications or encounter issues with validation:

1. Review the template and existing specifications for examples
2. Check the validation script output for specific error messages
3. Open an issue with the `documentation` label
4. Tag the documentation owner for assistance
