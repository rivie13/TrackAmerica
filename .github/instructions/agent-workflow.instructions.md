---
description: Agent workflow rules for focused, incremental code changes
applyTo: "**"
---

# Agent Workflow Rules

These rules define how the AI coding agent should behave when creating or editing code files.

## Core Principles

### 1. Focus on One Feature at a Time
- Implement exactly one feature, fix, or change per session unless explicitly asked for multiple
- Do not expand scope beyond what the user requested
- Resist the urge to add "nice to have" features or improvements that weren't asked for
- If you notice related improvements, mention them but DO NOT implement them unless asked

### 2. Stick to Requirements Only
- Implement only what the user explicitly requested
- Do not add extra functionality, utilities, or "helpful" additions
- Do not refactor code that isn't part of the current task
- Keep changes minimal and targeted to the specific requirement

### 3. Ask for Clarification When Needed
- If the request is ambiguous or could be interpreted multiple ways, STOP and ask the user
- If the request seems to involve multiple features, ask: "Should I implement all of these in one go, or would you like me to tackle them one at a time?"
- If documentation (IMPLEMENTATION_PLAN.md, TECH_STACK.md) doesn't cover the requested feature clearly enough, ask before proceeding
- If you're unsure about file structure, naming conventions, or implementation approach, ask first

### 4. Prefer Small, Incremental Changes
- Make the smallest possible change that fulfills the requirement
- Break large tasks into smaller steps and complete them one at a time
- Each change should be easy to review, test, and understand
- If a task naturally splits into multiple steps, do one step and pause for confirmation

### 5. Confirm Scope for Multi-Part Requests
- If the user asks for multiple things in one prompt (e.g., "add X and Y and Z"), ask:
  - "Should I implement all three features now, or would you prefer one at a time?"
  - "In what order would you like these implemented?"
  - "Do you want me to pause after each for testing/review?"

### 6. Avoid Over-Engineering
- Use simple, straightforward solutions
- Don't add abstraction layers, design patterns, or architecture unless required
- Don't create utility functions for one-time use
- Remember: KISS (Keep It Simple, Stupid) is the project philosophy

### 7. Stay Within Project Conventions
- Follow patterns already established in IMPLEMENTATION_PLAN.md and TECH_STACK.md
- Don't introduce new technologies, libraries, or approaches unless explicitly requested
- Match the coding style and structure of existing code
- TypeScript, small components, console logging for debugging (as per project conventions)

## Anti-Patterns to Avoid

❌ **DON'T** add features that "might be useful later"  
❌ **DON'T** refactor unrelated code while implementing a feature  
❌ **DON'T** create elaborate solutions when simple ones work  
❌ **DON'T** implement multiple features without confirming the user wants them all now  
❌ **DON'T** assume you understand vague requirements—ask first  
❌ **DON'T** go beyond the scope of what was asked  

## When to Ask Questions

Always ask when:
- The request is vague or could mean multiple things
- Multiple features/changes are requested in one prompt
- You need to make assumptions about implementation details
- The approach isn't clearly documented in IMPLEMENTATION_PLAN.md or TECH_STACK.md
- You're about to add something that wasn't explicitly requested

## Example Good Behavior

**User:** "Add a loading spinner to the representatives page"  
**Agent:** ✅ Adds only a loading spinner to that specific page, nothing more

**User:** "Add loading spinners and error messages to all pages"  
**Agent:** ✅ Asks: "Should I add both loading spinners and error messages to all pages at once, or would you prefer to tackle these one at a time? If all at once, should I do it page-by-page or all pages simultaneously?"

**User:** "Make the map look better"  
**Agent:** ✅ Asks: "Could you clarify what improvements you'd like? For example: colors, hover effects, state borders, labels, or something else?"

## Remember

**Smaller is better.** When in doubt, do less and ask for the next step.
