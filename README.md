# TaskFlow

TaskFlow is a modern, modular project management and team collaboration platform. It is engineered to bridge high-level organizational structure with day-to-day task execution through a clear hierarchy:

$$\text{Workspaces} \longrightarrow \text{Teams} \longrightarrow \text{Projects} \longrightarrow \text{Tasks}$$

Whether you are coordinating cross-functional engineering sprints, organizing marketing campaigns, or managing client deliverables, TaskFlow provides strict tenant isolation, role-based access control, activity auditing, and real-time notifications.

---

## 🌟 Key Features

- **Multi-Tenant Workspaces**: Isolated environments with dedicated member rosters and role definitions (`OWNER`, `ADMIN`, `MEMBER`).
- **Flexible Team Structures**: Functional groups (`Backend`, `Frontend`, `DevOps`, `Design`) inside workspaces to keep project scope clean and focused.
- **Project Workspaces & Roadmaps**: Projects scoped to specific teams with configurable visibility (`TEAM` vs `PRIVATE`) and lifecycle states (`PLANNING`, `ACTIVE`, `COMPLETED`, `ARCHIVED`).
- **Granular Task Management**: Status pipelines (`TODO`, `IN_PROGRESS`, `IN_REVIEW`, `BLOCKED`, `COMPLETED`), priority tiers, due dates, assignee tracking, and rich comment threads.
- **Secure Member Invitations**: Tokenized workspace invitations with email validation, role pre-assignment, automatic expiry (72 hours), and acceptance workflows.
- **Live Activity Auditing**: Immutable audit trail tracking workspace creation, member onboarding, task state changes, and project milestones.
- **In-App Notifications**: Targeted alerts for invitations, task assignments, status changes, and team announcements.
- **User-Isolated Client State**: Strict React context sandboxing guaranteeing zero data leakage when switching accounts or signing out.

---

## 🏛️ System Architecture

TaskFlow is structured as a full-stack monorepo separating API services from the interactive single-page application:

```
task-flow/
├── client/          # Single Page Application (React 19 + Vite 6 + SCSS)
├── server/          # RESTful API Backend (Express 5 + MySQL 8 + Redis)
├── database/        # Relational database schemas and seed definitions
└── docs/            # Architecture specifications, API contracts & Postman collections
```

### Technology Stack

| Layer | Technologies & Libraries |
| :--- | :--- |
| **Frontend** | React 19, Vite 6, React Router 7, SCSS Modules, Lucide Icons, Axios, React Hot Toast |
| **Backend** | Node.js (ESM), Express 5, MySQL2 (Connection Pool), bcrypt, jsonwebtoken |
| **Storage & Cache** | MySQL 8 (InnoDB with foreign key cascades), Redis (optional caching) |
| **Integrations** | Gmail API (email notifications), ImageKit (avatar and asset uploads) |
| **Testing & Tooling** | Jest, Supertest, Prettier, ESLint |

---

## 📂 Domain Hierarchy

TaskFlow avoids clutter by strictly scoping resources within their natural organizational parents:

```text
Workspace (e.g., TechNova)
├── Members (Owner, Admins, Members)
├── Invitations (Pending tokenized invites)
└── Teams
    ├── Backend Team
    │   ├── Team Members & Leads
    │   └── Projects
    │       ├── Auth Service
    │       │   └── Tasks (TODO -> In Review -> Completed)
    │       │       ├── Assignee
    │       │       ├── Activity Log
    │       │       └── Comments
    │       └── Payment Gateway
    └── Frontend Team
        └── Projects
            └── Web App Client
```

---

## 🚀 Quick Start Guide

### 1. Prerequisites

Make sure you have the following installed on your machine:
- **Node.js**: `v20.x` or higher
- **npm**: `v10.x` or higher
- **MySQL Server**: `v8.0` or higher (running locally or in Docker)
- **Redis Server** *(optional)*: for caching sessions and fast query invalidation

### 2. Database Setup

1. Start your MySQL instance and create a database named `taskflow`:
   ```sql
   CREATE DATABASE taskflow CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci;
   ```

2. Configure server credentials in `server/.env` (see `server/.env.example`).

3. Apply the database schema from the repository root:
   ```bash
   npm run db:reset
   ```

### 3. Server Configuration & Startup

```bash
cd server
npm install
npm run dev
```

The backend API will start at: `http://localhost:3000` (Healthcheck endpoint: `http://localhost:3000/api/health`).

### 4. Client Startup

In a separate terminal:

```bash
cd client
npm install
npm run dev
```

Open your browser at `http://localhost:5173` to access TaskFlow.

---

## 🛠️ Available Scripts

### Root Directory

| Script | Command | Purpose |
| :--- | :--- | :--- |
| `npm run db:reset` | `npm --prefix server run db:reset` | Resets and applies clean database schema |
| `npm run test` | `npm --prefix server run test` | Runs complete Jest API test suite |
| `npm run test:api:docs` | `npm --prefix server run test:api:docs` | Executes tests and regenerates markdown API documentation |
| `npm run generate:postman` | `npm --prefix server run generate:postman` | Exports Postman collection from current test traces |
| `npm run format` | `prettier . --write` | Formats all code with Prettier |

### Server Directory (`cd server`)

- `npm run dev`: Runs server with nodemon auto-reload.
- `npm start`: Runs server in production mode.
- `npm run test`: Runs all module integration tests sequentially.
- `npm run db:reset`: Executes `scripts/reset-db.js` against `database/schema.sql`.

### Client Directory (`cd client`)

- `npm run dev`: Starts local Vite development server.
- `npm run build`: Compiles production build into `dist/`.
- `npm run preview`: Locally previews production build.
- `npm run lint`: Runs ESLint analysis on source files.

---

## 🔒 Security & Data Isolation

1. **Authentication**: JWT-based stateless tokens verified via Express middleware, stored securely in client storage with automatic expiration handling.
2. **Context Sandboxing**: Client-side React context providers are dynamically keyed by logged-in user ID (`key={userId}`). Logging out or switching accounts instantly unmounts and purges prior tenant state from memory.
3. **Authorization Matrix**: Workspace owners and admins control membership, teams, and invites; individual project leads control project-specific assignments.
4. **Token Hashing**: Invitation and verification tokens are salted and hashed with SHA-256 prior to database persistence; raw tokens are never readable from database dumps.

---

## 📚 Documentation & Reference

- **[Server Documentation](file:///d:/Projects/task-flow/server/README.md)**: Deep dive into API endpoints, database queries, and middleware.
- **[Database Schema](file:///d:/Projects/task-flow/database/schema.sql)**: Complete relational table definitions, foreign keys, and indexes.
- **[API Specs & Contracts](file:///d:/Projects/task-flow/docs/api-docs/)**: Detailed endpoint payloads, query parameters, and example responses.
