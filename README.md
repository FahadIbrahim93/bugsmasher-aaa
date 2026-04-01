# BugSmasher AAA

Enterprise-grade HTML5 bug-smashing game built with TypeScript, WebGL 2.0, and Vite.

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Open http://localhost:3000
```

## 🎮 About

BugSmasher AAA is a high-performance browser game where players smash bugs across increasingly challenging waves. Features include:

- **WebGL 2.0 Rendering** — Batched draw calls with custom shaders
- **Entity Component System** — Data-oriented architecture with object pooling
- **Web Audio API** — Spatial audio, crossfade music, sound pooling
- **Hierarchical State Machine** — Complex game flow management
- **Particle System** — Object-pooled particle effects

## 🛠 Tech Stack

| Technology | Purpose |
|-----------|---------|
| TypeScript | Core language (strict mode) |
| Vite | Build tool & dev server |
| WebGL 2.0 | Hardware-accelerated rendering |
| Web Audio API | Audio engine |
| Vitest | Testing framework |
| ESLint + Prettier | Code quality |
| GitHub Actions | CI/CD pipeline |

## 📁 Project Structure

```
src/
├── core/          # Engine fundamentals (ECS, Events, StateMachine, Camera)
├── entities/      # Entity factory functions
├── systems/       # ECS systems (Particles, Movement, Collision, etc.)
├── managers/      # Singletons (Assets, Save, Analytics)
├── renderers/     # WebGL rendering
├── audio/         # Web Audio API manager
├── input/         # Mouse/touch/keyboard input
├── config/        # Game balance & constants
├── types/         # TypeScript interfaces & enums
└── styles/        # CSS styling
```

## 📋 Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start dev server on port 3000 |
| `npm run build` | TypeScript compile + Vite build |
| `npm run build:prod` | Production build |
| `npm run typecheck` | Run TypeScript type checker |
| `npm run lint` | Run ESLint |
| `npm run format` | Format code with Prettier |
| `npm test` | Run tests |
| `npm run test:watch` | Run tests in watch mode |
| `npm run test:coverage` | Run tests with coverage |

## 🤖 AI Agent Development

This project uses `AGENTS.md` for AI coding agent guidelines. See [AGENTS.md](AGENTS.md) for:
- Coding standards and conventions
- File organization rules
- Git workflow requirements
- Architecture reference

## 📄 License

MIT
