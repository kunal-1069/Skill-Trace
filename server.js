import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import PDFDocument from 'pdfkit';

// Load .env file safely if present
if (typeof process.loadEnvFile === 'function' && fs.existsSync('.env')) {
  try {
    process.loadEnvFile('.env');
  } catch (e) {
    console.warn('Notice: Could not load .env file:', e.message);
  }
}

const PORT = Number(process.env.PORT) || 3000;
const GH = process.env.GITHUB_TOKEN || '';

// ---------- OpenRouter / Qwen 2.5 7B LLM Configuration ----------
const OPENROUTER_KEY = process.env.OPENROUTER_API_KEY || '';
const OPENAI_KEY = process.env.OPENAI_API_KEY || '';
export const AI_API_KEY = OPENROUTER_KEY || OPENAI_KEY;

// Default model: Qwen 2.5 7B via OpenRouter
export const MODEL =
  process.env.OPENROUTER_MODEL ||
  process.env.OPENAI_MODEL ||
  process.env.AI_MODEL ||
  (OPENAI_KEY && !OPENROUTER_KEY ? 'gpt-4o-mini' : 'qwen/qwen-2.5-7b-instruct');

export const AI_BASE_URL =
  process.env.AI_BASE_URL ||
  (OPENAI_KEY && !OPENROUTER_KEY ? 'https://api.openai.com/v1' : 'https://openrouter.ai/api/v1');

const POLL_MINUTES = Number(process.env.POLL_MINUTES || 10);
const POLL_MS = POLL_MINUTES * 60000;
const DB_FILE = 'data/db.json';

// ---------- storage ----------
fs.mkdirSync('data', { recursive: true });
export let db = { profiles: {}, repoState: {}, assessments: [] };
if (fs.existsSync(DB_FILE)) {
  try {
    const raw = fs.readFileSync(DB_FILE, 'utf8').trim();
    if (raw) db = JSON.parse(raw);
  } catch (e) {
    console.warn('Warning: Failed to parse db.json, starting with fresh data:', e.message);
  }
}
export const save = () => {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2));
  } catch (e) {
    console.error('Failed to save db.json:', e);
  }
};

