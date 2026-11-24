# TaskFlow Server

The TaskFlow Server is a RESTful API backend engineered with **Node.js (ESM)** and **Express 5**, backed by **MySQL 8** connection pooling and optional **Redis** caching. It serves as the single source of truth for workspaces, teams, projects, tasks, comments, invitations, notifications, and audit logging.

---

## 🏗️ Architecture & Design Principles

The backend follows a clean, decoupled layered architecture:

```
Request (HTTP)
   │
   ▼
[ CORS & Body Parsing ]
   │
   ▼
[ Authenticate Middleware ] ──► (JWT Verification & User Context injection into req.user)
   │
   ▼
[ Module Router ]            ──► (e.g., /api/workspaces, /api/tasks)
   │
   ▼
[ Controller ]               ──► (Validates input, coordinates services & transactions)
   │
   ▼
[ Query Layer ]              ──► (Parameterized SQL queries using mysql2 connection pool)
   │
   ▼
[ MySQL 8 Database ]
```

### Key Architectural Pillars
- **Transactional Consistency**: Multi-table state transitions (e.g. workspace creation with owner membership, invitation acceptance with member joins) use explicit database transactions (`conn.beginTransaction()`, `conn.commit()`, `conn.rollback()`).
- **Cryptographic Security**: Sensitive tokens (invitations, email verifications) are generated cryptographically and stored exclusively as SHA-256 hashes (`token_hash`), preventing token exposure in the database.
- **Audit Trails**: Core domain events trigger automatic writes to `activity_logs` with actor attribution, event timestamps, and JSON metadata.

---

## 📁 Directory Structure

```
server/
├── scripts/
│   ├── reset-db.js             # Automated schema runner for database/schema.sql
│   └── generate-postman.js     # Postman collection generator from test traces
├── src/
│   ├── config/
│   │   ├── db.js               # mysql2 connection pool and query helpers
│   │   ├── cache.config.js     # Redis client configuration and retry policies
│   │   └── env.config.js       # Centralized environment variable loader and validator
│   ├── core/
│   │   ├── middleware/
│   │   │   ├── authenticate.js # JWT bearer token verification
│   │   │   ├── errorHandler.js # Centralized HTTP error handler
│   │   │   └── validate.js     # Request validation pipeline
│   │   └── utils/
│   │       ├── password.js     # bcrypt hashing and comparison
│   │       └── token.js        # JWT generation and crypto token hashing
│   ├── modules/                # Feature-scoped vertical slices
│   │   ├── activity/           # Workspace audit trail
│   │   ├── auth/               # Signup, signin, OTP, profile & password
│   │   ├── comment/            # Task comments
│   │   ├── dashboard/          # Aggregated workspace and workload statistics
│   │   ├── invitation/         # Workspace invites, acceptance, decline & cancel
│   │   ├── notification/       # In-app notification queue
│   │   ├── project/            # Team-scoped projects and memberships
│   │   ├── task/               # Project-scoped tasks and lifecycle
│   │   ├── team/               # Workspace functional groups
│   │   └── workspace/          # Tenant root and role-based access
│   ├── queries/                # Parameterized SQL query modules
│   ├── services/
│   │   ├── mail/               # Gmail API integration for transactional emails
│   │   └── storage/            # ImageKit upload service for avatars and assets
│   ├── tests/                  # Integration test suite with markdown documentation logging
│   ├── app.js                  # Express application setup, routes, and middleware
│   └── server.js               # HTTP server entry point and lifecycle manager
├── .env.example                # Template for environment configuration
└── package.json
```

---

## ⚙️ Environment Configuration

Create a `.env` file in `server/` based on `.env.example`:

```env
# Server
PORT=3000
NODE_ENV=development

# JWT Authentication
JWT_SECRET=your_jwt_secret_key_here
JWT_EXPIRY=12h

# Database (MySQL 8)
DB_HOST=127.0.0.1
DB_PORT=3306
DB_USER=taskflow_app
DB_PASSWORD=taskflow@1311
DB_NAME=taskflow
CONNECTION_LIMIT=10

# Security & Business Logic
BCRYPT_SALT_ROUNDS=10
INVITATION_EXPIRES_HOURS=72

# External Services (Optional)
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GOOGLE_REFRESH_TOKEN=
GOOGLE_SENDER_EMAIL=
IMAGEKIT_PRIVATE_KEY=
```

---

## 🔌 API Endpoints Reference

All routes (except auth and health check) require the `Authorization: Bearer <token>` header.

### 1. System & Authentication (`/api/auth`)
| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :---: |
| `GET` | `/api/health` | Service and database connectivity check | No |
| `POST` | `/api/auth/register` | Register a new user account | No |
| `POST` | `/api/auth/login` | Authenticate credentials and issue JWT | No |
| `GET` | `/api/auth/me` | Fetch currently authenticated user profile | Yes |
| `PATCH`| `/api/auth/profile` | Update profile information (name, avatar) | Yes |
| `POST` | `/api/auth/change-password` | Update account password | Yes |
| `POST` | `/api/auth/send-otp` | Send email verification OTP | Yes |
| `POST` | `/api/auth/verify-otp` | Verify email with 6-digit OTP | Yes |

