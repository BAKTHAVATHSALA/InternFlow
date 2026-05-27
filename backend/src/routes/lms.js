const router = require('express').Router();
const db = require('../db');
const { authenticate, authorize } = require('../middleware/auth');

// ─── Static module definitions ────────────────────────────────────────────────

const COMPLIANCE_MODULES = [
  {
    key: 'compliance_posh',
    title: 'Prevention of Sexual Harassment (POSH)',
    type: 'course',
    description: 'Mandatory training on identifying, preventing, and reporting sexual harassment in the workplace. Covers the POSH Act 2013.',
    duration_minutes: 30,
    sort_order: 1,
  },
  {
    key: 'compliance_coc',
    title: 'Code of Conduct',
    type: 'pdf',
    description: 'Hexaware\'s standards for professional behaviour, ethics, respect, and integrity expected from every team member.',
    duration_minutes: 20,
    sort_order: 2,
  },
  {
    key: 'compliance_data_privacy',
    title: 'Data Privacy & GDPR Compliance',
    type: 'course',
    description: 'How we collect, store, and protect personal data. Your responsibilities under GDPR and India\'s DPDP Act.',
    duration_minutes: 25,
    sort_order: 3,
  },
  {
    key: 'compliance_workplace_safety',
    title: 'Workplace Safety & Health',
    type: 'pdf',
    description: 'Safety protocols, ergonomics, emergency evacuation procedures, and maintaining a healthy work environment.',
    duration_minutes: 15,
    sort_order: 4,
  },
  {
    key: 'compliance_anti_bribery',
    title: 'Anti-Bribery & Anti-Corruption Policy',
    type: 'pdf',
    description: 'Zero-tolerance policy on bribery, improper gifts, conflicts of interest, and whistleblower protections.',
    duration_minutes: 20,
    sort_order: 5,
  },
];