// ---------- skill taxonomy ----------
export const TAX = [
  { skill: 'Python', terms: ['python', 'django', 'flask', 'fastapi', 'pytest'], exts: ['.py'] },
  { skill: 'SQL', terms: ['sql', 'postgresql', 'mysql', 'sqlite', 'group by', 'inner join', 'create table', 'insert into'], exts: ['.sql'] },
  { skill: 'JavaScript', terms: ['javascript', 'nodejs', 'node js'], exts: ['.js', '.jsx', '.mjs'] },
  { skill: 'TypeScript', terms: ['typescript'], exts: ['.ts', '.tsx'] },
  { skill: 'React', terms: ['react', 'redux', 'nextjs', 'next js'], exts: ['.jsx', '.tsx'] },
  { skill: 'Node.js', terms: ['node js', 'nodejs', 'express'], exts: [] },
  { skill: 'Java', terms: ['java', 'spring boot', 'maven', 'junit'], exts: ['.java'] },
  { skill: 'Go', terms: ['golang'], exts: ['.go'] },
  { skill: 'Rust', terms: ['rust', 'cargo'], exts: ['.rs'] },
  { skill: 'C#', terms: ['c#', 'dotnet', 'asp net'], exts: ['.cs'] },
  { skill: 'HTML/CSS', terms: ['html', 'css', 'tailwind', 'sass'], exts: ['.html', '.css', '.scss'] },
  { skill: 'Docker', terms: ['docker', 'dockerfile', 'docker compose'], exts: [] },
  { skill: 'Kubernetes', terms: ['kubernetes', 'k8s', 'helm'], exts: [] },
  { skill: 'AWS', terms: ['aws', 'amazon web services', 's3', 'lambda', 'ec2', 'dynamodb'], exts: [] },
  { skill: 'REST APIs', terms: ['rest api', 'restful', 'openapi', 'swagger'], exts: [] },
  { skill: 'GraphQL', terms: ['graphql'], exts: [] },
  { skill: 'PostgreSQL', terms: ['postgresql', 'postgres', 'psycopg2'], exts: [] },
  { skill: 'MongoDB', terms: ['mongodb', 'mongoose'], exts: [] },
  { skill: 'Redis', terms: ['redis'], exts: [] },
  { skill: 'Machine Learning', terms: ['machine learning', 'sklearn', 'scikit learn', 'tensorflow', 'pytorch', 'keras'], exts: [] },
  { skill: 'Data Analysis', terms: ['pandas', 'numpy', 'data analysis', 'jupyter'], exts: ['.ipynb'] },
  { skill: 'Testing', terms: ['pytest', 'jest', 'unit test', 'junit', 'mocha', 'cypress', 'playwright'], exts: [] },
  { skill: 'CI/CD', terms: ['ci cd', 'github actions', 'jenkins', 'gitlab ci', 'circleci'], exts: [] },
  { skill: 'Linux/Shell', terms: ['bash', 'shell scripting', 'linux'], exts: ['.sh'] },
  { skill: 'LLM / Generative AI', terms: ['llm', 'openai', 'langchain', 'generative ai', 'prompt engineering'], exts: [] },
];
export const RANK = { not_demonstrated: 0, partial: 1, demonstrated: 2 };
export const norm = (s) => ' ' + String(s || '').toLowerCase().replace(/[^a-z0-9+#]+/g, ' ').trim() + ' ';
export const strip = (h) => String(h || '').replace(/<[^>]+>/g, ' ');

// ---------- GitHub API ----------
export async function gh(path, raw = false) {
  const headers = {
    'User-Agent': 'ai-career-coach',
    Accept: raw ? 'application/vnd.github.raw+json' : 'application/vnd.github+json'
  };
  if (GH) headers.Authorization = `Bearer ${GH}`;
  try {
    const r = await fetch(`https://api.github.com${path}`, { headers });
    if (!r.ok) {
      if (r.status === 403) {
        console.warn('GitHub API rate limit or access error (403). Consider providing a GITHUB_TOKEN in .env.');
      } else if (r.status === 404) {
        console.warn(`GitHub resource not found (404): ${path}`);
      } else {
        console.warn(`GitHub API ${r.status} ${r.statusText} for ${path}`);
      }
      return null;
    }
    return raw ? r.text() : r.json();
  } catch (err) {
    console.error(`GitHub fetch error on ${path}:`, err.message);
    return null;
  }
}

// ---------- real job requirements ----------
export async function discoverRequirements(role) {
  const pool = [];
  try {
    const r = await fetch(`https://jobicy.com/api/v2/remote-jobs?count=50&tag=${encodeURIComponent(role)}`, {
      headers: { 'User-Agent': 'ai-career-coach' }
    });
    if (r.ok) {
      const j = await r.json();
      (j.jobs || []).forEach((x) => pool.push({
        source: 'Jobicy',
        title: x.jobTitle,
        company: x.companyName,
        url: x.url,
        text: `${x.jobTitle} ${strip(x.jobDescription || x.jobExcerpt)}`
      }));
    }
  } catch (e) {
    console.warn('Jobicy fetch skipped/failed:', e.message);
  }

  try {
    const r = await fetch('https://www.arbeitnow.com/api/job-board-api', {
      headers: { 'User-Agent': 'ai-career-coach' }
    });
    if (r.ok) {
      const j = await r.json();
      (j.data || []).forEach((x) => pool.push({
        source: 'Arbeitnow',
        title: x.title,
        company: x.company_name,
        url: x.url,
        text: `${x.title} ${strip(x.description)} ${(x.tags || []).join(' ')}`
      }));
    }
  } catch (e) {
    console.warn('Arbeitnow fetch skipped/failed:', e.message);
  }

  const seen = new Set();
  const uniq = pool.filter((j) => j.url && !seen.has(j.url) && seen.add(j.url));
  const stop = ['intern', 'internship', 'junior', 'entry', 'level', 'senior', 'and', 'of', 'for', 'the'];
  const toks = norm(role).trim().split(' ').filter((t) => t && !stop.includes(t));

  let jobs = uniq
    .map((j) => {
      let score = 0;
      toks.forEach((t) => {
        if (norm(j.title).includes(` ${t} `)) score += 3;
        else if (norm(j.text).includes(` ${t} `)) score += 1;
      });
      return { ...j, score };
    })
    .filter((j) => j.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 12);

  // Fallback if role token filter yielded nothing but jobs exist in pool
  if (jobs.length === 0 && uniq.length > 0) {
    jobs = uniq.slice(0, 8);
  }

  const skills = [];
  TAX.forEach((tx) => {
    const hits = jobs.filter((j) => tx.terms.map(norm).some((t) => norm(j.text).includes(t)));
    if (hits.length >= (jobs.length >= 5 ? 2 : 1)) {
      skills.push({
        ...tx,
        job_count: hits.length,
        jobs: hits.slice(0, 5).map(({ title, company, url, source }) => ({ title, company, url, source }))
      });
    }
  });

  // Fallback baseline if no job hits were found (e.g. offline/isolated environment)
  if (skills.length === 0) {
    const baseline = ['Python', 'SQL', 'JavaScript', 'TypeScript', 'React', 'Docker', 'REST APIs', 'CI/CD'];
    TAX.filter((tx) => baseline.includes(tx.skill)).forEach((tx) => {
      skills.push({
        ...tx,
        job_count: 1,
        jobs: [{ title: `${role} Requirements`, company: 'Benchmark Postings', url: 'https://jobicy.com', source: 'Taxonomy' }]
      });
    });
  }

  skills.sort((a, b) => b.job_count - a.job_count);
  return { jobs, skills: skills.slice(0, 14) };
}

// ---------- LLM judge (with rule-based fallback) ----------
export async function judge(role, scopeNote, skillsWithEvidence) {
  if (!AI_API_KEY || !MODEL) {
    return heuristic(skillsWithEvidence);
  }

  const system = 'You audit a student GitHub portfolio. For EACH skill given, decide from ONLY the supplied evidence whether it is demonstrated (meaningful real usage), partial (weak/indirect: manifest entry, trivial usage, file type only, or only carried-over evidence) or not_demonstrated (incidental). Cite evidence_ids exactly as supplied; never invent ids. A missing signal means "not demonstrated in this scope", never that the student lacks the skill. Reply as JSON: {"assessments":[{"skill","status","confidence","rationale","evidence_ids":[]}]}';

  try {
    const headers = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${AI_API_KEY}`
    };

    if (AI_BASE_URL.includes('openrouter.ai')) {
      headers['HTTP-Referer'] = 'https://github.com/ai-career-coach';
      headers['X-Title'] = 'AI Career Coach';
    }

    const r = await fetch(`${AI_BASE_URL}/chat/completions`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        model: MODEL,
        response_format: { type: 'json_object' },
        messages: [
          { role: 'system', content: system },
          { role: 'user', content: `Target role: ${role}\nScope: ${scopeNote}\nSkills (JSON):\n${JSON.stringify(skillsWithEvidence)}` }
        ]
      }),
    });

    if (!r.ok) {
      const errText = await r.text();
      console.warn(`LLM Provider (${MODEL} via ${AI_BASE_URL}) error ${r.status}: ${errText}. Using rule-based judge.`);
      return heuristic(skillsWithEvidence);
    }

    const j = await r.json();
    const content = j.choices?.[0]?.message?.content;
    if (!content) return heuristic(skillsWithEvidence);

    // Clean potential markdown fences from open-source models
    const clean = content.trim().replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '').trim();
    const parsed = JSON.parse(clean);
    return parsed.assessments || [];
  } catch (err) {
    console.warn(`Judge evaluation error with ${MODEL}, falling back to heuristic:`, err.message);
    return heuristic(skillsWithEvidence);
  }
}

export function heuristic(list) {
  return list.map((s) => {
    const code = (s.evidence || []).filter((e) => e.kind === 'code').length;
    const status = code >= 2 ? 'demonstrated' : 'partial';
    return {
      skill: s.skill,
      status,
      confidence: 'low',
      rationale: `Rule-based: ${code} code line(s) and ${(s.evidence || []).length} evidence item(s) found.`,
      evidence_ids: (s.evidence || []).map((e) => e.id)
    };
  });
}

// ---------- core analysis ----------
const SKIPD = ['node_modules/', 'dist/', 'build/', 'vendor/', '.git/', 'venv/', '__pycache__/', '.next/', 'coverage/'];
const CODE_EXT = ['.py', '.js', '.jsx', '.mjs', '.ts', '.tsx', '.java', '.go', '.rs', '.cs', '.rb', '.php', '.sql', '.sh', '.html', '.css', '.scss', '.yml', '.yaml', '.ipynb'];
const MANIFEST = ['package.json', 'requirements.txt', 'pyproject.toml', 'pom.xml', 'build.gradle', 'go.mod', 'cargo.toml', 'dockerfile', 'docker-compose.yml'];

export function latestRows(user, role) {
  const rows = db.assessments.filter((a) => a.github_username?.toLowerCase() === user.toLowerCase() && a.target_role === role);
  const last = rows.reduce((m, r) => (r.assessed_at > m ? r.assessed_at : m), '');
  return rows.filter((r) => r.assessed_at === last);
}

export async function analyze({ user, role, trigger = 'dashboard', changedRepos = [], changedFiles = [] }) {
  const u = String(user || '').trim().toLowerCase();
  db.profiles[u] = { github_username: user, target_role: role, updated_at: new Date().toISOString() };
  
  const previous = {};
  latestRows(user, role).forEach((r) => (previous[r.skill] = { status: r.status, evidence: r.evidence || [] }));

  console.log(`[Analyze] Discovering job requirements for role: "${role}"...`);
  const { skills } = await discoverRequirements(role);

  console.log(`[Analyze] Fetching GitHub repositories for user: "${user}"...`);
  const reposResponse = await gh(`/users/${user}/repos?per_page=100&sort=pushed&type=owner`);
  const allRepos = (Array.isArray(reposResponse) ? reposResponse : []).filter((r) => r.owner?.login?.toLowerCase() === u && r.size > 0);

  const incremental = changedRepos.length > 0;
  const selected = incremental
    ? allRepos.filter((r) => changedRepos.includes(r.name))
    : allRepos.filter((r) => !r.fork).slice(0, 6);

  console.log(`[Analyze] Mode: ${incremental ? 'Incremental' : 'Full'}. Scanning ${selected.length} repos: ${selected.map((r) => r.name).join(', ') || 'none'}`);

  const ev = {};
  skills.forEach((s) => (ev[s.skill] = []));
  const analysed = [];
  const freshShas = {};

  for (const r of selected) {
    const tree = await gh(`/repos/${user}/${r.name}/git/trees/${r.default_branch}?recursive=1`);
    if (!tree || !Array.isArray(tree.tree)) continue;

    analysed.push(r.name);
    const prevShas = db.repoState[`${u}/${r.name}`]?.shas || {};
    const hasPrev = Object.keys(prevShas).length > 0;
    const shas = {};
    const cands = [];
    let n = 0;

    for (const f of tree.tree) {
      if (f.type !== 'blob' || !f.path || SKIPD.some((d) => f.path.toLowerCase().includes(d))) continue;
      const sha8 = String(f.sha || '').slice(0, 8);
      if (n < 500) { shas[f.path] = sha8; n++; }
      const lp = f.path.toLowerCase();
      const base = lp.split('/').pop();
      const isManifest = MANIFEST.includes(base);
      if ((!isManifest && !CODE_EXT.some((e) => lp.endsWith(e))) || (f.size || 0) > 80000) continue;

      const changed = changedFiles.includes(f.path) || (hasPrev && prevShas[f.path] !== sha8);
      const score = (changed ? 100 : 0) + (isManifest ? 50 : 0) + (/^(src|app|lib)\//.test(lp) ? 10 : 0) - f.path.split('/').length;
      cands.push({ path: f.path, score, changed });
    }

    freshShas[r.name] = shas;

    for (const c of cands.sort((a, b) => b.score - a.score).slice(0, 12)) {
      const rawText = await gh(`/repos/${user}/${r.name}/contents/${c.path.split('/').map(encodeURIComponent).join('/')}?ref=${r.default_branch}`, true);
      const text = String(rawText || '').slice(0, 30000);
      const lines = text.split('\n');
      const lp = c.path.toLowerCase();
      const url = `${r.html_url}/blob/${r.default_branch}/${c.path}`;
      const head = lines.filter((l) => l.trim()).slice(0, 2).join(' | ').slice(0, 100);

      for (const sk of skills) {
        const list = ev[sk.skill];
        if (!list || list.length >= 8) continue;
        if ((sk.exts || []).some((e) => lp.endsWith(e))) {
          list.push({ repo: r.name, path: c.path, line: 1, kind: 'path', snippet: head, url, changed: c.changed });
        }
        let found = 0;
        for (let i = 0; i < lines.length && found < 2 && list.length < 8; i++) {
          if (lines[i].length > 400) continue;
          if (sk.terms.map(norm).some((t) => norm(lines[i]).includes(t))) {
            list.push({ repo: r.name, path: c.path, line: i + 1, kind: 'code', snippet: lines[i].trim().slice(0, 160), url: `${url}#L${i + 1}`, changed: c.changed });
            found++;
          }
        }
      }
    }
  }

  const batch = `run-${Date.now()}-${u}`;
  const now = new Date().toISOString();

  const withEv = skills.map((sk, si) => {
    let e = ev[sk.skill].slice();
    const prev = previous[sk.skill];
    if (incremental && prev) {
      (prev.evidence || []).forEach((x) => {
        if (!changedRepos.includes(x.repo) && e.length < 10) e.push({ ...x, carried: true });
      });
    }
    return { ...sk, evidence: e.map((x, k) => ({ ...x, id: `S${si}-E${k}` })) };
  });

  const scopeNote = incremental
    ? `Incremental reassessment after ${trigger}: repos ${changedRepos.join(', ')}. carried=true means evidence from unchanged repos.`
    : `Full assessment of repos: ${analysed.join(', ') || 'none found'}.`;

  const skillsToJudge = withEv
    .filter((s) => s.evidence.length)
    .map((s) => ({
      skill: s.skill,
      appears_in_jobs: s.job_count,
      evidence: s.evidence.slice(0, 8).map(({ id, repo, path, line, kind, carried, snippet }) => ({ id, repo, path, line, kind, carried: !!carried, snippet }))
    }));

  const judged = await judge(role, scopeNote, skillsToJudge);
  const byName = Object.fromEntries(judged.map((a) => [String(a.skill).toLowerCase(), a]));

  for (const s of withEv) {
    let status = 'not_demonstrated', confidence = 'n/a', rationale, evidence = [];
    const j = byName[s.skill.toLowerCase()];

    if (!s.evidence.length) {
      rationale = `No matching code, manifest or file evidence in the repositories analysed (${analysed.join(', ') || 'no accessible repos'}). Not demonstrated in this scope, not proof the student lacks the skill.`;
    } else if (!j) {
      status = 'partial';
      confidence = 'low';
      rationale = 'Evidence found but no model verdict; treat as unverified.';
      evidence = s.evidence.slice(0, 3);
    } else {
      status = RANK[j.status] !== undefined ? j.status : 'partial';
      confidence = j.confidence || 'low';
      rationale = j.rationale || '';
      evidence = s.evidence.filter((e) => (j.evidence_ids || []).includes(e.id));
      if (!evidence.length && status !== 'not_demonstrated') {
        status = status === 'demonstrated' ? 'partial' : 'not_demonstrated';
        rationale += ' (Downgraded: no valid evidence citation.)';
        evidence = s.evidence.slice(0, 2);
      }
    }

    const prev = previous[s.skill];
    let change = 'new';
    if (prev) {
      const sig = (l) => (l || []).map((e) => `${e.repo}:${e.path}`).sort().join('|');
      const curRank = RANK[status] ?? 0;
      const prevRank = RANK[prev.status] ?? 0;
      change = curRank > prevRank ? 'improved' : curRank < prevRank ? 'regressed' : sig(prev.evidence) !== sig(evidence) ? 'evidence_updated' : 'unchanged';
    }

    db.assessments.push({
      github_username: user,
      target_role: role,
      skill: s.skill,
      status,
      confidence,
      rationale,
      evidence: evidence.map(({ repo, path, line, kind, snippet, url, carried }) => ({ repo, path, line, kind, snippet, url, carried: !!carried })),
      job_sources: s.jobs || [],
      job_count: s.job_count || 0,
      previous_status: prev?.status || '',
      change_type: change,
      trigger_source: trigger,
      changed_repos: changedRepos.join(','),
      batch_id: batch,
      assessed_at: now,
      gap_advice: status === 'demonstrated' ? '' : `Not demonstrated in this scope (${analysed.join(', ') || 'none'}). Requested in ${s.job_count} sampled postings. Commit a small project that really uses ${s.skill} to a public repo.`,
    });
  }

  allRepos.filter((r) => !r.fork).forEach((r) => {
    const k = `${u}/${r.name}`;
    db.repoState[k] = { pushed_at: r.pushed_at, checked_at: now, shas: freshShas[r.name] || db.repoState[k]?.shas || {} };
  });

  save();
  console.log(`[Analyze] Completed batch ${batch}. Processed ${withEv.length} skills.`);
  return { batch, skills: withEv.length, user, role };
}

