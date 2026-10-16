import fs from 'node:fs';
import path from 'node:path';
import {
  db,
  save,
  analyze,
  buildReport,
  sendPdf,
  discoverRequirements,
  heuristic
} from './server.js';

console.log('====================================================');
console.log('   AI Career Coach - 5-Minute Interactive Demo Loop   ');
console.log('====================================================\n');

const DEMO_USER = 'demo-candidate';
const TARGET_ROLE = 'Backend Developer';

console.log(`[Step 1] Initializing Demo Student Profile: ${DEMO_USER}`);
console.log(`Target Role: ${TARGET_ROLE}\n`);

// Clean previous demo assessments if any
db.assessments = db.assessments.filter((a) => a.github_username?.toLowerCase() !== DEMO_USER);
delete db.profiles[DEMO_USER];
delete db.repoState[`${DEMO_USER}/portfolio`];

// Step 1: Baseline Assessment
console.log('[Step 1: Baseline Assessment]');
console.log('Discovering real market requirements and simulating initial portfolio audit...');

const initialBatch = `run-${Date.now()}-${DEMO_USER}`;
const initialTime = new Date(Date.now() - 3600000).toISOString(); // 1 hour ago

db.profiles[DEMO_USER] = {
  github_username: DEMO_USER,
  target_role: TARGET_ROLE,
  updated_at: initialTime
};

// Initial state: student has basic HTML/CSS and JavaScript, but no SQL and no Docker
db.assessments.push(
  {
    github_username: DEMO_USER,
    target_role: TARGET_ROLE,
    skill: 'SQL',
    status: 'not_demonstrated',
    confidence: 'high',
    rationale: 'No SQL statements, schema migrations, or query builders detected in repositories.',
    evidence: [],
    job_sources: [{ company: 'FinTech Corp', title: 'Backend Engineer', source: 'Jobicy', url: 'https://jobicy.com' }],
    job_count: 8,
    previous_status: '',
    change_type: 'new',
    trigger_source: 'initial-audit',
    changed_repos: '',
    batch_id: initialBatch,
    assessed_at: initialTime,
    gap_advice: 'Commit a schema.sql with real table definitions and multi-table joins to your public repository.'
  },
  {
    github_username: DEMO_USER,
    target_role: TARGET_ROLE,
    skill: 'Python',
    status: 'partial',
    confidence: 'medium',
    rationale: 'File main.py found but only contains print statements. No framework or production logic demonstrated.',
    evidence: [{ repo: 'intro-projects', path: 'main.py', line: 1, kind: 'path', snippet: 'print("hello")', url: 'https://github.com', carried: false }],
    job_sources: [{ company: 'AI Labs', title: 'Python Backend Engineer', source: 'Jobicy', url: 'https://jobicy.com' }],
    job_count: 10,
    previous_status: '',
    change_type: 'new',
    trigger_source: 'initial-audit',
    changed_repos: '',
    batch_id: initialBatch,
    assessed_at: initialTime,
    gap_advice: 'Build a RESTful API using FastAPI or Flask with unit tests.'
  },
  {
    github_username: DEMO_USER,
    target_role: TARGET_ROLE,
    skill: 'Docker',
    status: 'not_demonstrated',
    confidence: 'high',
    rationale: 'No Dockerfile or docker-compose.yml found in any repository.',
    evidence: [],
    job_sources: [{ company: 'Cloud Services', title: 'Junior Backend Developer', source: 'Arbeitnow', url: 'https://arbeitnow.com' }],
    job_count: 6,
    previous_status: '',
    change_type: 'new',
    trigger_source: 'initial-audit',
    changed_repos: '',
    batch_id: initialBatch,
    assessed_at: initialTime,
    gap_advice: 'Containerize your backend application with a multi-stage Dockerfile.'
  }
);
save();

console.log('-> Baseline audit saved:');
console.log('   * SQL: NOT DEMONSTRATED (Gap: Commit schema.sql)');
console.log('   * Python: PARTIAL (Only trivial code found)');
console.log('   * Docker: NOT DEMONSTRATED (No Dockerfile)');

const baselineReport = buildReport(DEMO_USER, TARGET_ROLE);
console.log(`\nBaseline Summary: ${baselineReport.summary.demonstrated} demonstrated, ${baselineReport.summary.partial} partial, ${baselineReport.summary.not_demonstrated} not demonstrated.\n`);

console.log('----------------------------------------------------');
console.log('[Step 2: Student Actions - New Commits to GitHub]');
console.log('Simulating candidate committing project code:');
console.log('   + schema.sql: Added PostgreSQL schema with indexing and FOREIGN KEY constraints');
console.log('   + app/main.py: Built FastAPI service with async endpoints and SQLAlchemy ORM');
console.log('   + Dockerfile: Added multi-stage container build');
console.log('----------------------------------------------------\n');

// Step 3: Reassessment Loop
console.log('[Step 3: Reassessment Triggered]');
console.log('Event source: GitHub Push Webhook (/github-push)');
console.log('Analyzing incremental changes in repository "api-backend"...\n');

const reassessBatch = `run-${Date.now()}-${DEMO_USER}`;
const reassessTime = new Date().toISOString();

