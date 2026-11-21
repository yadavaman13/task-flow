SET NAMES utf8mb4;
SET time_zone = '+00:00';


-- ENUM REFERENCE CATALOG (values are declared inline below)

-- workspace_members.role: OWNER, ADMIN, MEMBER
-- invitations.role: MEMBER
-- invitations.status: PENDING, ACCEPTED, DECLINED, EXPIRED, CANCELLED
-- teams.status: ACTIVE, ARCHIVED
-- team_members.role: TEAM_OWNER, TEAM_MEMBER
-- projects.visibility: TEAM, PRIVATE
-- projects.status: PLANNING, ACTIVE, COMPLETED, ARCHIVED
-- project_members.role: PROJECT_OWNER, PROJECT_MEMBER
-- tasks.status: TODO, IN_PROGRESS, IN_REVIEW, BLOCKED, COMPLETED
-- tasks.priority: LOW, MEDIUM, HIGH, URGENT
-- notifications.type: WORKSPACE_INVITATION, PROJECT_ADDED, TASK_ASSIGNED,
--                     TASK_STATUS_CHANGED, COMMENT_ADDED
-- activity_logs.action: see table definition (fixed event vocabulary)


-- DROP TABLES (dependency order)

DROP TABLE IF EXISTS activity_logs;
DROP TABLE IF EXISTS notifications;
DROP TABLE IF EXISTS task_comments;
DROP TABLE IF EXISTS tasks;
DROP TABLE IF EXISTS project_members;
DROP TABLE IF EXISTS projects;
DROP TABLE IF EXISTS team_members;
DROP TABLE IF EXISTS teams;
DROP TABLE IF EXISTS invitations;
DROP TABLE IF EXISTS workspace_members;
DROP TABLE IF EXISTS workspaces;
DROP TABLE IF EXISTS users;

