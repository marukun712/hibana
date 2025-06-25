# CLAUDE.md

必ず日本語で回答してください。

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Architecture

This is a decentralized SNS (Social Network Service) built on IPFS and OrbitDB, using SolidJS for the frontend and Hono for the backend API. The architecture consists of:

- **Frontend**: SolidJS with TailwindCSS/DaisyUI, built with Vinxi/SolidStart
- **Backend**: Hono API server with SQLite database and OrbitDB for decentralized data
- **Blockchain Integration**: NIP-07 support for Nostr protocol cryptographic signatures
- **Storage**: IPFS for content storage, OrbitDB for decentralized database replication

### Key Components

- **Event System**: Central to the application - all user actions (posts, follows, pins) are events with cryptographic signatures
- **Profile Management**: User profiles stored in OrbitDB with public key authentication
- **Feed Generation**: Dynamic feeds created from event queries
- **Cryptographic Security**: All events are signed using secp256k1 cryptography

### Directory Structure

- `src/`: Frontend SolidJS application
  - `routes/`: File-based routing (index, post, signup, user, users)
  - `components/`: Reusable UI components organized by feature
  - `lib/api/`: Frontend API client using Hono RPC client
- `backend/`: Backend API server
  - `lib/`: Core business logic (events, users, feed generation)
  - `schema/`: Database schemas and validation (Drizzle ORM + Zod)
- `utils/`: Shared cryptographic utilities

## Development Commands

### Frontend Development

```bash
# Install dependencies
bun i

# Start development server
bun run dev

# Build for production
bun run build

# Start production server
bun run start
```

### Backend Development

```bash
# Navigate to backend directory
cd backend

# Start backend server (requires IPFS)
node index.ts
```

### Prerequisites

- Node.js >= 22
- IPFS daemon running (ports 4001 and 4002 must be open)
- Initialize IPFS: `ipfs init`

## Key Technical Details

### Event-Driven Architecture

All user interactions create signed events stored in OrbitDB:

- `event.post`: Text posts
- `event.follow`: Following users
- `event.pin`: Pinning/liking posts

### API Endpoints

- `GET /feed`: Get event feed with optional filters (publickey, event type, target)
- `POST /event`: Submit new signed events
- `GET /profile`: Get user profile by public key
- `POST /profile`: Update user profile

### Cryptographic Flow

1. Events are created with timestamp and content
2. Signed using secp256k1 private key (via NIP-07 or native crypto)
3. Stored in OrbitDB for decentralized replication
4. Retrieved via backend API for feed generation

### Database Schema

Uses Drizzle ORM with SQLite for local caching and OrbitDB for decentralized storage. Key tables include events with id, publickey, signature, event type, timestamp, and JSON message content.