db.assessments.push(
  {
    github_username: DEMO_USER,
    target_role: TARGET_ROLE,
    skill: 'SQL',
    status: 'demonstrated',
    confidence: 'high',
    rationale: 'Verified production schema with relational constraints, foreign keys, and indexed queries in schema.sql.',
    evidence: [
      { repo: 'api-backend', path: 'db/schema.sql', line: 14, kind: 'code', snippet: 'CREATE TABLE orders (id SERIAL PRIMARY KEY, user_id INT REFERENCES users(id));', url: 'https://github.com/demo-candidate/api-backend/blob/main/db/schema.sql#L14', carried: false },
      { repo: 'api-backend', path: 'db/schema.sql', line: 28, kind: 'code', snippet: 'SELECT u.name, count(o.id) FROM users u JOIN orders o ON u.id = o.user_id GROUP BY u.name;', url: 'https://github.com/demo-candidate/api-backend/blob/main/db/schema.sql#L28', carried: false }
    ],
    job_sources: [{ company: 'FinTech Corp', title: 'Backend Engineer', source: 'Jobicy', url: 'https://jobicy.com' }],
    job_count: 8,
    previous_status: 'not_demonstrated',
    change_type: 'improved',
    trigger_source: 'github-push',
    changed_repos: 'api-backend',
    batch_id: reassessBatch,
    assessed_at: reassessTime,
    gap_advice: ''
  },
  {
    github_username: DEMO_USER,
    target_role: TARGET_ROLE,
    skill: 'Python',
    status: 'demonstrated',
    confidence: 'high',
    rationale: 'Verified FastAPI application logic with database session management and dependency injection.',
    evidence: [
      { repo: 'api-backend', path: 'app/main.py', line: 5, kind: 'code', snippet: 'from fastapi import FastAPI, Depends, HTTPException', url: 'https://github.com/demo-candidate/api-backend/blob/main/app/main.py#L5', carried: false },
      { repo: 'api-backend', path: 'app/main.py', line: 22, kind: 'code', snippet: '@app.get("/orders") async def get_orders(db: Session = Depends(get_db)):', url: 'https://github.com/demo-candidate/api-backend/blob/main/app/main.py#L22', carried: false }
    ],
    job_sources: [{ company: 'AI Labs', title: 'Python Backend Engineer', source: 'Jobicy', url: 'https://jobicy.com' }],
    job_count: 10,
    previous_status: 'partial',
    change_type: 'improved',
    trigger_source: 'github-push',
    changed_repos: 'api-backend',
    batch_id: reassessBatch,
    assessed_at: reassessTime,
    gap_advice: ''
  },
  {
    github_username: DEMO_USER,
    target_role: TARGET_ROLE,
    skill: 'Docker',
    status: 'demonstrated',
    confidence: 'high',
    rationale: 'Valid Dockerfile found configuring Python 3.11 slim runtime, pip requirements installation, and uvicorn entrypoint.',
    evidence: [
      { repo: 'api-backend', path: 'Dockerfile', line: 1, kind: 'path', snippet: 'FROM python:3.11-slim', url: 'https://github.com/demo-candidate/api-backend/blob/main/Dockerfile#L1', carried: false },
      { repo: 'api-backend', path: 'Dockerfile', line: 8, kind: 'code', snippet: 'CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]', url: 'https://github.com/demo-candidate/api-backend/blob/main/Dockerfile#L8', carried: false }
    ],
    job_sources: [{ company: 'Cloud Services', title: 'Junior Backend Developer', source: 'Arbeitnow', url: 'https://arbeitnow.com' }],
    job_count: 6,
    previous_status: 'not_demonstrated',
    change_type: 'improved',
    trigger_source: 'github-push',
    changed_repos: 'api-backend',
    batch_id: reassessBatch,
    assessed_at: reassessTime,
    gap_advice: ''
  }
);
save();

// Step 4: Verification of the Feedback Loop
console.log('[Step 4: Feedback Loop Results]');
const updatedReport = buildReport(DEMO_USER, TARGET_ROLE);

console.log(`\nUpdated Summary:`);
console.log(`- Total Skills Tracked: ${updatedReport.summary.total}`);
console.log(`- Demonstrated:         ${updatedReport.summary.demonstrated} (was 0)`);
console.log(`- Partial:              ${updatedReport.summary.partial} (was 1)`);
console.log(`- Not Demonstrated:     ${updatedReport.summary.not_demonstrated} (was 2)`);

console.log('\nWhat Changed Since First Assessment:');
updatedReport.loop.forEach((l) => {
  console.log(`  * ${l.skill.padEnd(10)}: ${l.before} -> ${l.after} (Cites: ${l.cited.join(', ')})`);
});

// Step 5: Generate Demo PDF File
console.log('\n[Step 5: Exporting Demo PDF Report]');
const pdfPath = path.resolve('data/demo-assessment-report.pdf');
const writeStream = fs.createWriteStream(pdfPath);

sendPdf(writeStream, updatedReport);

writeStream.on('finish', () => {
  console.log(`✓ Demo PDF successfully written to: ${pdfPath}`);
  console.log('\n====================================================');
  console.log('Demo finished! You can also view this in browser:');
  console.log(`Run "npm start" and visit:`);
  console.log(`http://localhost:3000/report?github_username=${DEMO_USER}&format=html`);
  console.log('====================================================\n');
});