--1. USERS
CREATE TABLE users (
    id              BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    name            VARCHAR(120) NOT NULL,
    email           VARCHAR(254) NOT NULL,
    password_hash   VARCHAR(255) NOT NULL,
    avatar_url      VARCHAR(2048) NULL,
    is_active       BOOLEAN NOT NULL DEFAULT TRUE,
    is_verified     BOOLEAN NOT NULL DEFAULT FALSE,
    email_verified_at DATETIME NULL,
    created_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY uq_users_email (email),
    CONSTRAINT chk_users_name_nonempty CHECK (CHAR_LENGTH(TRIM(name)) > 0),
    CONSTRAINT chk_users_email_nonempty CHECK (CHAR_LENGTH(TRIM(email)) > 0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;


-- 2. WORKSPACES
CREATE TABLE workspaces (
    id              BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    name            VARCHAR(120) NOT NULL,
    description     VARCHAR(1000) NULL,
    owner_id        BIGINT UNSIGNED NOT NULL,
    created_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    KEY idx_workspaces_owner (owner_id),
    CONSTRAINT fk_workspaces_owner
        FOREIGN KEY (owner_id) REFERENCES users (id)
        ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT chk_workspaces_name_nonempty CHECK (CHAR_LENGTH(TRIM(name)) > 0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;


-- 3. WORKSPACE MEMBERS
CREATE TABLE workspace_members (
    workspace_id    BIGINT UNSIGNED NOT NULL,
    user_id         BIGINT UNSIGNED NOT NULL,
    role            ENUM('OWNER', 'ADMIN', 'MEMBER') NOT NULL DEFAULT 'MEMBER',
    joined_at       DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (workspace_id, user_id),
    KEY idx_workspace_members_user (user_id, workspace_id),
    CONSTRAINT fk_workspace_members_workspace
        FOREIGN KEY (workspace_id) REFERENCES workspaces (id)
        ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_workspace_members_user
        FOREIGN KEY (user_id) REFERENCES users (id)
        ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;


-- 4. WORKSPACE INVITATIONS
CREATE TABLE invitations (
    id              BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    workspace_id    BIGINT UNSIGNED NOT NULL,
    email           VARCHAR(254) NOT NULL,
    invited_by       BIGINT UNSIGNED NOT NULL,
    role            ENUM('ADMIN','MEMBER') NOT NULL DEFAULT 'MEMBER',
    token_hash      CHAR(64) NOT NULL,
    status          ENUM('PENDING','ACCEPTED','DECLINED','EXPIRED','CANCELLED')
                    NOT NULL DEFAULT 'PENDING',
    expires_at      DATETIME NOT NULL,
    accepted_at     DATETIME NULL,
    created_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    pending_email   VARCHAR(254) GENERATED ALWAYS AS
                    (CASE WHEN status = 'PENDING' THEN email ELSE NULL END) STORED,
    PRIMARY KEY (id),
    UNIQUE KEY uq_invitation_token_hash (token_hash),
    UNIQUE KEY uq_pending_invitation (workspace_id, pending_email),
    KEY idx_invitations_email_status (email, status),
    KEY idx_invitations_workspace_status (workspace_id, status),
    CONSTRAINT fk_invitations_workspace
        FOREIGN KEY (workspace_id) REFERENCES workspaces (id)
        ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_invitations_invited_by
        FOREIGN KEY (invited_by) REFERENCES users (id)
        ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT chk_invitation_expiry CHECK (expires_at > created_at),
    CONSTRAINT chk_invitation_email_nonempty CHECK (CHAR_LENGTH(TRIM(email)) > 0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;


-- 5. TEAMS
CREATE TABLE teams (
    id              BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    workspace_id    BIGINT UNSIGNED NOT NULL,
    name            VARCHAR(120) NOT NULL,
    description     VARCHAR(1000) NULL,
    created_by      BIGINT UNSIGNED NOT NULL,
    status          ENUM('ACTIVE','ARCHIVED') NOT NULL DEFAULT 'ACTIVE',
    created_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY uq_team_workspace_name (workspace_id, name),
    KEY idx_teams_workspace_status (workspace_id, status),
    CONSTRAINT fk_teams_workspace
        FOREIGN KEY (workspace_id) REFERENCES workspaces (id)
        ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_teams_created_by
        FOREIGN KEY (created_by) REFERENCES users (id)
        ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT chk_teams_name_nonempty CHECK (CHAR_LENGTH(TRIM(name)) > 0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;


-- 6. TEAM MEMBERS
CREATE TABLE team_members (
    team_id          BIGINT UNSIGNED NOT NULL,
    user_id          BIGINT UNSIGNED NOT NULL,
    role             ENUM('TEAM_OWNER','TEAM_MEMBER') NOT NULL DEFAULT 'TEAM_MEMBER',
    joined_at        DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (team_id, user_id),
    KEY idx_team_members_user (user_id, team_id),
    CONSTRAINT fk_team_members_team
        FOREIGN KEY (team_id) REFERENCES teams (id)
        ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_team_members_user
        FOREIGN KEY (user_id) REFERENCES users (id)
        ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;


-- 7. PROJECTS
CREATE TABLE projects (
    id              BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    team_id         BIGINT UNSIGNED NOT NULL,
    name            VARCHAR(160) NOT NULL,
    description     TEXT NULL,
    created_by      BIGINT UNSIGNED NOT NULL,
    visibility      ENUM('TEAM','PRIVATE') NOT NULL DEFAULT 'TEAM',
    status          ENUM('PLANNING','ACTIVE','COMPLETED','ARCHIVED')
                    NOT NULL DEFAULT 'PLANNING',
    start_date      DATE NULL,
    due_date        DATE NULL,
    created_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    KEY idx_projects_team_status (team_id, status),
    KEY idx_projects_team_visibility (team_id, visibility),
    KEY idx_projects_created_by (created_by),
    CONSTRAINT fk_projects_team
        FOREIGN KEY (team_id) REFERENCES teams (id)
        ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_projects_created_by
        FOREIGN KEY (created_by) REFERENCES users (id)
        ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT chk_projects_name_nonempty CHECK (CHAR_LENGTH(TRIM(name)) > 0),
    CONSTRAINT chk_projects_dates CHECK (due_date IS NULL OR start_date IS NULL OR due_date >= start_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;


-- 8. PROJECT MEMBERS (primarily explicit membership for PRIVATE)
CREATE TABLE project_members (
    project_id       BIGINT UNSIGNED NOT NULL,
    user_id          BIGINT UNSIGNED NOT NULL,
    role             ENUM('PROJECT_OWNER','PROJECT_MEMBER') NOT NULL DEFAULT 'PROJECT_MEMBER',
    joined_at        DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (project_id, user_id),
    KEY idx_project_members_user (user_id, project_id),
    CONSTRAINT fk_project_members_project
        FOREIGN KEY (project_id) REFERENCES projects (id)
        ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_project_members_user
        FOREIGN KEY (user_id) REFERENCES users (id)
        ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;


-- 9. TASKS
CREATE TABLE tasks (
    id              BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    project_id       BIGINT UNSIGNED NOT NULL,
    created_by       BIGINT UNSIGNED NOT NULL,
    assigned_to      BIGINT UNSIGNED NULL,
    title            VARCHAR(200) NOT NULL,
    description     TEXT NULL,
    status          ENUM('TODO','IN_PROGRESS','IN_REVIEW','BLOCKED','COMPLETED')
                    NOT NULL DEFAULT 'TODO',
    priority        ENUM('LOW','MEDIUM','HIGH','URGENT') NOT NULL DEFAULT 'MEDIUM',
    due_date        DATETIME NULL,
    completed_at    DATETIME NULL,
    created_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    KEY idx_tasks_project_status (project_id, status),
    KEY idx_tasks_project_priority (project_id, priority),
    KEY idx_tasks_assignee_status (assigned_to, status),
    KEY idx_tasks_project_due (project_id, due_date),
    KEY idx_tasks_created_by (created_by),
    CONSTRAINT fk_tasks_project
        FOREIGN KEY (project_id) REFERENCES projects (id)
        ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_tasks_created_by
        FOREIGN KEY (created_by) REFERENCES users (id)
        ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT fk_tasks_assigned_to
        FOREIGN KEY (assigned_to) REFERENCES users (id)
        ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT chk_tasks_title_nonempty CHECK (CHAR_LENGTH(TRIM(title)) > 0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;


-- 10. TASK COMMENTS
CREATE TABLE task_comments (
    id              BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    task_id         BIGINT UNSIGNED NOT NULL,
    user_id          BIGINT UNSIGNED NOT NULL,
    comment         TEXT NOT NULL,
    created_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    KEY idx_task_comments_task_created (task_id, created_at),
    KEY idx_task_comments_user (user_id),
    CONSTRAINT fk_task_comments_task
        FOREIGN KEY (task_id) REFERENCES tasks (id)
        ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_task_comments_user
        FOREIGN KEY (user_id) REFERENCES users (id)
        ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT chk_task_comments_nonempty CHECK (CHAR_LENGTH(TRIM(comment)) > 0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;


-- 11. NOTIFICATIONS
CREATE TABLE notifications (
    id              BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    user_id          BIGINT UNSIGNED NOT NULL,
    type             ENUM('WORKSPACE_INVITATION','PROJECT_ADDED','TASK_ASSIGNED',
                         'TASK_STATUS_CHANGED','COMMENT_ADDED') NOT NULL,
    title            VARCHAR(200) NOT NULL,
    message          VARCHAR(1000) NOT NULL,
    reference_type   ENUM('WORKSPACE','INVITATION','PROJECT','TASK','COMMENT') NULL,
    reference_id    BIGINT UNSIGNED NULL,
    is_read          BOOLEAN NOT NULL DEFAULT FALSE,
    read_at         DATETIME NULL,
    created_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    KEY idx_notifications_user_unread_created (user_id, is_read, created_at),
    KEY idx_notifications_user_created (user_id, created_at),
    CONSTRAINT fk_notifications_user
        FOREIGN KEY (user_id) REFERENCES users (id)
        ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;


-- 12. ACTIVITY LOGS
CREATE TABLE activity_logs (
    id              BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    actor_id        BIGINT UNSIGNED NULL,
    workspace_id    BIGINT UNSIGNED NULL,
    project_id      BIGINT UNSIGNED NULL,
    task_id         BIGINT UNSIGNED NULL,
    action          ENUM('WORKSPACE_CREATED','MEMBER_INVITED','MEMBER_JOINED',
                         'MEMBER_REMOVED','TEAM_CREATED','TEAM_MEMBER_ADDED',
                         'TEAM_MEMBER_REMOVED','PROJECT_CREATED','PROJECT_UPDATED',
                         'PROJECT_ARCHIVED','PROJECT_MEMBER_ADDED','TASK_CREATED',
                         'TASK_ASSIGNED','TASK_UPDATED','TASK_STATUS_CHANGED',
                         'TASK_COMPLETED','COMMENT_CREATED') NOT NULL,
    metadata        JSON NULL,
    created_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    KEY idx_activity_workspace_created (workspace_id, created_at),
    KEY idx_activity_project_created (project_id, created_at),
    KEY idx_activity_task_created (task_id, created_at),
    KEY idx_activity_actor_created (actor_id, created_at),
    CONSTRAINT fk_activity_actor
        FOREIGN KEY (actor_id) REFERENCES users (id)
        ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT fk_activity_workspace
        FOREIGN KEY (workspace_id) REFERENCES workspaces (id)
        ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT fk_activity_project
        FOREIGN KEY (project_id) REFERENCES projects (id)
        ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT fk_activity_task
        FOREIGN KEY (task_id) REFERENCES tasks (id)
        ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;


-- NOTE:
-- Cross-entity rules (e.g. assignee must be an eligible member of
-- a project, user must belong to the workspace before team membership,
-- private-project access) must be enforced in the service layer,
-- ideally inside transactions. Foreign keys alone cannot enforce
-- these multi-table authorization/business rules.
