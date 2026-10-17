import assert from 'node:assert';
import http from 'node:http';
import fs from 'node:fs';
import {
  TAX,
  RANK,
  norm,
  strip,
  discoverRequirements,
  scrapeJobUrl,
  heuristic,
  judge,
  buildReport,
  sendPdf,
  server,
  db,
  save,
  verifyAuthorship,
  createJwt,
  verifyJwt,
  generateInterviewQuestion,
  evaluateInterviewAnswer
} from './server.js';

console.log('--- Running AI Career Coach Test Suite ---\n');

// Test 1: Taxonomy & normalizers
console.log('Test 1: Normalizer and taxonomy definitions');
assert(Array.isArray(TAX) && TAX.length >= 20, 'TAX should contain at least 20 skills');
assert.strictEqual(norm('Python 3.10!'), ' python 3 10 ');
assert.strictEqual(strip('<p>Developer with <b>React</b></p>'), ' Developer with  React  ');
console.log('✓ Normalizer & taxonomy tests passed.');

// Test 2: Heuristic Rule-Based Judge
console.log('\nTest 2: Heuristic judge logic');
const mockEvidenceDemonstrated = [
  { id: 'S0-E0', kind: 'code', snippet: 'import django' },
  { id: 'S0-E1', kind: 'code', snippet: 'from fastapi import FastAPI' }
];
const hResDemonstrated = heuristic([{ skill: 'Python', evidence: mockEvidenceDemonstrated }]);
assert.strictEqual(hResDemonstrated[0].status, 'demonstrated');
assert.strictEqual(hResDemonstrated[0].confidence, 'low');
assert.deepStrictEqual(hResDemonstrated[0].evidence_ids, ['S0-E0', 'S0-E1']);

const mockEvidencePartial = [
  { id: 'S0-E0', kind: 'path', snippet: 'main.py' }
];
const hResPartial = heuristic([{ skill: 'Python', evidence: mockEvidencePartial }]);
assert.strictEqual(hResPartial[0].status, 'partial');
console.log('✓ Heuristic judge tests passed.');

// Test 3: LLM Judge fallback
console.log('\nTest 3: Judge fallback to heuristic when no API key');
const fallbackJudgeRes = await judge('Backend Developer', 'Full assessment', [{ skill: 'Python', evidence: mockEvidenceDemonstrated }]);
assert(['demonstrated', 'partial'].includes(fallbackJudgeRes[0].status), 'Judge should return valid status');
console.log(`✓ Judge evaluation passed with status: ${fallbackJudgeRes[0].status}`);

// Test 4: Job discovery logic & Bright Data Job URL Scraping
console.log('\nTest 4: discoverRequirements live / fallback & scrapeJobUrl');
const reqs = await discoverRequirements('Software Engineer Intern');
assert(Array.isArray(reqs.skills), 'Skills should be an array');
assert(reqs.skills.length > 0, 'Should discover at least one skill requirement');
console.log(`✓ Job requirements discovered: ${reqs.skills.length} skills (e.g. ${reqs.skills.slice(0, 3).map(s => s.skill).join(', ')})`);

const invalidScraped = await scrapeJobUrl('');
assert.strictEqual(invalidScraped, null, 'Empty URL should return null');
console.log('✓ Bright Data scrapeJobUrl handles empty inputs safely.');

// Test 5: Reassessment loop & report builder
console.log('\nTest 5: Build report and reassessment diffing');
const testUser = 'test_student_' + Date.now();
const role = 'Backend Developer';

// Seed initial assessment (Batch 1)
db.assessments.push({
  github_username: testUser,
  target_role: role,
  skill: 'SQL',
  status: 'not_demonstrated',
  confidence: 'high',
  rationale: 'No SQL code found.',
  evidence: [],
  job_sources: [],
  job_count: 5,
  previous_status: '',
  change_type: 'new',
  trigger_source: 'dashboard',
  changed_repos: '',
  batch_id: 'batch-1',
  assessed_at: new Date(Date.now() - 60000).toISOString(),
  gap_advice: 'Write a schema.sql with CREATE TABLE'
});

// Seed second assessment (Batch 2 - improved)
db.assessments.push({
  github_username: testUser,
  target_role: role,
  skill: 'SQL',
  status: 'demonstrated',
  confidence: 'high',
  rationale: 'Found valid table definitions and joins.',
  evidence: [{ repo: 'my-db', path: 'schema.sql', line: 10, kind: 'code', snippet: 'CREATE TABLE users (id INT);', url: 'https://github.com', carried: false }],
  job_sources: [],
  job_count: 5,
  previous_status: 'not_demonstrated',
  change_type: 'improved',
  trigger_source: 'poll',
  changed_repos: 'my-db',
  batch_id: 'batch-2',
  assessed_at: new Date().toISOString(),
  gap_advice: ''
});
save();