const ROLE_MODULE_MAP = {
  backend: [
    { key: 'role_python',    title: 'Python Fundamentals',       type: 'course', description: 'Core Python syntax, data structures, functions, OOP, and standard library essentials for backend development.',   duration_minutes: 60 },
    { key: 'role_rest_api',  title: 'REST API Design',           type: 'course', description: 'Designing and building RESTful APIs — HTTP methods, status codes, authentication, versioning, and best practices.', duration_minutes: 45 },
    { key: 'role_sql',       title: 'Database & SQL Basics',     type: 'pdf',    description: 'Relational databases, SQL queries, joins, indexes, transactions, and ORM patterns used in the Hexaware stack.',    duration_minutes: 40 },
    { key: 'role_nodejs',    title: 'Node.js & Express',         type: 'course', description: 'Building server-side applications with Node.js — async patterns, middleware, routing, and error handling.',         duration_minutes: 50 },
    { key: 'role_git',       title: 'Git & Version Control',     type: 'video',  description: 'Branching strategies, pull requests, rebasing, resolving conflicts, and the Hexaware Git workflow.',               duration_minutes: 30 },
  ],
  frontend: [
    { key: 'role_html_css',  title: 'HTML & CSS Fundamentals',   type: 'course', description: 'Semantic HTML, CSS box model, flexbox, grid, and building accessible, responsive layouts.',                        duration_minutes: 45 },
    { key: 'role_js',        title: 'JavaScript ES6+',           type: 'course', description: 'Modern JavaScript — arrow functions, promises, async/await, destructuring, modules, and the event loop.',           duration_minutes: 60 },
    { key: 'role_react',     title: 'React Fundamentals',        type: 'course', description: 'Components, props, state, hooks (useState, useEffect), context, and React Router for SPA development.',             duration_minutes: 60 },
    { key: 'role_responsive',title: 'Responsive & UI Design',    type: 'pdf',    description: 'Mobile-first design, Tailwind CSS, design tokens, accessibility (WCAG), and Figma-to-code workflows.',              duration_minutes: 30 },
    { key: 'role_git',       title: 'Git & Version Control',     type: 'video',  description: 'Branching strategies, pull requests, rebasing, resolving conflicts, and the Hexaware Git workflow.',               duration_minutes: 30 },
  ],
  fullstack: [
    { key: 'role_js',        title: 'JavaScript ES6+',           type: 'course', description: 'Modern JavaScript — arrow functions, promises, async/await, destructuring, modules, and the event loop.',           duration_minutes: 60 },
    { key: 'role_react',     title: 'React Fundamentals',        type: 'course', description: 'Components, props, state, hooks (useState, useEffect), context, and React Router for SPA development.',             duration_minutes: 60 },
    { key: 'role_nodejs',    title: 'Node.js & Express',         type: 'course', description: 'Building server-side applications with Node.js — async patterns, middleware, routing, and error handling.',         duration_minutes: 50 },
    { key: 'role_sql',       title: 'Database & SQL Basics',     type: 'pdf',    description: 'Relational databases, SQL queries, joins, indexes, transactions, and ORM patterns used in the Hexaware stack.',    duration_minutes: 40 },
    { key: 'role_git',       title: 'Git & Version Control',     type: 'video',  description: 'Branching strategies, pull requests, rebasing, resolving conflicts, and the Hexaware Git workflow.',               duration_minutes: 30 },
  ],
  data: [
    { key: 'role_python',    title: 'Python for Data Science',   type: 'course', description: 'NumPy, Pandas, data wrangling, and exploratory data analysis using Python.',                                        duration_minutes: 60 },
    { key: 'role_sql',       title: 'SQL & Data Querying',       type: 'pdf',    description: 'Advanced SQL — window functions, CTEs, aggregations, and analytical queries for data pipelines.',                  duration_minutes: 40 },
    { key: 'role_viz',       title: 'Data Visualization',        type: 'course', description: 'Building charts and dashboards with Matplotlib, Seaborn, and Power BI for data storytelling.',                     duration_minutes: 45 },
    { key: 'role_ml_basics', title: 'Machine Learning Basics',   type: 'course', description: 'Supervised and unsupervised learning, model training, validation, and evaluation metrics.',                         duration_minutes: 60 },
    { key: 'role_stats',     title: 'Statistics Fundamentals',   type: 'pdf',    description: 'Probability, distributions, hypothesis testing, and statistical thinking for data professionals.',                  duration_minutes: 35 },
  ],
  ml: [
    { key: 'role_python',    title: 'Python for ML',             type: 'course', description: 'NumPy, Pandas, Scikit-learn, and the Python ML ecosystem for building models.',                                    duration_minutes: 60 },
    { key: 'role_ml_basics', title: 'Machine Learning Fundamentals', type: 'course', description: 'Core algorithms — linear regression, decision trees, clustering, and ensemble methods.',                       duration_minutes: 60 },
    { key: 'role_dl',        title: 'Deep Learning Basics',      type: 'course', description: 'Neural networks, backpropagation, CNNs, RNNs, and an introduction to PyTorch/TensorFlow.',                         duration_minutes: 75 },
    { key: 'role_ml_ops',    title: 'MLOps & Model Deployment',  type: 'pdf',    description: 'Model versioning, experiment tracking (MLflow), containerising models, and serving predictions via API.',          duration_minutes: 40 },
    { key: 'role_stats',     title: 'Statistics Fundamentals',   type: 'pdf',    description: 'Probability, distributions, hypothesis testing, and statistical thinking for data professionals.',                  duration_minutes: 35 },
  ],
  devops: [
    { key: 'role_linux',     title: 'Linux Fundamentals',        type: 'course', description: 'Shell scripting, file system, process management, networking commands, and user permissions.',                     duration_minutes: 45 },
    { key: 'role_docker',    title: 'Docker & Containers',       type: 'course', description: 'Container concepts, Dockerfile authoring, Docker Compose, and image registry workflows.',                          duration_minutes: 50 },
    { key: 'role_cicd',      title: 'CI/CD Pipelines',           type: 'video',  description: 'Building automated pipelines with GitHub Actions — build, test, lint, deploy stages, and secrets management.',     duration_minutes: 45 },
    { key: 'role_cloud',     title: 'Cloud Basics (AWS)',         type: 'course', description: 'Core AWS services — EC2, S3, RDS, IAM, VPC — and best practices for cloud-native infrastructure.',               duration_minutes: 60 },
    { key: 'role_k8s',       title: 'Kubernetes Essentials',     type: 'pdf',    description: 'Pods, deployments, services, config maps, and scaling containerised applications on Kubernetes.',                  duration_minutes: 50 },
  ],
  mobile: [
    { key: 'role_ux',        title: 'Mobile UI/UX Principles',   type: 'pdf',    description: 'Designing for small screens — touch targets, navigation patterns, accessibility, and Material/HIG guidelines.',    duration_minutes: 35 },
    { key: 'role_rn',        title: 'React Native Basics',        type: 'course', description: 'Components, StyleSheet, navigation, state management, and bridging native modules in React Native.',               duration_minutes: 60 },
    { key: 'role_js',        title: 'JavaScript ES6+',           type: 'course', description: 'Modern JavaScript — arrow functions, promises, async/await, destructuring, modules, and the event loop.',           duration_minutes: 60 },
    { key: 'role_api_int',   title: 'API Integration & Auth',    type: 'course', description: 'Consuming REST APIs, handling tokens, biometric auth, offline caching, and push notifications.',                   duration_minutes: 45 },
    { key: 'role_git',       title: 'Git & Version Control',     type: 'video',  description: 'Branching strategies, pull requests, rebasing, resolving conflicts, and the Hexaware Git workflow.',               duration_minutes: 30 },
  ],
  default: [
    { key: 'role_agile',     title: 'Agile & Scrum Methodology', type: 'course', description: 'Sprints, backlog grooming, standups, retrospectives, and working effectively in an agile team.',                   duration_minutes: 40 },
    { key: 'role_git',       title: 'Git & Version Control',     type: 'video',  description: 'Branching strategies, pull requests, rebasing, resolving conflicts, and the Hexaware Git workflow.',               duration_minutes: 30 },
    { key: 'role_tech_comm', title: 'Technical Communication',   type: 'pdf',    description: 'Writing clear documentation, pull request descriptions, status updates, and communicating with stakeholders.',      duration_minutes: 30 },
    { key: 'role_sql',       title: 'Database & SQL Basics',     type: 'pdf',    description: 'Relational databases, SQL queries, joins, indexes, transactions, and ORM patterns.',                               duration_minutes: 40 },
    { key: 'role_python',    title: 'Python Fundamentals',       type: 'course', description: 'Core Python syntax, data structures, functions, OOP, and standard library essentials.',                            duration_minutes: 60 },
  ],
};