// ---------- polling ----------
let polling = false;
export async function poll() {
  if (polling) return;
  polling = true;
  try {
    for (const p of Object.values(db.profiles)) {
      const u = String(p.github_username || '').toLowerCase();
      const reposRes = await gh(`/users/${p.github_username}/repos?per_page=100&sort=pushed&type=owner`);
      const repos = (Array.isArray(reposRes) ? reposRes : []).filter((r) => r.owner?.login?.toLowerCase() === u && !r.fork && r.size > 0);
      const known = Object.keys(db.repoState).filter((k) => k.startsWith(`${u}/`));
      if (!repos.length) continue;
      if (!known.length) {
        await analyze({ user: p.github_username, role: p.target_role, trigger: 'poll-baseline' });
        continue;
      }
      const changed = repos.filter((r) => {
        const s = db.repoState[`${u}/${r.name}`];
        return !s || s.pushed_at !== r.pushed_at;
      }).map((r) => r.name);
      if (changed.length) {
        console.log(`[Poll] ${u} changed repos:`, changed);
        await analyze({ user: p.github_username, role: p.target_role, trigger: 'poll', changedRepos: changed });
      }
    }
  } catch (e) {
    console.error('[Poll error]', e);
  } finally {
    polling = false;
  }
}

if (POLL_MS > 0) {
  const pollTimer = setInterval(poll, POLL_MS);
  if (pollTimer.unref) pollTimer.unref();
}

