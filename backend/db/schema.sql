-- ENABLE EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ENUM DEFINITIONS
CREATE TYPE application_status AS ENUM (
    'referred','applied','reviewed','selected','rejected',
    'nda_pending','nda_signed','onboarded','tasks_assigned',
    'learning_in_progress','project_submitted','approved',
    'completed','certificate_generated','expired'
);

CREATE TYPE task_status AS ENUM ('pending','completed');
CREATE TYPE submission_status AS ENUM ('submitted','approved','rework');
CREATE TYPE referral_status AS ENUM ('referred','expired','converted');

-- USERS (Independent of auth.users)
CREATE TABLE users (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    role TEXT CHECK (role IN ('referrer','intern','hr','mentor','admin')),
    is_active BOOLEAN DEFAULT TRUE,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- JOBS
CREATE TABLE jobs (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT,
    requirements jsonb,
    target_skills jsonb,
    cutoff_score FLOAT DEFAULT 70.0,
    mentor_id uuid REFERENCES users(id) ON DELETE SET NULL,
    created_by uuid REFERENCES users(id) ON DELETE SET NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- REFERRALS
CREATE TABLE referrals (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    referrer_id uuid REFERENCES users(id) ON DELETE CASCADE,
    job_id uuid REFERENCES jobs(id) ON DELETE CASCADE,
    candidate_name TEXT NOT NULL,
    candidate_email TEXT NOT NULL,
    candidate_phone TEXT,
    resume_url TEXT,
    notes TEXT,
    status referral_status DEFAULT 'referred',
    expires_at timestamptz,
    reminder_sent_at timestamptz,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- APPLICATIONS (Core of the system)
CREATE TABLE applications (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid REFERENCES users(id) ON DELETE CASCADE,
    job_id uuid REFERENCES jobs(id) ON DELETE CASCADE,
    referral_id uuid REFERENCES referrals(id) ON DELETE SET NULL,
    status application_status DEFAULT 'applied',
    resume_url TEXT,
    resume_data jsonb,
    applied_at timestamptz DEFAULT now(),
    reviewed_at timestamptz,
    selected_at timestamptz,
    rejected_at timestamptz,
    completed_at timestamptz,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- AI EVALUATIONS & ANALYSIS
CREATE TABLE ai_evaluations (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    application_id uuid REFERENCES applications(id) ON DELETE CASCADE,
    model_used TEXT DEFAULT 'gpt-4o',
    semantic_score FLOAT,
    skill_score FLOAT,
    experience_score FLOAT,
    overall_score FLOAT,
    confidence_score TEXT,
    evaluation_version TEXT DEFAULT 'v1',
    created_at timestamptz DEFAULT now()
);

CREATE TABLE ai_explanations (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    application_id uuid REFERENCES applications(id) ON DELETE CASCADE,
    strengths jsonb DEFAULT '[]',
    gaps jsonb DEFAULT '[]',
    improvements jsonb DEFAULT '[]',
    confidence_rationale TEXT,
    generated_by TEXT,
    created_at timestamptz DEFAULT now()
);

CREATE TABLE embeddings (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    application_id uuid REFERENCES applications(id) ON DELETE CASCADE,
    embedding vector(1536), -- Optimized for pgvector if installed, otherwise jsonb
    created_at timestamptz DEFAULT now()
);

CREATE TABLE ai_logs (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    application_id uuid REFERENCES applications(id) ON DELETE CASCADE,
    model_used TEXT,
    input_tokens INT,
    output_tokens INT,
    latency_ms INT,
    status TEXT,
    created_at timestamptz DEFAULT now()
);

-- SLA & LIFECYCLE TRACKING
CREATE TABLE sla_tracking (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    application_id uuid REFERENCES applications(id) ON DELETE CASCADE,
    stage TEXT NOT NULL,
    expires_at timestamptz NOT NULL,
    reminder_at timestamptz,
    is_expired BOOLEAN DEFAULT FALSE,
    is_reminder_sent BOOLEAN DEFAULT FALSE,
    created_at timestamptz DEFAULT now()
);

-- ONBOARDING FLOW
CREATE TABLE joining_forms (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    application_id uuid REFERENCES applications(id) ON DELETE CASCADE,
    address TEXT,
    emergency_contact TEXT,
    start_date DATE,
    end_date DATE,
    is_completed BOOLEAN DEFAULT FALSE,
    submitted_at timestamptz,
    created_at timestamptz DEFAULT now()
);

CREATE TABLE nda_records (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    application_id uuid REFERENCES applications(id) ON DELETE CASCADE,
    status TEXT DEFAULT 'pending',
    document_url TEXT,
    signed_at timestamptz,
    created_at timestamptz DEFAULT now()
);

CREATE TABLE onboarding (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    application_id uuid REFERENCES applications(id) ON DELETE CASCADE,
    status TEXT DEFAULT 'processing',
    onboarded_at timestamptz,
    created_at timestamptz DEFAULT now()
);

-- TASK & PROJECT SYSTEM
CREATE TABLE task_assignments (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    application_id uuid REFERENCES applications(id) ON DELETE CASCADE,
    mentor_id uuid REFERENCES users(id) ON DELETE SET NULL,
    status TEXT DEFAULT 'active',
    assigned_at timestamptz DEFAULT now(),
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

CREATE TABLE tasks (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    task_assignment_id uuid REFERENCES task_assignments(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    type TEXT, -- 'learning', 'project', 'bug_fix'
    resource_url TEXT,
    status task_status DEFAULT 'pending',
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

CREATE TABLE project_submissions (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    application_id uuid REFERENCES applications(id) ON DELETE CASCADE,
    task_assignment_id uuid REFERENCES task_assignments(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    github_link TEXT,
    description TEXT,
    status submission_status DEFAULT 'submitted',
    reviewed_by uuid REFERENCES users(id) ON DELETE SET NULL,
    reviewed_at timestamptz,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- AUTH, ACCESS & MAGIC LINKS
CREATE TABLE magic_link_tokens (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid REFERENCES users(id) ON DELETE CASCADE,
    application_id uuid REFERENCES applications(id) ON DELETE CASCADE,
    token TEXT UNIQUE NOT NULL,
    expires_at timestamptz NOT NULL,
    is_used BOOLEAN DEFAULT FALSE,
    created_at timestamptz DEFAULT now()
);

CREATE TABLE access_control (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    application_id uuid REFERENCES applications(id) ON DELETE CASCADE,
    access_type TEXT NOT NULL, -- 'dashboard', 'task_view', 'project_edit'
    is_active BOOLEAN DEFAULT TRUE,
    expires_at timestamptz,
    created_at timestamptz DEFAULT now()
);

-- CERTIFICATES
CREATE TABLE certificates (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    application_id uuid REFERENCES applications(id) ON DELETE CASCADE,
    certificate_url TEXT NOT NULL,
    issued_at timestamptz DEFAULT now(),
    created_at timestamptz DEFAULT now()
);

-- AUDIT & NOTIFICATIONS
CREATE TABLE audit_logs (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    application_id uuid REFERENCES applications(id) ON DELETE SET NULL,
    user_id uuid REFERENCES users(id) ON DELETE SET NULL,
    action TEXT NOT NULL,
    from_status TEXT,
    to_status TEXT,
    entity_type TEXT,
    entity_id uuid,
    details jsonb DEFAULT '{}',
    created_at timestamptz DEFAULT now()
);

CREATE TABLE notifications (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid REFERENCES users(id) ON DELETE CASCADE,
    application_id uuid REFERENCES applications(id) ON DELETE CASCADE,
    type TEXT,
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    sent_at timestamptz DEFAULT now(),
    created_at timestamptz DEFAULT now()
);

-- PERFORMANCE INDEXES
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_applications_user_id ON applications(user_id);
CREATE INDEX idx_applications_job_id ON applications(job_id);
CREATE INDEX idx_applications_status ON applications(status);
CREATE INDEX idx_referrals_candidate_email ON referrals(candidate_email);
CREATE INDEX idx_tasks_assignment_id ON tasks(task_assignment_id);
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_audit_logs_application_id ON audit_logs(application_id);
CREATE INDEX idx_magic_links_token ON magic_link_tokens(token);
CREATE INDEX idx_sla_expires_at ON sla_tracking(expires_at);
