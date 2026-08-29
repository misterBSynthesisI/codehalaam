# CODEHALAAM Agent Documentation

## Overview

CODEHALAAM is a gamified, collaborative code hosting platform. This document describes the AI agent architecture and how automated agents interact with the platform.

## Agent Types

### 1. Review Bot
- **Purpose**: Automatically review pull requests for common issues
- **Triggers**: New PR opened, PR updated
- **Actions**:
  - Lint check (syntax errors, style violations)
  - Test coverage analysis
  - Security vulnerability scanning
  - Performance regression detection
- **XP Impact**: +25 XP for author when bot approves

### 2. Issue Triage Agent
- **Purpose**: Automatically categorize and assign issues
- **Triggers**: New issue created
- **Actions**:
  - Apply labels based on content analysis
  - Suggest assignees based on expertise
  - Link duplicate issues
  - Set priority based on severity

### 3. Streak Guardian
- **Purpose**: Maintain user engagement through streaks
- **Triggers**: Daily cron job
- **Actions**:
  - Check last active date
  - Update streak counter
  - Send reminder notifications
  - Award streak achievements

### 4. XP Engine
- **Purpose**: Award experience points for contributions
- **Triggers**: Various user actions
- **Actions**:
  - Commit: +10 XP
  - PR opened: +10 XP
  - PR merged: +50 XP
  - Issue closed: +15 XP
  - Code review: +25 XP
  - Star repo: +2 XP
  - Fork repo: +15 XP
  - Comment: +2 XP

## API Endpoints for Agents

```
POST   /api/agents/trigger          - Trigger agent action
GET    /api/agents/status           - Get agent health status
POST   /api/agents/review           - Submit automated review
POST   /api/agents/triage           - Triage an issue
```

## Authentication

Agents authenticate using API tokens:
```bash
Authorization: Bearer <agent-api-token>
```

## Event System

Agents subscribe to platform events via WebSocket:
```javascript
socket.on('pull_request.opened', (data) => { /* review PR */ })
socket.on('issue.created', (data) => { /* triage issue */ })
socket.on('commit.pushed', (data) => { /* check quality */ })
```

## Configuration

Agent configuration is stored in `.codehalaam/agents.yml`:
```yaml
agents:
  review-bot:
    enabled: true
    auto_approve: false
    required_checks:
      - lint
      - tests
      - security
  
  streak-guardian:
    enabled: true
    reminder_hours: 18
    timezone: UTC
```