// ---------- report ----------
export function buildReport(user, requestedRole = '') {
  const u = String(user || '').trim().toLowerCase();
  const rows = db.assessments.filter((a) => a.github_username?.toLowerCase() === u && (!requestedRole || a.target_role === requestedRole));
  if (!rows.length) return null;

  const batches = {};
  rows.forEach((r) => (batches[r.batch_id] ||= []).push(r));
  const list = Object.values(batches).sort((a, b) => (a[0].assessed_at < b[0].assessed_at ? -1 : 1));
  const latest = list[list.length - 1];
  const targetRole = latest[0].target_role;

  // Filter list to batches for the same role for accurate comparison
  const roleBatches = list.filter((b) => b[0].target_role === targetRole);
  const first = roleBatches[0];
  const skills = [...latest].sort((a, b) => (b.job_count || 0) - (a.job_count || 0));

  const loop = roleBatches.length > 1
    ? latest
        .filter((r) => first.some((f) => f.skill === r.skill && f.status !== r.status))
        .map((r) => {
          const match = first.find((f) => f.skill === r.skill);
          return {
            skill: r.skill,
            before: match?.status || 'none',
            after: r.status,
            cited: (r.evidence || []).map((e) => `${e.repo}/${e.path}`)
          };
        })
    : [];

  return {
    github_username: user,
    target_role: targetRole,
    generated_at: new Date().toISOString(),
    latest: {
      assessed_at: latest[0].assessed_at,
      trigger: latest[0].trigger_source,
      changed_repos: latest[0].changed_repos
    },
    summary: {
      total: skills.length,
      demonstrated: skills.filter((s) => s.status === 'demonstrated').length,
      partial: skills.filter((s) => s.status === 'partial').length,
      not_demonstrated: skills.filter((s) => s.status === 'not_demonstrated').length
    },
    skills,
    loop,
    timeline: roleBatches.slice().reverse().slice(0, 10).map((b) => ({
      at: b[0].assessed_at,
      trigger: b[0].trigger_source,
      repos: b[0].changed_repos,
      changes: b.filter((r) => ['improved', 'regressed', 'evidence_updated'].includes(r.change_type)).map((r) => `${r.skill}: ${r.previous_status} -> ${r.status}`)
    })),
    disclaimer: 'A missing signal means not demonstrated in the repositories analysed, not proof the student lacks the skill.'
  };
}