const report = buildReport(testUser, role);
assert(report !== null, 'Report should be generated');
assert.strictEqual(report.summary.demonstrated, 1);
assert.strictEqual(report.loop.length, 1);
assert.strictEqual(report.loop[0].skill, 'SQL');
assert.strictEqual(report.loop[0].before, 'not_demonstrated');
assert.strictEqual(report.loop[0].after, 'demonstrated');
console.log('✓ Reassessment diffing correctly detected improvement: not_demonstrated -> demonstrated.');

// Test 6: PDF generation
console.log('\nTest 6: PDF generation verification');
await new Promise((resolve, reject) => {
  const chunks = [];
  const fakeRes = {
    writeHead: (code, headers) => {},
    write: (chunk) => chunks.push(chunk),
    end: () => {
      const totalBytes = chunks.reduce((acc, c) => acc + c.length, 0);
      assert(totalBytes > 500, `PDF output should have bytes, got ${totalBytes}`);
      resolve();
    },
    on: () => {},
    once: () => {},
    emit: () => {}
  };
  try {
    sendPdf(fakeRes, report);
  } catch (err) {
    reject(err);
  }
});
console.log('✓ PDF generated without errors.');

// Test 7: HTTP Server Endpoints
console.log('\nTest 7: HTTP Server routes');
await new Promise((resolve) => server.listen(0, resolve));
const addr = server.address();
const testPort = addr.port;
const baseUrl = `http://localhost:${testPort}`;

try {
  // Test GET /
  const homeRes = await fetch(`${baseUrl}/`);
  assert.strictEqual(homeRes.status, 200);
  const homeHtml = await homeRes.text();
  assert(homeHtml.includes('AI Career Coach') || homeHtml.includes('CommitCheck') || homeHtml.includes('root'), 'Home UI should include title or root container');

  // Test GET /report (HTML)
  const repHtmlRes = await fetch(`${baseUrl}/report?github_username=${testUser}&format=html`);
  assert.strictEqual(repHtmlRes.status, 200);
  const htmlContent = await repHtmlRes.text();
  assert(htmlContent.includes('What Changed Since First Assessment'), 'HTML report should contain diff section');

  // Test GET /report (JSON)
  const repJsonRes = await fetch(`${baseUrl}/report?github_username=${testUser}&format=json`);
  assert.strictEqual(repJsonRes.status, 200);
  const jsonContent = await repJsonRes.json();
  assert.strictEqual(jsonContent.github_username, testUser);

  // Test POST /analyze
  const postRes = await fetch(`${baseUrl}/analyze`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ github_username: 'octocat', target_role: 'Full Stack Engineer' })
  });
  assert.strictEqual(postRes.status, 202);
  const postData = await postRes.json();
  assert.strictEqual(postData.status, 'accepted');

  // Test GET /api/history
  const historyRes = await fetch(`${baseUrl}/api/history`);
  assert.strictEqual(historyRes.status, 200);
  const histData = await historyRes.json();
  assert(Array.isArray(histData.history), 'History should be an array');

  // Test GET /api/user validation
  const userNoParam = await fetch(`${baseUrl}/api/user`);
  assert.strictEqual(userNoParam.status, 400);

  // Test GET /api/auth/config
  const authConfRes = await fetch(`${baseUrl}/api/auth/config`);
  assert.strictEqual(authConfRes.status, 200);
  const authConf = await authConfRes.json();
  assert('githubClientId' in authConf && 'googleClientId' in authConf, 'Auth config should return public client IDs');

  // Test POST /api/auth/github validation
  const ghAuthNoCode = await fetch(`${baseUrl}/api/auth/github`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({}) });
  assert.strictEqual(ghAuthNoCode.status, 400);

  // Test POST /api/auth/google validation
  const googleAuthNoToken = await fetch(`${baseUrl}/api/auth/google`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({}) });
  assert.strictEqual(googleAuthNoToken.status, 400);

  // Test POST /api/auth/session (issues signed JWT)
  const sessionRes = await fetch(`${baseUrl}/api/auth/session`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: 'kunalchavan', email: 'kunal@example.com', name: 'Kunal Chavan', provider: 'github' })
  });
  assert.strictEqual(sessionRes.status, 200);
  const sessionData = await sessionRes.json();
  assert(sessionData.token && sessionData.jwt, 'Session response must contain JWT token');
  assert.strictEqual(sessionData.user.username, 'kunalchavan');

  // Test GET /api/auth/me with valid Bearer JWT
  const meRes = await fetch(`${baseUrl}/api/auth/me`, {
    headers: { Authorization: `Bearer ${sessionData.token}` }
  });
  assert.strictEqual(meRes.status, 200);
  const meData = await meRes.json();
  assert.strictEqual(meData.valid, true);
  assert.strictEqual(meData.user.username, 'kunalchavan');

  // Test GET /api/auth/me with invalid / missing token
  const meBadRes = await fetch(`${baseUrl}/api/auth/me`, {
    headers: { Authorization: 'Bearer invalid.tampered.token' }
  });
  assert.strictEqual(meBadRes.status, 401);

  // Test GET /api/authorship
  const authRes = await fetch(`${baseUrl}/api/authorship?github_username=${testUser}`);
  assert.strictEqual(authRes.status, 200);
  const authData = await authRes.json();
  assert.strictEqual(authData.external_threshold, 150);

  console.log('✓ All HTTP Server endpoints verified successfully.');
} finally {
  await new Promise((resolve) => server.close(resolve));
}