function detectRoleCategory(jobTitle = '') {
  const t = jobTitle.toLowerCase();
  if (t.includes('devops') || t.includes('cloud') || t.includes('infrastructure') || t.includes('sre')) return 'devops';
  if (t.includes('mobile') || t.includes('ios') || t.includes('android') || t.includes('react native')) return 'mobile';
  if (t.includes('machine learning') || t.includes('ml') || t.includes('ai') || t.includes('deep learning')) return 'ml';
  if (t.includes('data') || t.includes('analytics') || t.includes('bi ') || t.includes('analyst')) return 'data';
  if (t.includes('full') || t.includes('fullstack') || t.includes('full-stack') || t.includes('full stack')) return 'fullstack';
  if (t.includes('front') || t.includes('ui') || t.includes('ux') || t.includes('react') || t.includes('angular') || t.includes('vue')) return 'frontend';
  if (t.includes('back') || t.includes('backend') || t.includes('back-end') || t.includes('api') || t.includes('node') || t.includes('django') || t.includes('spring')) return 'backend';
  return 'default';
}

// One-time migration guard — awaited before the first request touches these columns
let _migrationDone = false;
async function ensureColumns() {
  if (_migrationDone) return;
  await db.query(`ALTER TABLE lms_modules ADD COLUMN IF NOT EXISTS category   VARCHAR(20) DEFAULT 'role'`);
  await db.query(`ALTER TABLE lms_modules ADD COLUMN IF NOT EXISTS unique_key VARCHAR(100)`);

  // Add 'course' to the enum — must run outside a transaction block (autocommit)
  // Use a dedicated client to guarantee no surrounding transaction
  const client = await db.pool.connect();
  try {
    await client.query(`ALTER TYPE lms_module_type ADD VALUE IF NOT EXISTS 'course'`);
  } catch (_) {
    // Safe to ignore: enum type may not exist (plain VARCHAR), or value already present
  } finally {
    client.release();
  }

  _migrationDone = true;
}

// Safe upsert: SELECT then INSERT-or-UPDATE to avoid ON CONFLICT constraint issues
async function upsertModule(mod, jobId = null, category = 'role') {
  const { rows: existing } = await db.query(
    `SELECT id FROM lms_modules WHERE unique_key = $1`,
    [mod.key]
  );

  if (existing.length) {
    await db.query(
      `UPDATE lms_modules
       SET title=$1, description=$2, type=$3, duration_minutes=$4,
           sort_order=$5, category=$6, is_active=TRUE
       WHERE unique_key=$7`,
      [mod.title, mod.description, mod.type, mod.duration_minutes,
       mod.sort_order, category, mod.key]
    );
    return existing[0].id;
  }

  const { rows } = await db.query(
    `INSERT INTO lms_modules
       (unique_key, job_id, title, type, description, duration_minutes, sort_order, is_active, category)
     VALUES ($1,$2,$3,$4,$5,$6,$7,TRUE,$8) RETURNING id`,
    [mod.key, jobId, mod.title, mod.type, mod.description,
     mod.duration_minutes, mod.sort_order, category]
  );
  return rows[0].id;
}

/**
 * GET /api/lms/modules
 * Returns exactly 10 modules: 5 company compliance + 5 role-specific for the intern's job.
 */