export function sendPdf(res, rep) {
  if (typeof res.writeHead === 'function') {
    res.writeHead(200, {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `inline; filename="career-coach-${rep.github_username}.pdf"`
    });
  }
  const d = new PDFDocument({ margin: 50 });
  d.pipe(res);

  d.fontSize(20).text('AI Career Coach - Assessment Report', { underline: true }).moveDown(0.5);
  d.fontSize(11).text(`GitHub user: ${rep.github_username}   |   Target role: ${rep.target_role}`);
  d.text(`Last assessed: ${rep.latest.assessed_at} (trigger: ${rep.latest.trigger}${rep.latest.changed_repos ? ', changed repos: ' + rep.latest.changed_repos : ''})`);
  d.moveDown();

  d.font('Helvetica-Bold').fontSize(12).text(
    `${rep.summary.demonstrated} demonstrated, ${rep.summary.partial} partial, ${rep.summary.not_demonstrated} not demonstrated of ${rep.summary.total} skills requested by real job postings.`
  ).font('Helvetica');

  if (rep.loop && rep.loop.length) {
    d.moveDown().fontSize(13).font('Helvetica-Bold').text('What changed since first assessment').font('Helvetica');
    rep.loop.forEach((l) => {
      d.fontSize(10).text(`* ${l.skill}: ${l.before} -> ${l.after} (cites ${(l.cited || []).slice(0, 4).join(', ')})`);
    });
  }

  d.moveDown().fontSize(14).font('Helvetica-Bold').text('Skill-by-Skill Audit').font('Helvetica');
  rep.skills.forEach((s) => {
    d.moveDown(0.6).font('Helvetica-Bold').fontSize(11).text(
      `${s.skill} - ${String(s.status || '').replace('_', ' ').toUpperCase()} (${s.confidence} confidence)${['improved', 'regressed', 'evidence_updated'].includes(s.change_type) ? ` [${s.change_type} from ${s.previous_status}]` : ''}`
    ).font('Helvetica').fontSize(10);

    d.text(`Requested in ${s.job_count} sampled postings.`);
    d.text(`Assessment: ${s.rationale}`);
    if (s.gap_advice) d.text(`Gap Advice: ${s.gap_advice}`);

    const evList = s.evidence || [];
    if (!evList.length) {
      d.text('Repository evidence: none found in scope.');
    } else {
      evList.slice(0, 3).forEach((e) => {
        d.text(`Evidence: ${e.repo}/${e.path} (line ${e.line})${e.carried ? ' [carried]' : ''}`).fontSize(8).text(`${e.url}\nCode: ${e.snippet}`).fontSize(10);
      });
    }

    const jobSources = s.job_sources || [];
    if (jobSources.length) {
      jobSources.slice(0, 2).forEach((j) => {
        d.fontSize(8).text(`Market Job: ${j.company || j.source} - ${j.title} (${j.source}) ${j.url}`).fontSize(10);
      });
    }
  });

  if (rep.timeline && rep.timeline.length) {
    d.moveDown().fontSize(13).font('Helvetica-Bold').text('Reassessment Timeline').font('Helvetica');
    rep.timeline.forEach((t) => {
      d.fontSize(9).text(`${t.at} via ${t.trigger}${t.repos ? ` (${t.repos})` : ''}: ${t.changes.length ? t.changes.join('; ') : 'no skill changes'}`);
    });
  }

  d.moveDown().fontSize(9).font('Helvetica-Oblique').text(rep.disclaimer);
  d.end();
}

