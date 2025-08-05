# CLAUDE.md - AI Assistant Session Guidelines

## Purpose
This file serves as a reference for AI assistants working on the Visual Prompt Builder project. It contains important session guidelines, project context, and workflow instructions.

## Project Overview
**Visual Prompt Builder** - A drag-and-drop web application builder with AI prompt generation and desktop audio recording capabilities.

## Assistant Roles

### Manager Assistant
- Project coordination and task delegation
- Progress monitoring and blocker removal
- Team alignment and quality assurance
- Status: `/agent-sessions/assistants-current-status/ai-manager.md`

### Developer Assistant (includes Audio)
- Full-stack web development
- Desktop audio recording implementation
- Component library integration
- Drag-and-drop interface building
- Status: `/agent-sessions/assistants-current-status/ai-developer.md`

### Database Assistant
- Supabase/PostgreSQL management
- Schema design and optimization
- Security policies (RLS)
- Seed data execution
- Status: `/agent-sessions/assistants-current-status/ai-database.md`

### Audit Assistant
- Code quality monitoring
- Security vulnerability assessment
- Performance analysis
- Accessibility compliance
- Status: `/agent-sessions/assistants-current-status/ai-audit.md`

## Session Workflow

### At Session Start
1. Read your role's session prompt in `/docs/session-prompts/`
2. Check your current status file
3. Review recent changes in the project
4. Update your status file with current session plans

### During Session
1. Follow your role's responsibilities
2. Coordinate with other assistants as needed
3. Document significant decisions
4. Track progress on assigned tasks

### At Session End
1. Update your status file with:
   - Completed tasks
   - Work in progress
   - Blockers encountered
   - Next priorities
2. Add session notes if significant changes occurred

## Key Project Information

### Tech Stack
- **Frontend**: Next.js 14+, TypeScript, Shadcn/UI, Tailwind CSS
- **Backend**: Auth.js v5, Supabase, Next Safe Actions
- **Features**: @dnd-kit/core, Web Audio API, Google Gemini Pro 1.5

### Current Priorities (August 5, 2025)
1. Execute component library seed data
2. Implement component fetching service
3. Fix critical security issues (middleware protection)
4. Add keyboard navigation for accessibility
5. Build drag-and-drop interface

### Component Library
- 14 categories of web components
- 50+ pre-configured components
- 3 feature templates (SaaS, E-commerce, Social)
- Relationship system (requires, recommends, incompatible)

### Critical Issues
1. **SECURITY**: Missing middleware route protection
2. **ACCESSIBILITY**: No keyboard navigation for drag-drop
3. **AUTH**: Supabase adapter disabled in NextAuth

## File Organization

### Documentation
- `/docs/initial-prompts/` - Comprehensive role descriptions
- `/docs/session-prompts/` - Quick session references
- `/docs/` - Technical implementation guides

### Status Tracking
- `/agent-sessions/assistants-current-status/` - Current status files
- `/agent-sessions/agent-sessions_[date].md` - Daily session logs

### Database
- `/database/migrations/` - Schema migrations
- `/database/seeds/` - Seed data scripts
- `/database/types/` - TypeScript definitions

## Best Practices

1. **Always update status files** at session start and end
2. **Coordinate through status files** for async collaboration
3. **Document significant decisions** in session logs
4. **Follow existing code patterns** and conventions
5. **Prioritize security and accessibility** in all implementations

## Recent Updates (August 5, 2025)

### Completed
- Created comprehensive assistant prompts
- Designed component library (14 categories, 50+ components)
- Consolidated Audio role into Developer
- Prepared database seed data
- Created fetching implementation guide

### In Progress
- Component library seed data execution
- Component fetching service implementation
- Security issue remediation

### Next Steps
- Test component drag-and-drop
- Implement audio recording UI
- Address accessibility issues
- Optimize performance

---

*Last Updated: August 5, 2025*