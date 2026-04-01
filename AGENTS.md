# BugSmasher AAA — Agent Guidelines

> **Universal context file for AI coding agents.** All agents must read this before making changes.

## Project Overview
Enterprise-grade HTML5 bug-smashing game built with TypeScript + WebGL 2.0 + Vite.
Architecture: Data-oriented Entity Component System (ECS) with event-driven communication.

## Commands
| Task | Command |
|------|---------|
| Dev server | `npm run dev` |
| Build | `npm run build` |
| Production build | `npm run build:prod` |
| Type check | `npm run typecheck` |
| Lint | `npm run lint` |
| Format | `npm run format` |
| Test | `npm test` |
| Test (watch) | `npm run test:watch` |
| Test (coverage) | `npm run test:coverage` |

## Architecture
- **ECS World** — `src/core/ECS.ts` — Data-oriented entity/component/system management
- **Event System** — `src/core/EventManager.ts` — Priority pub/sub with queue processing
- **State Machine** — `src/core/StateMachine.ts` — Hierarchical FSM with push/pop
- **Game Loop** — `src/core/Game.ts` — Fixed-timestep with interpolated rendering
- **Singletons** — Audio, Input, Assets, Save, Analytics (use `.getInstance()`)

## Coding Standards
- TypeScript **strict mode** — no `any` without justification comment
- Use **path aliases**: `@core/`, `@input/`, `@audio/`, `@managers/`, `@renderers/`, `@systems/`, `@config/`, `@typedefs/`, `@entities/`
- **Named exports only** — no default exports
- **Singleton pattern** for managers (`.getInstance()`)
- Events use **`namespace:action`** naming (e.g., `game:started`, `input:click`, `entity:created`)
- Components must implement `Component` interface from `@types/index`

## File Organization
| Directory | Purpose | Pattern |
|-----------|---------|---------|
| `src/core/` | Engine fundamentals | ECS, events, state machine, camera, game loop |
| `src/entities/` | Entity factory functions | One file per entity type |
| `src/systems/` | ECS systems | One file per system, implements `System` interface |
| `src/managers/` | Resource singletons | Singleton pattern, global exports |
| `src/renderers/` | WebGL rendering | Shader + batch management |
| `src/audio/` | Sound management | Web Audio API |
| `src/input/` | Input handling | Mouse/touch/keyboard unified |
| `src/config/` | Game balance & constants | Pure data, no logic |
| `src/types/` | TypeScript interfaces/enums | Shared across all modules |
| `tests/unit/` | Unit tests | One test file per module |
| `tests/integration/` | Integration tests | Cross-system interaction tests |

## Critical Boundaries
- **NEVER** modify `src/types/index.ts` without updating ALL consuming files
- **NEVER** bypass EventManager for cross-system communication
- **NEVER** create entities outside the ECS World
- **NEVER** commit `node_modules/`, `dist/`, or `.env` files
- **NEVER** use `var` — always `const` or `let`
- **NEVER** leave `console.log` in production code (use `console.warn`/`console.error` only)

## Git Workflow
- **Branch from `main`**: `feat/<feature>`, `fix/<bug>`, `refactor/<scope>`, `test/<scope>`, `chore/<scope>`
- **Conventional Commits**: `feat(ecs): add collision system`
- **PR required** — fill out `.github/PULL_REQUEST_TEMPLATE.md`
- **CI must pass** before merge (lint + typecheck + test + build)
- **One feature/fix per PR** — keep PRs focused and reviewable

## Testing Requirements
- All new systems must have unit tests in `tests/unit/`
- Integration tests go in `tests/integration/`
- Run `npm run typecheck` and `npm test` before any commit
- Target >80% coverage on new code

## Performance Guidelines
- Use **object pooling** for frequently created/destroyed objects (particles, components)
- Minimize garbage collection — avoid allocating in update loops
- Use the **query cache** in ECS — `world.query()` caches results
- Keep draw calls under 100 per frame via batching
- Profile with `performance.now()` for hot paths