export function renderHtmlDashboard(rep) {
  const statusColor = {
    demonstrated: '#10b981',
    partial: '#f59e0b',
    not_demonstrated: '#6b7280'
  };

  const statusBadge = (st) => {
    const col = statusColor[st] || '#6b7280';
    return `<span style="background:${col}22; color:${col}; border:1px solid ${col}; padding:3px 8px; border-radius:12px; font-weight:600; font-size:12px; text-transform:uppercase;">${String(st).replace('_', ' ')}</span>`;
  };

  const skillCards = rep.skills.map((s) => `
    <div style="background:#ffffff; border:1px solid #e5e7eb; border-radius:8px; padding:16px; margin-bottom:14px; box-shadow:0 1px 3px rgba(0,0,0,0.05);">
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">
        <h3 style="margin:0; font-size:17px; color:#111827;">${s.skill}</h3>
        <div>
          ${statusBadge(s.status)}
          <span style="font-size:12px; color:#6b7280; margin-left:8px;">Confidence: ${s.confidence}</span>
        </div>
      </div>
      <p style="margin:4px 0 8px 0; color:#374151; font-size:14px;"><strong>Assessment:</strong> ${s.rationale}</p>
      ${s.gap_advice ? `<p style="margin:4px 0 8px 0; color:#b45309; background:#fef3c7; padding:8px; border-radius:6px; font-size:13px;"><strong>Next Step:</strong> ${s.gap_advice}</p>` : ''}
      <div style="margin-top:10px;">
        <strong style="font-size:13px; color:#4b5563;">Code Evidence (${(s.evidence || []).length} found):</strong>
        ${(s.evidence || []).length === 0 ? '<div style="font-size:13px; color:#9ca3af; margin-top:4px;">No matching evidence found in public repos.</div>' : `
          <ul style="margin:6px 0 0 0; padding-left:20px; font-size:13px; color:#1f2937;">
            ${(s.evidence || []).slice(0, 4).map((e) => `
              <li style="margin-bottom:6px;">
                <a href="${e.url}" target="_blank" style="color:#2563eb; text-decoration:none; font-family:monospace;">${e.repo}/${e.path}#L${e.line}</a>
                ${e.carried ? '<span style="color:#6b7280; font-size:11px;"> (carried over)</span>' : ''}
                ${e.snippet ? `<pre style="background:#f3f4f6; padding:6px; border-radius:4px; font-size:12px; margin:4px 0; overflow-x:auto;"><code>${e.snippet.replace(/</g, '&lt;')}</code></pre>` : ''}
              </li>
            `).join('')}
          </ul>
        `}
      </div>
      ${(s.job_sources || []).length ? `
        <div style="margin-top:10px; font-size:12px; color:#6b7280;">
          <strong>Sampled Market Postings:</strong>
          ${s.job_sources.slice(0, 2).map((j) => `<span style="display:inline-block; margin-right:10px;">* <a href="${j.url}" target="_blank" style="color:#4b5563;">${j.company || j.source} (${j.title})</a></span>`).join('')}
        </div>
      ` : ''}
    </div>
  `).join('');

  const loopSection = rep.loop && rep.loop.length ? `
    <div style="background:#ecfdf5; border:1px solid #a7f3d0; border-radius:8px; padding:16px; margin-bottom:20px;">
      <h3 style="margin-top:0; color:#065f46; font-size:16px;">What Changed Since First Assessment</h3>
      <ul style="margin:0; padding-left:20px; color:#047857; font-size:14px;">
        ${rep.loop.map((l) => `<li><strong>${l.skill}</strong>: <code>${l.before}</code> &rarr; <strong>${l.after}</strong> (cites ${(l.cited || []).join(', ')})</li>`).join('')}
      </ul>
    </div>
  ` : '';

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Skill Trace - ${rep.github_username}</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; background:#f9fafb; color:#111827; margin:0; padding:24px; }
    .container { max-width: 900px; margin: 0 auto; }
    .card { background:#ffffff; border:1px solid #e5e7eb; border-radius:8px; padding:20px; margin-bottom:20px; }
    .btn { display:inline-block; background:#2563eb; color:#ffffff; padding:8px 16px; border-radius:6px; text-decoration:none; font-size:14px; font-weight:500; margin-right:8px; }
    .btn-secondary { background:#4b5563; }
  </style>
</head>
<body>
  <div class="container">
    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:20px;">
      <div>
        <h1 style="margin:0; font-size:24px;">AI Career Coach - Assessment Report</h1>
        <p style="margin:4px 0 0 0; color:#4b5563; font-size:14px;">Student: <strong>${rep.github_username}</strong> | Target Role: <strong>${rep.target_role}</strong></p>
      </div>
      <div>
        <a href="/report?github_username=${encodeURIComponent(rep.github_username)}&format=pdf" class="btn">Download PDF</a>
        <a href="/report?github_username=${encodeURIComponent(rep.github_username)}&format=json" class="btn btn-secondary">Raw JSON</a>
      </div>
    </div>

    <div class="card" style="display:flex; justify-content:space-around; text-align:center;">
      <div>
        <div style="font-size:28px; font-weight:700; color:#111827;">${rep.summary.total}</div>
        <div style="font-size:12px; color:#6b7280; text-transform:uppercase;">Skills Audited</div>
      </div>
      <div>
        <div style="font-size:28px; font-weight:700; color:#10b981;">${rep.summary.demonstrated}</div>
        <div style="font-size:12px; color:#6b7280; text-transform:uppercase;">Demonstrated</div>
      </div>
      <div>
        <div style="font-size:28px; font-weight:700; color:#f59e0b;">${rep.summary.partial}</div>
        <div style="font-size:12px; color:#6b7280; text-transform:uppercase;">Partial</div>
      </div>
      <div>
        <div style="font-size:28px; font-weight:700; color:#6b7280;">${rep.summary.not_demonstrated}</div>
        <div style="font-size:12px; color:#6b7280; text-transform:uppercase;">Not Demonstrated</div>
      </div>
    </div>

    ${loopSection}

    <h2 style="font-size:18px; margin:24px 0 12px 0;">Skill-by-Skill Audit</h2>
    ${skillCards}

    <div class="card" style="margin-top:24px; font-size:13px; color:#6b7280;">
      <strong>Note:</strong> ${rep.disclaimer}
    </div>
  </div>
</body>
</html>`;
}

export function renderHomeUI() {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>AI Career Coach - Skill Trace</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; background:#f3f4f6; color:#111827; margin:0; padding:40px 20px; }
    .container { max-width: 640px; margin: 0 auto; background:#ffffff; border-radius:12px; border:1px solid #e5e7eb; box-shadow:0 4px 6px -1px rgba(0,0,0,0.1); padding:32px; }
    h1 { font-size:24px; margin-top:0; color:#1e293b; }
    label { display:block; font-size:14px; font-weight:600; margin-bottom:6px; color:#374151; }
    input[type="text"] { width:100%; box-sizing:border-box; padding:10px 14px; border:1px solid #d1d5db; border-radius:6px; font-size:15px; margin-bottom:18px; }
    button { background:#2563eb; color:#ffffff; border:none; padding:12px 20px; border-radius:6px; font-size:15px; font-weight:600; cursor:pointer; width:100%; }
    button:hover { background:#1d4ed8; }
    .status-box { margin-top:20px; padding:16px; border-radius:8px; display:none; }
    .features { margin-top:28px; border-top:1px solid #e5e7eb; padding-top:20px; font-size:13px; color:#64748b; }
  </style>
</head>
<body>
  <div class="container">
    <h1>AI Career Coach</h1>
    <p style="color:#475569; font-size:14px; line-height:1.5; margin-bottom:24px;">
      Continuously audits your GitHub portfolio against live job market requirements. Detects changes incrementally and produces PDF reports with verifiable code citations.
    </p>

    <form id="analyzeForm">
      <div>
        <label for="github_username">GitHub Username</label>
        <input type="text" id="github_username" name="github_username" placeholder="e.g. torvalds" required>
      </div>
      <div>
        <label for="target_role">Target Role</label>
        <input type="text" id="target_role" name="target_role" value="Software Engineer Intern" required>
      </div>
      <button type="submit" id="submitBtn">Start Portfolio Audit</button>
    </form>

    <div id="statusBox" class="status-box"></div>

    <div class="features">
      <strong>How it works:</strong>
      <ol style="padding-left:18px; margin:8px 0 0 0;">
        <li>Fetches real-time job openings from Jobicy and Arbeitnow.</li>
        <li>Inspects your public GitHub code and manifest files.</li>
        <li>Evaluates skills using LLM or rule-based heuristics.</li>
        <li>Polls GitHub every 10 minutes or catches webhooks instantly at <code>/github-push</code>.</li>
      </ol>
    </div>
  </div>

  <script>
    const form = document.getElementById('analyzeForm');
    const box = document.getElementById('statusBox');
    const btn = document.getElementById('submitBtn');

    form.onsubmit = async (e) => {
      e.preventDefault();
      const user = document.getElementById('github_username').value.trim();
      const role = document.getElementById('target_role').value.trim();
      if (!user) return;

      btn.disabled = true;
      btn.textContent = 'Auditing portfolio (10-30s)...';
      box.style.display = 'block';
      box.style.background = '#eff6ff';
      box.style.border = '1px solid #bfdbfe';
      box.style.color = '#1e40af';
      box.innerHTML = '<strong>Analysis accepted!</strong> The coach is scanning repositories and job requirements...';

      try {
        const res = await fetch('/analyze', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ github_username: user, target_role: role })
        });
        const data = await res.json();
        
        box.innerHTML = \`
          <strong style="color:#065f46;">Audit Started!</strong>
          <p style="margin:8px 0;">Your profile is being assessed. Check reports in a few moments:</p>
          <div style="margin-top:10px;">
            <a href="/report?github_username=\${encodeURIComponent(user)}&format=html" style="margin-right:12px; color:#2563eb; font-weight:600;">View HTML Dashboard</a>
            <a href="/report?github_username=\${encodeURIComponent(user)}" style="margin-right:12px; color:#2563eb; font-weight:600;">Download PDF</a>
            <a href="/report?github_username=\${encodeURIComponent(user)}&format=json" style="color:#2563eb; font-weight:600;">Raw JSON</a>
          </div>
        \`;
        box.style.background = '#ecfdf5';
        box.style.border = '1px solid #a7f3d0';
      } catch (err) {
        box.style.background = '#fef2f2';
        box.style.border = '1px solid #fecaca';
        box.style.color = '#991b1b';
        box.innerHTML = 'Error initiating analysis: ' + err.message;
      } finally {
        btn.disabled = false;
        btn.textContent = 'Start Portfolio Audit';
      }
    };
  </script>
</body>
</html>`;
}

// ---------- HTTP Server ----------
const readBody = (req) =>
  new Promise((ok) => {
    let b = '';
    req.on('data', (c) => (b += c));
    req.on('end', () => {
      try {
        ok(JSON.parse(b || '{}'));
      } catch {
        ok({});
      }
    });
  });

const json = (res, code, obj) => {
  res.writeHead(code, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(obj));
};

export const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`);

  // Enable CORS for frontend clients
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    return res.end();
  }

  try {
    // Serve production Frontend build if available
    const distPath = path.resolve('Frontend/dist');
    if (fs.existsSync(distPath)) {
      if (req.method === 'GET' && url.pathname === '/') {
        const indexPath = path.join(distPath, 'index.html');
        if (fs.existsSync(indexPath)) {
          res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
          return fs.createReadStream(indexPath).pipe(res);
        }
      }

      const filePath = path.join(distPath, url.pathname);
      if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
        const ext = path.extname(filePath).toLowerCase();
        const mimeTypes = {
          '.html': 'text/html; charset=utf-8',
          '.js': 'application/javascript',
          '.css': 'text/css',
          '.svg': 'image/svg+xml',
          '.png': 'image/png',
          '.json': 'application/json',
          '.txt': 'text/plain'
        };
        res.writeHead(200, { 'Content-Type': mimeTypes[ext] || 'application/octet-stream' });
        return fs.createReadStream(filePath).pipe(res);
      }
    }

    // Root UI (fallback if frontend not built)
    if (req.method === 'GET' && url.pathname === '/') {
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      return res.end(renderHomeUI());
    }

    // API endpoint for analysis history
    if (req.method === 'GET' && url.pathname === '/api/history') {
      const history = Object.values(db.profiles).map((p) => {
        const rep = buildReport(p.github_username, p.target_role);
        return {
          repo: rep?.latest?.changed_repos || 'public-repos',
          role: p.target_role,
          date: p.updated_at ? new Date(p.updated_at).toLocaleString() : 'Recent',
          score: rep?.summary?.total ? `${Math.round((rep.summary.demonstrated / rep.summary.total) * 100)}%` : '0%',
          user: p.github_username,
          demonstrated: rep?.summary?.demonstrated || 0,
          total: rep?.summary?.total || 0
        };
      });
      return json(res, 200, { history });
    }

    // API endpoint to fetch GitHub user profile
    if (req.method === 'GET' && url.pathname === '/api/user') {
      const user = url.searchParams.get('github_username') || '';
      if (!user) return json(res, 400, { error: 'github_username parameter is required' });
      const data = await gh(`/users/${encodeURIComponent(user)}`);
      if (!data) return json(res, 404, { error: 'GitHub user not found or rate-limited' });
      return json(res, 200, {
        login: data.login,
        name: data.name || data.login,
        avatar_url: data.avatar_url || '',
        bio: data.bio || '',
        public_repos: data.public_repos || 0,
        email: data.email || `${data.login}@users.noreply.github.com`
      });
    }

    // API endpoint to dynamically retrieve a user's GitHub repositories
    if (req.method === 'GET' && url.pathname === '/api/repos') {
      const user = url.searchParams.get('github_username') || '';
      if (!user) return json(res, 400, { error: 'github_username parameter is required' });
      const raw = await gh(`/users/${encodeURIComponent(user)}/repos?per_page=100&sort=pushed&type=owner`);
      const list = Array.isArray(raw) ? raw : [];
      const repos = list.map((r) => ({
        name: r.name,
        description: r.description || '',
        language: r.language || 'Source Code',
        fork: Boolean(r.fork),
        stars: r.stargazers_count || 0,
        updated_at: r.pushed_at || ''
      }));
      return json(res, 200, { repos });
    }

    // Trigger analysis
    if (req.method === 'POST' && url.pathname === '/analyze') {
      const b = await readBody(req);
      if (!b.github_username) {
        return json(res, 400, { status: 'error', message: 'Body must include github_username (and optionally target_role).' });
      }
      const role = b.target_role || 'Software Engineer Intern';
      analyze({ user: String(b.github_username).trim(), role }).catch(console.error);
      return json(res, 202, {
        status: 'accepted',
        report_pdf: `/report?github_username=${encodeURIComponent(b.github_username)}`,
        report_html: `/report?format=html&github_username=${encodeURIComponent(b.github_username)}`,
        report_json: `/report?format=json&github_username=${encodeURIComponent(b.github_username)}`
      });
    }

    // Webhook for instant GitHub push events
    if (req.method === 'POST' && url.pathname === '/github-push') {
      const b = await readBody(req);
      if (!(b.commits || []).length) return json(res, 200, { ignored: true });
      const user = b.repository?.owner?.login || b.repository?.owner?.name;
      if (!user) return json(res, 400, { error: 'Missing repository owner in webhook payload' });

      const p = db.profiles[user.toLowerCase()];
      analyze({
        user,
        role: p?.target_role || 'Software Engineer Intern',
        trigger: 'github-push',
        changedRepos: [b.repository.name],
        changedFiles: b.commits.flatMap((c) => (c.added || []).concat(c.modified || []))
      }).catch(console.error);

      return json(res, 202, { status: 'reassessing' });
    }

    // Reports: PDF, HTML, or JSON
    if (req.method === 'GET' && url.pathname === '/report') {
      const user = url.searchParams.get('github_username') || '';
      const rep = user && buildReport(user);
      if (!rep) {
        return json(res, 404, { status: 'no_data', message: 'No assessment found for this user. POST /analyze first.' });
      }

      const fmt = (url.searchParams.get('format') || 'pdf').toLowerCase();
      if (fmt === 'json') return json(res, 200, rep);
      if (fmt === 'html') {
        res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
        return res.end(renderHtmlDashboard(rep));
      }
      return sendPdf(res, rep);
    }

    json(res, 404, { error: 'not found' });
  } catch (e) {
    console.error('Server request error:', e);
    json(res, 500, { error: String(e.message || e) });
  }
});

// Run server only if executed directly
const isDirectExecution = process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isDirectExecution) {
  server.listen(PORT, () => {
    console.log(`AI Career Coach server listening on http://localhost:${PORT}`);
    console.log(`Polling interval: ${POLL_MINUTES} minute(s) (POLL_MINUTES=${POLL_MINUTES})`);
    const provider = AI_BASE_URL.includes('openrouter.ai') ? 'OpenRouter' : 'OpenAI';
    console.log(`LLM integration: ${AI_API_KEY ? `Active (${MODEL} via ${provider})` : 'Rule-based heuristic fallback'}`);
  });
}