// Test 8: Multi-Layer Authorship & Anti-Plagiarism Verification Model (150 Commits by Other Developers Threshold)
console.log('\nTest 8: Multi-Layer Authorship & Anti-Plagiarism Model');
const mockForkedRepo = { name: 'forked-express', fork: true, size: 500 };
const forkResult = await verifyAuthorship('testuser', 'forked-express', mockForkedRepo);
assert(forkResult.flags.includes('FORKED_REPOSITORY'), 'Should detect forked repository');
assert.strictEqual(forkResult.metrics.external_threshold, 150, 'Threshold must be 150 external commits');

const mockSingleCommitDump = { name: 'dumped-large-project', fork: false, size: 5000 };
const dumpResult = await verifyAuthorship('testuser', 'dumped-large-project', mockSingleCommitDump);
assert.strictEqual(dumpResult.metrics.external_threshold, 150);
console.log('✓ Authorship verification logic and 150-commit threshold verified.');

// Test 9: JWT Authentication & Session Persistence Security
console.log('\nTest 9: JWT Authentication & Session Persistence Lifecycle');
const testPayload = { user: { username: 'testcandidate', email: 'test@example.com' } };
const validJwt = createJwt(testPayload, 3600);
assert(typeof validJwt === 'string' && validJwt.split('.').length === 3, 'JWT must be standard 3-segment string');

const verified = verifyJwt(validJwt);
assert.strictEqual(verified.user.username, 'testcandidate', 'JWT payload username must match');
assert(verified.exp > Math.floor(Date.now() / 1000), 'JWT expiration must be future timestamp');

// Verify tampering rejection
const tamperedJwt = validJwt.slice(0, -5) + 'abcde';
assert.strictEqual(verifyJwt(tamperedJwt), null, 'Tampered JWT must be rejected');

// Verify expired token rejection
const expiredJwt = createJwt(testPayload, -10); // expired 10 seconds ago
assert.strictEqual(verifyJwt(expiredJwt), null, 'Expired JWT must be rejected');
console.log('✓ JWT token signing, verification, and expiration security verified.');

// Test 10: "Interview Me on My Code" (Personalized Mock Technical Interviewer)
console.log('\nTest 10: Interview Me on My Code (Personalized Technical Code Defense)');
const drillQuestion = await generateInterviewQuestion({
  skill: 'PostgreSQL',
  repo: 'api-backend',
  path: 'db/schema.sql',
  line: 12,
  snippet: 'CREATE TABLE projects ( id UUID PRIMARY KEY, owner_id UUID NOT NULL );',
  role: 'Backend Developer'
});
assert(drillQuestion && drillQuestion.question, 'Drill question must be generated');
assert(drillQuestion.focus_area, 'Drill must include a focus area');
assert(Array.isArray(drillQuestion.key_concepts) && drillQuestion.key_concepts.length > 0, 'Must include key concepts');
console.log(`  ✓ Generated Question: "${drillQuestion.question.slice(0, 80)}..."`);
console.log(`  ✓ Focus Area: ${drillQuestion.focus_area}`);

const drillEvaluation = await evaluateInterviewAnswer({
  question: drillQuestion.question,
  snippet: 'CREATE TABLE projects ( id UUID PRIMARY KEY, owner_id UUID NOT NULL );',
  answer: 'I chose UUID primary keys to prevent ID enumeration attacks and allow client-side distributed ID generation without lock contention. In PostgreSQL, random UUIDs can cause B-tree index fragmentation, which can be mitigated with time-ordered UUIDv7.',
  skill: 'PostgreSQL',
  role: 'Backend Developer'
});
assert(drillEvaluation && typeof drillEvaluation.score === 'number', 'Evaluation must return a numerical score');
assert(drillEvaluation.verdict, 'Evaluation must include a hiring verdict');
assert(drillEvaluation.model_answer, 'Evaluation must provide a senior model answer');
console.log(`  ✓ Candidate Evaluated: Score ${drillEvaluation.score}/100 (${drillEvaluation.verdict})`);
console.log('✓ "Interview Me on My Code" technical drill and evaluation verified.');

console.log('\n=========================================');
console.log('All tests passed successfully! 100% Green.');
console.log('=========================================');