router.get('/modules', authenticate, authorize('intern'), async (req, res) => {
  try {
    await ensureColumns();

    // Get intern's job title — accept any application status so the portal
    // works even before the status is flipped to 'onboarded'
    const { rows: appRows } = await db.query(
      `SELECT j.title AS job_title, a.job_id
       FROM applications a
       JOIN jobs j ON j.id = a.job_id
       WHERE a.intern_id = $1
       ORDER BY a.applied_at DESC LIMIT 1`,
      [req.user.id]
    );

    const jobTitle = appRows[0]?.job_title || '';
    const jobId    = appRows[0]?.job_id    || null;
    const roleKey  = detectRoleCategory(jobTitle);
    const roleMods = ROLE_MODULE_MAP[roleKey];

    // Upsert sequentially to avoid concurrent-insert race conditions
    const allIds = [];
    for (const m of COMPLIANCE_MODULES) {
      allIds.push(await upsertModule(m, null, 'compliance'));
    }
    for (let i = 0; i < roleMods.length; i++) {
      allIds.push(await upsertModule({ ...roleMods[i], sort_order: 6 + i }, jobId, 'role'));
    }

    const { rows } = await db.query(
      `SELECT m.id, m.title, m.type, m.description, m.duration_minutes, m.sort_order, m.category,
              p.completed, p.progress_pct
       FROM lms_modules m
       LEFT JOIN lms_progress p ON p.module_id = m.id AND p.intern_id = $1
       WHERE m.id = ANY($2::uuid[])
       ORDER BY m.sort_order ASC`,
      [req.user.id, allIds]
    );

    res.json(rows);
  } catch (err) {
    console.error('[LMS MODULES ERROR]', err.message, err.stack);
    res.status(500).json({ error: 'Failed to fetch modules', detail: err.message });
  }
});

/**
 * PATCH /api/lms/modules/:id/complete
 */
router.patch('/modules/:id/complete', authenticate, authorize('intern'), async (req, res) => {
  try {
    await db.query(
      `INSERT INTO lms_progress (intern_id, module_id, progress_pct, completed, completed_at)
       VALUES ($1, $2, 100, TRUE, NOW())
       ON CONFLICT (intern_id, module_id) DO UPDATE SET progress_pct = 100, completed = TRUE, completed_at = NOW()`,
      [req.user.id, req.params.id]
    );

    // Notify mentor once all 10 modules are done
    const { rows: doneRows } = await db.query(
      `SELECT COUNT(*) AS cnt FROM lms_progress WHERE intern_id = $1 AND completed = TRUE`,
      [req.user.id]
    );
    if (parseInt(doneRows[0].cnt) >= 10) {
      const { rows: mentorRows } = await db.query(
        `SELECT ma.mentor_id FROM mentor_assignments ma WHERE ma.intern_id = $1`,
        [req.user.id]
      );
      if (mentorRows.length) {
        // Fetch intern name separately to avoid subquery-in-VALUES syntax issues
        const { rows: nameRows } = await db.query(
          `SELECT COALESCE(NULLIF(TRIM(CONCAT(a.first_name,' ',a.last_name)),''), u.name) AS intern_name
           FROM applications a JOIN users u ON u.id = a.intern_id
           WHERE a.intern_id = $1 ORDER BY a.applied_at DESC LIMIT 1`,
          [req.user.id]
        );
        const internName = nameRows[0]?.intern_name || 'The intern';
        await db.query(
          `INSERT INTO notifications (user_id, type, title, message)
           VALUES ($1, 'lms_complete', 'Intern Completed All Modules', $2)`,
          [mentorRows[0].mentor_id, `${internName} has completed all 10 learning modules.`]
        );
      }
    }

    res.json({ message: 'Module marked as complete' });
  } catch (err) {
    console.error('[LMS COMPLETE]', err);
    res.status(500).json({ error: 'Failed to complete module' });
  }
});

/**
 * GET /api/lms/progress/:internId — Mentor/HR views progress
 */
router.get('/progress/:internId', authenticate, authorize('mentor', 'hr', 'admin'), async (req, res) => {
  try {
    const { rows } = await db.query(
      `SELECT m.title, m.category, p.progress_pct, p.completed, p.completed_at
       FROM lms_modules m
       LEFT JOIN lms_progress p ON p.module_id = m.id AND p.intern_id = $1
       WHERE m.unique_key IS NOT NULL
       ORDER BY m.sort_order ASC`,
      [req.params.internId]
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch progress' });
  }
});

/**
 * POST /api/lms/modules — HR/Admin adds a custom module
 */
router.post('/modules', authenticate, authorize('hr', 'admin'), async (req, res) => {
  try {
    const { title, description, content_url, type, sort_order } = req.body;
    const { rows } = await db.query(
      `INSERT INTO lms_modules (title, description, content_url, type, sort_order)
       VALUES ($1, $2, $3, $4, $5) RETURNING id`,
      [title, description, content_url, type, sort_order]
    );
    res.status(201).json({ message: 'Module created', moduleId: rows[0].id });
  } catch (err) {
    res.status(500).json({ error: 'Failed to create module' });
  }
});

module.exports = router;