### 2. Workspaces (`/api/workspaces`)
| Method | Endpoint | Description | Roles Allowed |
| :--- | :--- | :--- | :---: |
| `GET` | `/api/workspaces` | List all workspaces current user belongs to | Member+ |
| `POST` | `/api/workspaces` | Create new workspace (creator becomes `OWNER`) | Any user |
| `GET` | `/api/workspaces/:id` | Get workspace details | Member+ |
| `PATCH`| `/api/workspaces/:id` | Update workspace name/description | Owner, Admin |
| `DELETE`| `/api/workspaces/:id` | Delete workspace | Owner |
| `GET` | `/api/workspaces/:id/members` | List members in workspace | Member+ |
| `PATCH`| `/api/workspaces/:id/members/:userId` | Update member role | Owner, Admin |
| `DELETE`| `/api/workspaces/:id/members/:userId` | Remove member from workspace | Owner, Admin |

### 3. Invitations (`/api/invitations`)
| Method | Endpoint | Description | Scope |
| :--- | :--- | :--- | :---: |
| `POST` | `/api/invitations/workspaces/:workspaceId/invitations` | Send invitation by email | Owner, Admin |
| `GET` | `/api/invitations/workspaces/:workspaceId/invitations` | List invitations sent by workspace | Owner, Admin |
| `PATCH`| `/api/invitations/workspaces/:workspaceId/invitations/:id/cancel` | Cancel pending workspace invitation | Owner, Admin |
| `GET` | `/api/invitations/pending` | List pending invitations for authenticated user | Invitee |
| `POST` | `/api/invitations/accept` | Accept invitation using `token` or `invitationId` | Invitee |
| `POST` | `/api/invitations/decline` | Decline invitation using `token` or `invitationId` | Invitee |

### 4. Teams (`/api/workspaces/:workspaceId/teams`, `/api/teams`)
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/workspaces/:workspaceId/teams` | List teams inside workspace |
| `POST` | `/api/workspaces/:workspaceId/teams` | Create new team |
| `GET` | `/api/teams/:id` | Fetch team details and assigned projects |
| `PATCH`| `/api/teams/:id` | Update team details |
| `POST` | `/api/teams/:id/members` | Add member to team |
| `DELETE`| `/api/teams/:id/members/:userId` | Remove member from team |
| `PATCH`| `/api/teams/:id/archive` | Archive team |

### 5. Projects (`/api/teams/:teamId/projects`, `/api/projects`)
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/teams/:teamId/projects` | List projects belonging to team |
| `POST` | `/api/teams/:teamId/projects` | Create new project |
| `GET` | `/api/projects/:id` | Fetch project details and tasks summary |
| `PATCH`| `/api/projects/:id` | Update project status, visibility, or dates |
| `DELETE`| `/api/projects/:id` | Delete project |

### 6. Tasks & Comments (`/api/projects/:projectId/tasks`, `/api/tasks`)
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/projects/:projectId/tasks` | List tasks in project (supports filter by status, priority) |
| `POST` | `/api/projects/:projectId/tasks` | Create task with priority, due date, assignee |
| `GET` | `/api/tasks/:id` | Get task details, comments, and activity |
| `PATCH`| `/api/tasks/:id` | Update task fields (status, assignee, priority) |
| `DELETE`| `/api/tasks/:id` | Delete task |
| `GET` | `/api/tasks/:taskId/comments` | List comment thread on task |
| `POST` | `/api/tasks/:taskId/comments` | Post new comment on task |
| `DELETE`| `/api/comments/:id` | Delete user comment |

### 7. Notifications, Activity & Dashboard
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/notifications` | List user in-app notifications |
| `GET` | `/api/notifications/unread-count` | Get count of unread notifications |
| `PATCH`| `/api/notifications/:id/read` | Mark specific notification as read |
| `PATCH`| `/api/notifications/read-all` | Mark all user notifications as read |
| `GET` | `/api/activity/workspaces/:workspaceId` | Fetch audit logs for workspace |
| `GET` | `/api/dashboard/workspaces/:workspaceId` | Workspace analytics (member, team, project stats) |

---

## 💾 Database Management

The complete relational schema resides in `database/schema.sql` and includes 12 normalized tables:
- `users`: Core identity, password hash, email verification status.
- `workspaces`: Tenant organizations.
- `workspace_members`: Composite mapping of users to workspaces with roles (`OWNER`, `ADMIN`, `MEMBER`).
- `invitations`: Pending, accepted, and expired workspace invites.
- `teams` & `team_members`: Functional team groups within workspaces.
- `projects` & `project_members`: Deliverable roadmaps.
- `tasks` & `task_comments`: Execution items and discussions.
- `notifications`: User-directed in-app notifications.
- `activity_logs`: Immutable audit trail.

To apply or reset the schema:
```bash
npm run db:reset
```

---

## 🧪 Testing & Verification

The server includes automated integration tests powered by **Jest** and **Supertest**:

```bash
# Run all module tests sequentially
npm run test

# Run tests and regenerate API markdown documentation and Postman artifacts
npm run test:api:docs
```

Each test run executes realistic end-to-end scenarios (registering users, creating workspaces, inviting members, executing task lifecycles) and asserts HTTP status codes, response shapes, and transaction rollbacks.
