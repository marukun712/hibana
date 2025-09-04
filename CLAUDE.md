# CLAUDE.md

必ず日本語で回答してください。

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

hibana is a decentralized social networking platform built on IPFS and OrbitDB. It enables distributed content aggregation while maintaining user data control and moderation capabilities.

## Development Setup

This project uses Nix for environment management and Task for command execution.

### Prerequisites
- Nix package manager
- IPFS daemon (install from https://ipfs-book.decentralized-web.jp/install_ipfs/)
- Node.js 22+ (managed via Nix)

### Initial Setup
1. Enter Nix shell: `nix-shell`
2. Install dependencies: `npm i`
3. Initialize IPFS: `ipfs init`
4. Ensure ports 4001 and 4002 are open for IPFS/OrbitDB communication

### Development Commands
- `task client` - Start frontend development server (runs `npm run dev`)
- `task server` - Start backend server with dependencies (logo, IPFS daemon, backend)
- `task backend` - Start backend only (`npm run dev` in backend directory)
- `task ipfs` - Start IPFS daemon
- `task logo` - Display hibana logo

### Build Commands
- `npm run build` - Build frontend
- `npm run start` - Start production frontend server

### Code Quality
- `oxlint` - Linting (configured in frontend)
- `prettier` - Code formatting

## Architecture

### Frontend (SolidJS)
- **Framework**: SolidJS with SolidStart
- **Styling**: Tailwind CSS with DaisyUI theme "hibana"
- **Routing**: File-based routing in `src/routes/`
- **State**: Component-level state with reactive primitives

Key directories:
- `src/components/` - Reusable UI components
- `src/routes/` - Page components
- `src/lib/api/` - API client utilities

### Backend (Hono + Node.js)
- **Framework**: Hono server running on Node.js
- **Database**: OrbitDB for distributed data, SQLite for local caching
- **Storage**: IPFS for content, Helia for JavaScript IPFS integration
- **Validation**: Zod schemas for type safety

Key directories:
- `backend/lib/` - Core business logic
- `backend/schema/` - Zod validation schemas
- `backend/db/` - Database operations

### Data Flow
1. **Events**: User actions create signed events stored in OrbitDB
2. **Documents**: Events reference IPFS content or other users
3. **Verification**: All content uses cryptographic signatures for authenticity
4. **Federation**: Users can run their own repository servers

### Core Concepts
- **Events**: Timestamped, signed user actions (posts, follows, pins)
- **Profiles**: User metadata stored on IPFS, referenced by events
- **Repository**: User's content storage server (can be self-hosted)
- **Target**: Events can reference other users, content, or events

## Testing

No specific test framework is configured. Check with the user before adding testing infrastructure.

## Important Notes
- All user data is cryptographically signed and verified
- IPFS content is immutable once published
- OrbitDB provides eventual consistency across distributed nodes
- Reset server state by deleting `repository/`, `helia/`, and `orbitdb/` directories
