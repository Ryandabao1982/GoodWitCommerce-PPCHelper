# Agent Specification Template

This template defines the standard structure for all agent specifications in this repository. Each agent spec documents an AI agent's responsibilities, capabilities, and operational guidelines.

## Required Fields

All agent specifications MUST include the following sections:

---

## Agent Name

**Role**: [Brief one-line description of the agent's role]

---

## Overview

[2-3 paragraph description of what this agent does, its primary purpose, and how it fits into the overall system]

---

## Responsibilities

### Primary Responsibilities

- [Responsibility 1]
- [Responsibility 2]
- [Responsibility 3]

### Secondary Responsibilities

- [Optional additional responsibility 1]
- [Optional additional responsibility 2]

---

## Capabilities

### Core Capabilities

- **[Capability Name]**: [Description of what the agent can do]
- **[Capability Name]**: [Description of what the agent can do]
- **[Capability Name]**: [Description of what the agent can do]

### Technical Skills

- [Skill 1: e.g., React/TypeScript development]
- [Skill 2: e.g., API integration]
- [Skill 3: e.g., Testing frameworks]

---

## Triggers & Activation

**When to activate this agent:**

1. [Trigger scenario 1]
2. [Trigger scenario 2]
3. [Trigger scenario 3]

**Example activation patterns:**

```
User: [Example user request that would trigger this agent]
System: [How the system would activate this agent]
```

---

## Operational Guidelines

### Decision Framework

- [Guideline 1 for how the agent makes decisions]
- [Guideline 2 for priorities]
- [Guideline 3 for handling conflicts]

### Quality Standards

- [Quality requirement 1]
- [Quality requirement 2]
- [Quality requirement 3]

### Constraints

- **Must not**: [What the agent should never do]
- **Must always**: [What the agent must always do]
- **Should prefer**: [What the agent should prefer when given choices]

---

## Telemetry & Monitoring

### Events to Track

- `agent.[agent-name].activated` - When the agent is activated
- `agent.[agent-name].task.started` - When agent begins a task
- `agent.[agent-name].task.completed` - When agent completes a task
- `agent.[agent-name].task.failed` - When agent fails a task
- `agent.[agent-name].[custom-event]` - Any custom events

### Metrics to Monitor

- **Success Rate**: Percentage of tasks completed successfully
- **Response Time**: Average time to complete tasks
- **Error Rate**: Percentage of tasks that fail
- **[Custom Metric]**: [Description]

### Monitoring Dashboard

- Dashboard: [Link to monitoring dashboard or "TBD"]
- Alert Threshold: [When to alert on-call, or "TBD"]

---

## Safety & Security

### Safety Considerations

- [Safety consideration 1]
- [Safety consideration 2]
- [Safety consideration 3]

### Security Requirements

- [Security requirement 1]
- [Security requirement 2]
- [Security requirement 3]

### Failure Handling

- **Fallback Strategy**: [What happens when the agent fails]
- **Escalation Path**: [Who/what to escalate to when agent cannot complete task]

---

## Integration Points

### Dependencies

- [System/Service 1 that this agent depends on]
- [System/Service 2 that this agent depends on]

### Interactions with Other Agents

- **[Agent Name]**: [How this agent interacts with another agent]
- **[Agent Name]**: [How this agent interacts with another agent]

---

## Runbooks & Documentation

### Runbook Links

- [Operational Runbook]: [Link to runbook or "TBD"]
- [Troubleshooting Guide]: [Link to guide or "TBD"]
- [Common Issues]: [Link to documentation or "TBD"]

### Related Documentation

- [Architecture Doc]: [Link to relevant architecture documentation]
- [API Documentation]: [Link if applicable]

---

## Ownership & Maintenance

- **Owner**: [Team or individual responsible for this agent]
- **Backup Owner**: [Backup contact]
- **Last Updated**: [YYYY-MM-DD]
- **Review Frequency**: [How often to review this spec, e.g., "Quarterly"]

---

## Change Log

### [Version] - [YYYY-MM-DD]

- [Change description]

### [Version] - [YYYY-MM-DD]

- Initial specification created

---

## Notes

[Any additional notes, considerations, or context that doesn't fit in other sections]
