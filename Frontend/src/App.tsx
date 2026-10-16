import {
  AlertCircle,
  ArrowRight,
  BarChart3,
  Bell,
  BriefcaseBusiness,
  Check,
  CheckCircle2,
  ChevronDown,
  Circle,
  Clock3,
  Code2,
  Download,
  Eye,
  EyeOff,
  FileCode2,
  GitBranch,
  History,
  LayoutDashboard,
  LoaderCircle,
  Menu,
  Moon,
  Play,
  Plus,
  Radio,
  RotateCcw,
  Search,
  Settings,
  ShieldCheck,
  Sparkles,
  Sun,
  User,
  X,
  type LucideIcon,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";

export type Page =
  | "Overview"
  | "Analyze Repository"
  | "Job Requirements"
  | "Skill Gaps"
  | "Repository Evidence"
  | "Webhook Events"
  | "Analysis History";

export type Filter = "All" | "Required" | "Preferred";
export type DialogKind = "evidence" | "profile" | "settings" | "preferences" | "help" | "signout" | null;
export type RequirementStatus = "Demonstrated" | "Partial" | "Not Demonstrated";

export type Requirement = {
  name: string;
  level: "Mandatory" | "Preferred";
  status: RequirementStatus;
  file?: string;
  code?: string;
  explanation: string;
  jobCount?: number;
  gapAdvice?: string;
};

export type UserProfile = {
  name: string;
  username: string;
  email: string;
  avatarUrl?: string;
  bio?: string;
  provider: "github" | "google" | "email";
};

export const defaultUser: UserProfile = {
  name: "Kunal Chavan",
  username: "kunalchavan",
  email: "kunal.chavan@example.com",
  bio: "Full Stack Engineer & AI Developer",
  avatarUrl: "https://github.com/kunalchavan.png",
  provider: "github",
};

export function getInitials(name: string): string {
  const parts = String(name || "").trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return "U";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export function UserAvatar({ user, className = "size-9" }: { user: UserProfile; className?: string }) {
  const [err, setErr] = useState(false);
  if (user.avatarUrl && !err) {
    return (
      <img
        src={user.avatarUrl}
        alt={user.name}
        onError={() => setErr(true)}
        className={`${className} shrink-0 rounded-full object-cover border border-neutral-200 dark:border-neutral-700`}
      />
    );
  }
  return (
    <span className={`flex ${className} shrink-0 items-center justify-center rounded-full bg-neutral-900 text-xs font-semibold text-white`}>
      {getInitials(user.name)}
    </span>
  );
}

const navItems: Array<{ label: Page; icon: LucideIcon }> = [
  { label: "Overview", icon: LayoutDashboard },
  { label: "Analyze Repository", icon: GitBranch },
  { label: "Job Requirements", icon: BriefcaseBusiness },
  { label: "Skill Gaps", icon: BarChart3 },
  { label: "Repository Evidence", icon: FileCode2 },
  { label: "Webhook Events", icon: Radio },
  { label: "Analysis History", icon: History },
];

const pageMeta: Record<Page, { title: string; subtitle: string }> = {
  Overview: { title: "Repository Analysis", subtitle: "Compare real code against real job requirements." },
  "Analyze Repository": { title: "Analyze Repository", subtitle: "Configure and run a new repository assessment." },
  "Job Requirements": { title: "Job Requirements", subtitle: "Review the capabilities extracted from live market roles." },
  "Skill Gaps": { title: "Skill Gaps", subtitle: "Prioritize missing capabilities to maximize career impact." },
  "Repository Evidence": { title: "Repository Evidence", subtitle: "Inspect the discrete code proof behind assessment results." },
  "Webhook Events": { title: "Webhook Events", subtitle: "Watch repository commits trigger instant, zero-cost re-audits." },
  "Analysis History": { title: "Analysis History", subtitle: "Review and load prior repository scans and reports." },
};

const initialLogs = [
  { time: "10:42:01", text: "Webhook listener ready on /github-push", tone: "muted" },
  { time: "10:42:02", text: "Waiting for repository push event…", tone: "muted" },
];

const baseRequirements: Requirement[] = [
  {
    name: "PostgreSQL",
    level: "Mandatory",
    status: "Demonstrated",
    file: "src/db/schema.sql (L12)",
    code: "CREATE TABLE projects (\n  id UUID PRIMARY KEY,\n  owner_id UUID NOT NULL,\n  created_at TIMESTAMPTZ DEFAULT NOW()\n);",
    explanation: "The schema defines relational tables, constraints, UUID identifiers, and PostgreSQL timestamp types.",
    jobCount: 7,
  },
  {
    name: "Docker",
    level: "Preferred",
    status: "Not Demonstrated",
    explanation: "No Dockerfile or docker-compose found in current scope.",
    jobCount: 4,
    gapAdvice: "Add a minimal multi-stage Dockerfile (FROM node:20-alpine) at the repository root.",
  },
  {
    name: "REST APIs",
    level: "Mandatory",
    status: "Demonstrated",
    file: "src/routes/projects.ts (L45)",
    code: 'router.get("/projects/:id", async (req, res) => {\n  const project = await projects.find(req.params.id);\n  res.json(project);\n});',
    explanation: "Resource-oriented routes use standard HTTP methods and return structured JSON responses.",
    jobCount: 8,
  },
  {
    name: "CI/CD",
    level: "Preferred",
    status: "Partial",
    file: ".github/workflows/checks.yml (L8)",
    code: "jobs:\n  test:\n    steps:\n      - run: pnpm test\n      - run: pnpm lint",
    explanation: "Automated test checks exist, but no deployment or release pipeline was configured.",
    jobCount: 3,
    gapAdvice: "Add a deploy or artifact build job triggered on git tag push.",
  },
];

function Button({
  children,
  onClick,
  variant = "primary",
  disabled,
  type = "button",
  className = "",
}: {
  children: ReactNode;
  onClick?: () => void;
  variant?: "primary" | "secondary" | "ghost" | "danger";
  disabled?: boolean;
  type?: "button" | "submit";
  className?: string;
}) {
  const styles = {
    primary: "bg-neutral-900 text-white border-neutral-900 hover:bg-neutral-700 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-200",
    secondary: "bg-white text-neutral-800 border-neutral-300 hover:bg-neutral-50 dark:bg-neutral-900 dark:text-neutral-200 dark:border-neutral-700 dark:hover:bg-neutral-800",
    ghost: "bg-transparent text-neutral-600 border-transparent hover:bg-neutral-100 hover:text-neutral-900 dark:text-neutral-400 dark:hover:bg-neutral-800 dark:hover:text-white",
    danger: "bg-red-600 text-white border-red-600 hover:bg-red-700",
  };
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`inline-flex min-h-9 items-center justify-center gap-2 rounded-lg border px-3.5 text-sm font-medium transition focus:outline-none focus:ring-2 focus:ring-neutral-400 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-55 ${styles[variant]} ${className}`}
    >
      {children}
    </button>
  );
}

function Panel({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <section className={`rounded-xl border border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-900 ${className}`}>{children}</section>;
}

function StatusPill({ status }: { status: RequirementStatus }) {
  const config = {
    Demonstrated: "bg-green-50 text-green-700 border-green-200 dark:bg-green-950/40 dark:text-green-300 dark:border-green-800",
    Partial: "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800",
    "Not Demonstrated": "bg-red-50 text-red-700 border-red-200 dark:bg-red-950/40 dark:text-red-300 dark:border-red-800",
  };
  return (
    <span className={`rounded-full border px-2 py-1 text-[10px] font-bold uppercase tracking-wide ${config[status]}`}>
      {status}
    </span>
  );
}

function Sidebar({
  activePage,
  setActivePage,
  open,
  onClose,
  accountOpen,
  setAccountOpen,
  setDialog,
  user,
}: {
  activePage: Page;
  setActivePage: (page: Page) => void;
  open: boolean;
  onClose: () => void;
  accountOpen: boolean;
  setAccountOpen: (open: boolean) => void;
  setDialog: (dialog: DialogKind) => void;
  user: UserProfile;
}) {
  const accountItems = [
    { label: "My Profile", description: "Identity and developer details", dialog: "profile" as const, icon: User },
    { label: "Account Settings", description: "Security and connections", dialog: "settings" as const, icon: Settings },
    { label: "Preferences", description: "Theme and notifications", dialog: "preferences" as const, icon: Circle },
    { label: "Help & Support", description: "Guides and contact options", dialog: "help" as const, icon: AlertCircle },
  ];

  const navigate = (page: Page) => {
    setActivePage(page);
    onClose();
  };

  return (
    <>
      {open && <button aria-label="Close navigation" className="fixed inset-0 z-40 bg-black/40 lg:hidden" onClick={onClose} />}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-60 flex-col border-r border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-900 transition-transform lg:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex h-20 items-center justify-between px-5">
          <button className="flex items-center gap-3 text-left" onClick={() => navigate("Overview")}>
            <span className="flex size-9 items-center justify-center rounded-lg bg-neutral-900 text-white dark:bg-white dark:text-neutral-950">
              <GitBranch size={18} />
            </span>
            <span>
              <span className="block text-sm font-semibold text-neutral-900 dark:text-white">CommitCheck</span>
              <span className="mt-0.5 block text-[9px] font-bold tracking-[0.16em] text-neutral-400">DEVELOPER TOOLS</span>
            </span>
          </button>
          <button className="rounded-md p-1 text-neutral-500 hover:bg-neutral-100 dark:hover:bg-neutral-800 lg:hidden" onClick={onClose} aria-label="Close menu">
            <X size={18} />
          </button>
        </div>
        <nav className="flex-1 space-y-1 px-3 py-3" aria-label="Primary navigation">
          {navItems.map(({ label, icon: Icon }) => (
            <button
              key={label}
              onClick={() => navigate(label)}
              className={`relative flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm transition ${
                activePage === label
                  ? "bg-neutral-100 font-medium text-neutral-950 dark:bg-neutral-800 dark:text-white before:absolute before:-left-3 before:h-5 before:w-0.5 before:bg-neutral-900 dark:before:bg-white"
                  : "text-neutral-600 hover:bg-neutral-50 hover:text-neutral-950 dark:text-neutral-400 dark:hover:bg-neutral-800/60 dark:hover:text-white"
              }`}
            >
              <Icon size={17} strokeWidth={1.8} />
              {label}
            </button>
          ))}
        </nav>
        <div className="relative border-t border-neutral-200 dark:border-neutral-800 p-3">
          {accountOpen && (
            <div className="absolute bottom-[calc(100%+8px)] left-3 w-72 overflow-hidden rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 p-2 shadow-2xl">
              <div className="border-b border-neutral-100 dark:border-neutral-800 px-2.5 pb-2.5 pt-1.5 flex items-center gap-3">
                <UserAvatar user={user} className="size-8" />
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-semibold text-neutral-900 dark:text-white truncate">{user.name}</p>
                  <p className="mt-0.5 text-[11px] text-neutral-500 dark:text-neutral-400 truncate">@{user.username} · {user.provider.toUpperCase()} plan</p>
                </div>
              </div>
              {accountItems.map(({ label, description, dialog, icon: Icon }) => (
                <button
                  key={label}
                  onClick={() => {
                    setDialog(dialog);
                    setAccountOpen(false);
                  }}
                  className="mt-1 flex w-full items-start gap-3 rounded-lg px-2.5 py-2 text-left text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800"
                >
                  <Icon size={16} className="mt-0.5 shrink-0" />
                  <span>
                    <span className="block text-sm font-medium">{label}</span>
                    <span className="mt-0.5 block text-[11px] text-neutral-500 dark:text-neutral-400">{description}</span>
                  </span>
                </button>
              ))}
              <div className="my-1 border-t border-neutral-100 dark:border-neutral-800" />
              <button
                onClick={() => {
                  setDialog("signout");
                  setAccountOpen(false);
                }}
                className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40"
              >
                <ArrowRight size={15} /> Sign Out
              </button>
            </div>
          )}
          <button
            onClick={() => setAccountOpen(!accountOpen)}
            className="flex w-full items-center gap-3 rounded-lg p-2 text-left hover:bg-neutral-50 dark:hover:bg-neutral-800"
            aria-expanded={accountOpen}
          >
            <UserAvatar user={user} className="size-9" />
            <span className="min-w-0 flex-1">
              <span className="block truncate text-sm font-medium text-neutral-900 dark:text-white">{user.name}</span>
              <span className="block truncate text-xs text-neutral-500 dark:text-neutral-400">@{user.username}</span>
            </span>
            <ChevronDown size={15} className={`text-neutral-400 transition ${accountOpen ? "rotate-180" : ""}`} />
          </button>
        </div>
      </aside>
    </>
  );
}

function Header({
  activePage,
  onMenu,
  onNewAnalysis,
  theme,
  onToggleTheme,
}: {
  activePage: Page;
  onMenu: () => void;
  onNewAnalysis: () => void;
  theme: "light" | "dark";
  onToggleTheme: () => void;
}) {
  const meta = pageMeta[activePage];
  return (
    <header className="mb-7">
      <div className="mb-5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button className="rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-2 text-neutral-700 dark:text-neutral-300 lg:hidden" onClick={onMenu} aria-label="Open menu">
            <Menu size={19} />
          </button>
          <p className="text-sm text-neutral-500 dark:text-neutral-400">
            CommitCheck <span className="px-1 text-neutral-300 dark:text-neutral-700">/</span> <span className="text-neutral-800 dark:text-neutral-200">{activePage}</span>
          </p>
        </div>
        <button
          onClick={onToggleTheme}
          className="inline-flex h-9 items-center gap-2 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 px-3 text-xs font-medium text-neutral-700 dark:text-neutral-200 transition hover:bg-neutral-50 dark:hover:bg-neutral-800"
          aria-label={`Switch to ${theme === "light" ? "dark" : "light"} theme`}
        >
          {theme === "light" ? <Moon size={15} /> : <Sun size={15} />}
          <span className="hidden sm:inline">{theme === "light" ? "Dark" : "Light"}</span>
        </button>
      </div>
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-neutral-950 dark:text-white sm:text-3xl">{meta.title}</h1>
          <p className="mt-1.5 text-sm text-neutral-500 dark:text-neutral-400">{meta.subtitle}</p>
        </div>
        <Button onClick={onNewAnalysis} className="w-full sm:w-auto">
          <Plus size={16} /> New Analysis
        </Button>
      </div>
    </header>
  );
}

export const TARGET_ROLES: string[] = [
  // Software Engineering & Web Development
  "Software Engineer",
  "Software Engineer Intern",
  "Junior Software Engineer",
  "Senior Software Engineer",
  "Staff Software Engineer",
  "Backend Developer",
  "Backend Engineer",
  "Frontend Developer",
  "Frontend Engineer",
  "Full Stack Engineer",
  "Full Stack Developer",
  "Web Developer",
  "API Engineer",

  // Artificial Intelligence, Machine Learning & Data
  "AI Engineer",
  "AI Engineer Intern",
  "Machine Learning Engineer",
  "Generative AI / LLM Engineer",
  "Deep Learning Engineer",
  "Computer Vision Engineer",
  "NLP Engineer",
  "Data Scientist",
  "Data Science Intern",
  "Data Engineer",
  "Data Analyst",
  "Business Intelligence (BI) Analyst",
  "MLOps Engineer",
  "AI Research Scientist",

  // Cloud, Infrastructure & DevOps
  "DevOps Engineer",
  "Cloud Engineer",
  "Cloud Architect",
  "Site Reliability Engineer (SRE)",
  "Platform Engineer",
  "Infrastructure Engineer",
  "Kubernetes Administrator",
  "Database Administrator (DBA)",
  "Systems Administrator",

  // Mobile App Development
  "Mobile App Developer",
  "iOS Developer",
  "Android Developer",
  "React Native Developer",
  "Flutter Developer",

  // Systems, Embedded & Hardware
  "Systems Software Engineer",
  "Embedded Systems Engineer",
  "Firmware Engineer",
  "IoT Developer",
  "Rust Systems Developer",
  "C / C++ Developer",

  // Cybersecurity & Information Security
  "Cybersecurity Engineer",
  "Information Security Analyst",
  "Application Security Engineer (AppSec)",
  "DevSecOps Engineer",
  "Penetration Tester / Ethical Hacker",
  "Security Operations (SOC) Analyst",
  "Cryptography Engineer",

  // Quality Assurance & Automation
  "QA Automation Engineer",
  "SDET (Software Development Engineer in Test)",
  "QA Test Engineer",
  "Performance & Load Test Engineer",

  // Game Development & Graphics
  "Game Developer",
  "Unity Developer",
  "Unreal Engine Developer",
  "3D Graphics Programmer",

  // Blockchain & Web3
  "Blockchain Developer",
  "Smart Contract Engineer",
  "Web3 Full Stack Developer",

  // Architecture & Technical Leadership
  "Solutions Architect",
  "Enterprise Architect",
  "Technical Product Manager",
  "Engineering Manager",
  "Developer Relations / DevRel",
];

function AnalysisForm({
  user,
  onComplete,
  resetSignal,
  onSelectRepo,
}: {
  user: UserProfile;
  onComplete: (data?: { handle: string; role: string; report: any; repo: string; jobUrl?: string }) => void;
  resetSignal: number;
  onSelectRepo?: (repo: string) => void;
}) {
  const [handle, setHandle] = useState(user.username || "demo-candidate");
  const [role, setRole] = useState("Backend Developer");
  const [repo, setRepo] = useState("all");
  const [jobUrl, setJobUrl] = useState("");
  const [repos, setRepos] = useState<Array<{ name: string; language: string; description?: string }>>([]);
  const [loadingRepos, setLoadingRepos] = useState(false);
  const [errors, setErrors] = useState<{ handle?: string; role?: string; jobUrl?: string }>({});
  const [loading, setLoading] = useState(false);
  const [statusMsg, setStatusMsg] = useState("");
  const [success, setSuccess] = useState(false);
  const handleRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (user.username) {
      setHandle(user.username);
    }
  }, [user.username]);

  useEffect(() => {
    const trimmed = handle.trim();
    if (!trimmed) {
      setRepos([]);
      return;
    }
    setLoadingRepos(true);
    const timer = setTimeout(() => {
      fetch(`/api/repos?github_username=${encodeURIComponent(trimmed)}`)
        .then((res) => (res.ok ? res.json() : null))
        .then((data) => {
          setLoadingRepos(false);
          if (data && Array.isArray(data.repos) && data.repos.length > 0) {
            setRepos(data.repos);
            setRepo(data.repos[0].name);
            if (onSelectRepo) onSelectRepo(data.repos[0].name);
          } else {
            setRepos([]);
            setRepo("all");
          }
        })
        .catch(() => {
          setLoadingRepos(false);
          setRepos([]);
        });
    }, 450);
    return () => clearTimeout(timer);
  }, [handle, onSelectRepo]);

  useEffect(() => {
    if (resetSignal > 0) {
      setHandle(user.username || "demo-candidate");
      setRole("Backend Developer");
      setRepo("all");
      setJobUrl("");
      setErrors({});
      setSuccess(false);
      setStatusMsg("");
      setTimeout(() => handleRef.current?.focus(), 50);
    }
  }, [resetSignal, user.username]);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    const next: { handle?: string; role?: string; jobUrl?: string } = {};
    if (!handle.trim()) next.handle = "GitHub handle is required.";
    else if (!/^[a-z\d](?:[a-z\d-]{0,37}[a-z\d])?$/i.test(handle.trim())) next.handle = "Enter a valid GitHub username.";
    if (!role.trim()) next.role = "Target role is required.";
    if (jobUrl.trim() && !/^https?:\/\//i.test(jobUrl.trim())) next.jobUrl = "Job URL must start with http:// or https://";
    setErrors(next);
    setSuccess(false);
    if (Object.keys(next).length) return;

    setLoading(true);
    setStatusMsg(jobUrl.trim() ? "Scraping target job URL with Bright Data & analyzing repositories..." : "Submitting portfolio audit to backend...");

    try {
      const postRes = await fetch("/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          github_username: handle.trim(),
          target_role: role.trim(),
          job_url: jobUrl.trim(),
          changedRepos: repo && repo !== "all" ? [repo] : [],
        }),
      });
      if (!postRes.ok) throw new Error("Backend rejected request");

      setStatusMsg(jobUrl.trim() ? "Extracting requirements from Bright Data scrape & auditing GitHub..." : "Scanning repositories & market job requirements...");

      let attempts = 0;
      const interval = setInterval(async () => {
        attempts++;
        try {
          const res = await fetch(`/report?github_username=${encodeURIComponent(handle.trim())}&format=json`);
          if (res.ok) {
            const report = await res.json();
            clearInterval(interval);
            setLoading(false);
            setSuccess(true);
            setStatusMsg(`Analysis complete! Found ${report.summary?.total || report.skills?.length || 0} skills.`);
            onComplete({ handle: handle.trim(), role: role.trim(), report, repo, jobUrl: jobUrl.trim() });
          } else if (attempts >= 25) {
            clearInterval(interval);
            setLoading(false);
            setSuccess(true);
            onComplete();
          }
        } catch {
          if (attempts >= 25) {
            clearInterval(interval);
            setLoading(false);
            onComplete();
          }
        }
      }, 1500);
    } catch {
      setTimeout(() => {
        setLoading(false);
        setSuccess(true);
        onComplete();
      }, 1200);
    }
  };

  return (
    <Panel className="p-5 sm:p-6">
      <div className="mb-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div>
          <h2 className="text-base font-semibold text-neutral-950 dark:text-white">Analysis Configuration</h2>
          <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">Choose candidate repository, target role, or paste a live job URL to scrape.</p>
        </div>
        {loadingRepos && (
          <span className="inline-flex items-center gap-1.5 text-xs text-neutral-500 dark:text-neutral-400">
            <LoaderCircle size={13} className="animate-spin text-neutral-700 dark:text-neutral-300" />
            Fetching repositories from GitHub…
          </span>
        )}
      </div>
      <form onSubmit={submit}>
        <div className="grid gap-4 xl:grid-cols-[1fr_1.35fr_1.2fr_auto] xl:items-start">
          <label className="block">
            <span className="mb-1.5 block text-xs font-medium text-neutral-700 dark:text-neutral-300">GitHub Handle</span>
            <input
              ref={handleRef}
              value={handle}
              onChange={(event) => setHandle(event.target.value)}
              placeholder="e.g. kunalchavan, octocat"
              className={`h-10 w-full rounded-lg border bg-white dark:bg-neutral-950 px-3 text-sm text-neutral-900 dark:text-white outline-none transition placeholder:text-neutral-400 focus:ring-2 focus:ring-neutral-200 dark:focus:ring-neutral-800 ${
                errors.handle ? "border-red-400" : "border-neutral-300 dark:border-neutral-700 focus:border-neutral-500"
              }`}
            />
            {errors.handle && <span className="mt-1.5 flex items-center gap-1 text-xs text-red-600 dark:text-red-400"><AlertCircle size={12} />{errors.handle}</span>}
          </label>
          <label className="block">
            <span className="mb-1.5 block text-xs font-medium text-neutral-700 dark:text-neutral-300">Target Role</span>
            <div className="relative">
              <input
                list="roles-list"
                value={role}
                onChange={(event) => setRole(event.target.value)}
                placeholder="Select or type any target role..."
                className={`h-10 w-full rounded-lg border bg-white dark:bg-neutral-950 px-3 text-sm text-neutral-900 dark:text-white outline-none transition placeholder:text-neutral-400 focus:ring-2 focus:ring-neutral-200 dark:focus:ring-neutral-800 ${
                  errors.role ? "border-red-400" : "border-neutral-300 dark:border-neutral-700 focus:border-neutral-500"
                }`}
              />
              <datalist id="roles-list">
                {TARGET_ROLES.map((r) => (
                  <option key={r} value={r} />
                ))}
              </datalist>
            </div>
            {errors.role && <span className="mt-1.5 flex items-center gap-1 text-xs text-red-600 dark:text-red-400"><AlertCircle size={12} />{errors.role}</span>}
            <div className="mt-1.5 flex flex-wrap items-center gap-1.5 text-[11px] text-neutral-500">
              <span className="text-[10px] font-medium text-neutral-400">Quick:</span>
              {[
                { label: "AI Engineer", value: "AI Engineer" },
                { label: "Full Stack", value: "Full Stack Engineer" },
                { label: "Backend", value: "Backend Developer" },
                { label: "Frontend", value: "Frontend Developer" },
                { label: "DevOps", value: "DevOps Engineer" },
                { label: "Intern", value: "Software Engineer Intern" },
                { label: "Security", value: "Cybersecurity Engineer" },
              ].map(({ label, value }) => (
                <button
                  key={label}
                  type="button"
                  onClick={() => setRole(value)}
                  className={`rounded px-1.5 py-0.5 text-[10px] transition ${
                    role === value
                      ? "bg-neutral-900 text-white dark:bg-white dark:text-neutral-950 font-semibold"
                      : "bg-neutral-100 hover:bg-neutral-200 text-neutral-600 dark:bg-neutral-800 dark:hover:bg-neutral-700 dark:text-neutral-300"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </label>
          <label className="block">
            <span className="mb-1.5 flex items-center justify-between text-xs font-medium text-neutral-700 dark:text-neutral-300">
              <span>Repository</span>
              <span className="text-[11px] text-neutral-400">{repos.length} found</span>
            </span>
            <select
              value={repo}
              onChange={(event) => {
                setRepo(event.target.value);
                if (onSelectRepo) onSelectRepo(event.target.value);
              }}
              className="h-10 w-full rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-950 px-3 text-sm text-neutral-800 dark:text-neutral-200 outline-none focus:border-neutral-500 focus:ring-2 focus:ring-neutral-200 dark:focus:ring-neutral-800"
            >
              <option value="all">⚡ All public repositories (Full Portfolio Audit)</option>
              {repos.map((r) => (
                <option key={r.name} value={r.name}>
                  {r.name} {r.language ? `(${r.language})` : ""}
                </option>
              ))}
            </select>
          </label>
          <Button type="submit" disabled={loading} className="mt-0 w-full xl:mt-[26px] xl:w-auto">
            {loading ? <><LoaderCircle size={16} className="animate-spin" /> Analyzing…</> : <><Play size={15} /> Run Analysis</>}
          </Button>
        </div>

        {/* Live Job Posting URL for Bright Data Online Scraping */}
        <div className="mt-3.5 pt-3.5 border-t border-neutral-200/80 dark:border-neutral-800">
          <label className="block">
            <div className="mb-1.5 flex flex-wrap items-center justify-between gap-2">
              <span className="text-xs font-medium text-neutral-700 dark:text-neutral-300 flex items-center gap-1.5">
                <span>Job Posting URL</span>
                <span className="text-[11px] text-neutral-400">(Paste any live job vacancy link to scrape online)</span>
              </span>
              <span className="inline-flex items-center gap-1 rounded bg-amber-500/10 px-2 py-0.5 text-[10px] font-semibold text-amber-700 dark:text-amber-300 border border-amber-500/20">
                <Sparkles size={11} className="text-amber-500" /> Bright Data Scraping API Active
              </span>
            </div>
            <div className="relative">
              <input
                type="url"
                value={jobUrl}
                onChange={(event) => setJobUrl(event.target.value)}
                placeholder="e.g. https://www.linkedin.com/jobs/view/... or Greenhouse, Lever, Indeed link"
                className={`h-10 w-full rounded-lg border bg-white dark:bg-neutral-950 px-3 pr-28 text-sm text-neutral-900 dark:text-white outline-none transition placeholder:text-neutral-400 focus:ring-2 focus:ring-neutral-200 dark:focus:ring-neutral-800 ${
                  errors.jobUrl ? "border-red-400" : "border-neutral-300 dark:border-neutral-700 focus:border-neutral-500"
                }`}
              />
              {jobUrl.trim() && (
                <span className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded bg-neutral-100 dark:bg-neutral-800 px-2 py-0.5 text-[10px] font-medium text-neutral-600 dark:text-neutral-300">
                  Ready to scrape
                </span>
              )}
            </div>
            {errors.jobUrl && (
              <span className="mt-1.5 flex items-center gap-1 text-xs text-red-600 dark:text-red-400">
                <AlertCircle size={12} />{errors.jobUrl}
              </span>
            )}
            <p className="mt-1 text-[11px] text-neutral-500 dark:text-neutral-400">
              Bright Data Web Unlocker scrapes this URL in real-time to extract job title, hiring company, and skill requirements.
            </p>
          </label>
        </div>
        {statusMsg && (
          <div className={`mt-4 flex items-center gap-2 rounded-lg border px-3 py-2.5 text-xs ${
            success ? "border-green-200 bg-green-50 text-green-800 dark:border-green-900 dark:bg-green-950/50 dark:text-green-300" : "border-blue-200 bg-blue-50 text-blue-800 dark:border-blue-900 dark:bg-blue-950/50 dark:text-blue-300"
          }`}>
            {loading ? <LoaderCircle size={14} className="animate-spin shrink-0" /> : <CheckCircle2 size={14} className="shrink-0" />}
            {statusMsg}
          </div>
        )}
      </form>
    </Panel>
  );
}

function Metrics({
  summary,
  webhookComplete,
}: {
  summary?: { total: number; demonstrated: number; partial: number; not_demonstrated: number };
  webhookComplete: boolean;
}) {
  const metrics = [
    { label: "Requirements Found", value: summary?.total ?? 12, icon: Search, color: "text-blue-600 bg-blue-50 dark:text-blue-400 dark:bg-blue-950/50" },
    { label: "Demonstrated", value: summary ? summary.demonstrated : (webhookComplete ? 9 : 8), icon: Check, color: "text-green-600 bg-green-50 dark:text-green-400 dark:bg-green-950/50" },
    { label: "Partial Match", value: summary ? summary.partial : 2, icon: Circle, color: "text-amber-600 bg-amber-50 dark:text-amber-400 dark:bg-amber-950/50" },
    { label: "Missing Skills", value: summary ? summary.not_demonstrated : (webhookComplete ? 1 : 2), icon: AlertCircle, color: "text-red-600 bg-red-50 dark:text-red-400 dark:bg-red-950/50" },
  ];
  return (
    <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
      {metrics.map(({ label, value, icon: Icon, color }) => (
        <Panel key={label} className="flex items-center justify-between p-4 sm:p-5">
          <div>
            <p className="text-xs font-medium text-neutral-500 dark:text-neutral-400">{label}</p>
            <p className="mt-1 text-2xl font-semibold tracking-tight text-neutral-950 dark:text-white">{value}</p>
          </div>
          <span className={`flex size-9 items-center justify-center rounded-lg ${color}`}><Icon size={18} /></span>
        </Panel>
      ))}
    </div>
  );
}

function RequirementsPanel({
  requirements,
  selected,
  onSelect,
  filter,
  setFilter,
}: {
  requirements: Requirement[];
  selected: string;
  onSelect: (name: string) => void;
  filter: Filter;
  setFilter: (filter: Filter) => void;
}) {
  const visible = requirements.filter((item) => filter === "All" || (filter === "Required" ? item.level === "Mandatory" : item.level === "Preferred"));
  return (
    <Panel className="overflow-hidden">
      <div className="flex flex-col gap-4 border-b border-neutral-200 dark:border-neutral-800 p-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-base font-semibold text-neutral-950 dark:text-white">Job Requirements</h2>
          <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">Extracted from live remote market postings</p>
        </div>
        <div className="flex rounded-lg bg-neutral-100 dark:bg-neutral-800 p-1">
          {(["All", "Required", "Preferred"] as Filter[]).map((item) => (
            <button
              key={item}
              onClick={() => setFilter(item)}
              className={`rounded-md px-2.5 py-1.5 text-xs font-medium transition ${
                filter === item ? "bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white shadow-sm" : "text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white"
              }`}
            >
              {item}
            </button>
          ))}
        </div>
      </div>
      <div className="space-y-2 p-3 max-h-[580px] overflow-y-auto">
        {visible.map((item) => (
          <button
            key={item.name}
            onClick={() => onSelect(item.name)}
            className={`w-full rounded-lg border p-3.5 text-left transition ${
              selected === item.name
                ? "border-neutral-900 bg-neutral-50 dark:border-white dark:bg-neutral-800 ring-1 ring-neutral-900 dark:ring-white"
                : "border-neutral-200 dark:border-neutral-800 hover:border-neutral-300 dark:hover:border-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-800/50"
            }`}
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-neutral-900 dark:text-white">{item.name}</p>
                <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">
                  {item.level} {item.jobCount ? `· Mentioned in ${item.jobCount} live jobs` : ""}
                </p>
              </div>
              <StatusPill status={item.status} />
            </div>
          </button>
        ))}
      </div>
    </Panel>
  );
}

function EvidencePanel({
  requirement,
  onView,
  onDownload,
  reportStatus,
}: {
  requirement: Requirement;
  onView: () => void;
  onDownload: () => void;
  reportStatus: "idle" | "generating" | "done";
}) {
  const hasEvidence = Boolean(requirement.file);
  return (
    <Panel className="flex min-h-[420px] flex-col overflow-hidden">
      <div className="flex flex-col gap-3 border-b border-neutral-200 dark:border-neutral-800 p-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-base font-semibold text-neutral-950 dark:text-white">Repository Evidence</h2>
          <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">Discrete code proof for {requirement.name}</p>
        </div>
        <Button variant="secondary" onClick={onDownload} disabled={reportStatus === "generating"} className="w-full sm:w-auto">
          {reportStatus === "generating" ? (
            <><LoaderCircle size={15} className="animate-spin" /> Generating…</>
          ) : reportStatus === "done" ? (
            <><Check size={15} /> PDF Downloaded</>
          ) : (
            <><Download size={15} /> Download PDF Report</>
          )}
        </Button>
      </div>
      <div className="flex flex-1 flex-col p-5">
        {hasEvidence ? (
          <>
            <div className="mb-4 flex items-center justify-between gap-3">
              <div className="flex min-w-0 items-center gap-2 text-sm font-medium text-neutral-800 dark:text-neutral-200">
                <FileCode2 size={16} className="shrink-0 text-neutral-500" />
                <span className="truncate">{requirement.file}</span>
              </div>
              <span className="shrink-0 rounded-full bg-green-50 dark:bg-green-950/50 px-2 py-1 text-[10px] font-bold tracking-wide text-green-700 dark:text-green-300">MATCH VERIFIED</span>
            </div>
            <pre className="flex-1 max-h-[380px] overflow-auto rounded-lg bg-neutral-950 p-4 font-mono text-xs leading-6 text-neutral-300">
              <code>{requirement.code}</code>
            </pre>
            <p className="mt-4 text-sm leading-6 text-neutral-600 dark:text-neutral-400 whitespace-pre-line">{requirement.explanation}</p>
            {requirement.gapAdvice && (
              <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs leading-5 text-amber-900 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-300">
                <span className="font-semibold block mb-0.5">Gap Advice:</span>
                {requirement.gapAdvice}
              </div>
            )}
            <Button variant="secondary" onClick={onView} className="mt-4 self-start">
              <FileCode2 size={15} /> Expand Code View
            </Button>
          </>
        ) : (
          <div className="flex flex-1 flex-col items-center justify-center py-12 text-center">
            <span className="mb-4 flex size-12 items-center justify-center rounded-full bg-red-50 dark:bg-red-950/50 text-red-600 dark:text-red-400"><AlertCircle size={22} /></span>
            <span className="rounded-full bg-red-50 dark:bg-red-950/50 px-2 py-1 text-[10px] font-bold tracking-wide text-red-700 dark:text-red-300">NO EVIDENCE IN CURRENT REPOS</span>
            <p className="mt-4 max-w-sm text-sm leading-6 text-neutral-500 dark:text-neutral-400">{requirement.explanation}</p>
            {requirement.gapAdvice && (
              <div className="mt-4 max-w-sm rounded-lg border border-amber-200 bg-amber-50 dark:border-amber-900 dark:bg-amber-950/40 p-3 text-xs text-left text-amber-900 dark:text-amber-300">
                <span className="font-semibold block mb-1">Recommended Action:</span>
                {requirement.gapAdvice}
              </div>
            )}
          </div>
        )}
      </div>
    </Panel>
  );
}

function WebhookPanel({
  complete,
  processing,
  logs,
  simulate,
  reset,
}: {
  complete: boolean;
  processing: boolean;
  logs: typeof initialLogs;
  simulate: () => void;
  reset: () => void;
}) {
  const status = complete ? "COMPLETED" : processing ? "PROCESSING" : "WAITING";
  const statusColor = complete ? "text-green-700 bg-green-50 dark:bg-green-950/50 dark:text-green-300" : processing ? "text-amber-700 bg-amber-50 dark:bg-amber-950/50 dark:text-amber-300" : "text-neutral-600 bg-neutral-100 dark:bg-neutral-800 dark:text-neutral-400";
  return (
    <Panel className="overflow-hidden">
      <div className="flex flex-col gap-4 border-b border-neutral-200 dark:border-neutral-800 p-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2.5">
            <h2 className="text-base font-semibold text-neutral-950 dark:text-white">Git Push Webhook Simulation</h2>
            <span className={`rounded-full px-2 py-1 text-[10px] font-bold tracking-wide ${statusColor}`}>{status}</span>
          </div>
          <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">Preview how an incoming git commit triggers incremental SHA-8 diff evaluation with zero redundant AI cost.</p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row">
          <Button onClick={simulate} disabled={processing || complete}>
            {processing ? <LoaderCircle size={15} className="animate-spin" /> : <Radio size={15} />}
            {complete ? "Webhook Complete" : processing ? "Processing…" : "Simulate Push Webhook"}
          </Button>
          <Button variant="secondary" onClick={reset}><RotateCcw size={15} /> Reset Demo</Button>
        </div>
      </div>
      <div className="p-4 sm:p-5">
        <div className="overflow-x-auto rounded-lg bg-neutral-950 p-4 font-mono text-xs leading-6 text-neutral-300">
          <div className="mb-3 flex items-center gap-1.5 border-b border-neutral-800 pb-3">
            <span className="size-2 rounded-full bg-red-500" />
            <span className="size-2 rounded-full bg-amber-400" />
            <span className="size-2 rounded-full bg-green-500" />
            <span className="ml-2 text-[10px] uppercase tracking-widest text-neutral-500">commitcheck events</span>
          </div>
          <div className="min-w-[520px]">
            {logs.map((log, index) => (
              <div key={`${log.time}-${index}`} className={log.tone === "success" ? "text-green-400" : log.tone === "active" ? "text-blue-400" : ""}>
                <span className="mr-3 text-neutral-600">{log.time}</span>
                <span>{log.tone === "success" ? "✓" : "›"} {log.text}</span>
              </div>
            ))}
            {processing && <div className="animate-pulse"><span className="mr-3 text-neutral-600">now</span><span className="text-amber-300">› Slicing modified files & evaluating incremental diff…</span></div>}
          </div>
        </div>
      </div>
    </Panel>
  );
}

function HistoryPanel({ onSelectUser }: { onSelectUser?: (user: string, role: string) => void }) {
  const [rows, setRows] = useState([
    { repo: "all-repositories", role: "Backend Developer", date: "Today", score: "86%", user: "kunalchavan" },
    { repo: "public-repos", role: "Full Stack Engineer", date: "Yesterday", score: "75%", user: "octocat" },
  ]);

  useEffect(() => {
    fetch("/api/history")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data && Array.isArray(data.history) && data.history.length > 0) {
          setRows(data.history);
        }
      })
      .catch(() => {});
  }, []);

  return (
    <Panel className="overflow-hidden">
      <div className="border-b border-neutral-200 dark:border-neutral-800 p-5">
        <h2 className="text-base font-semibold text-neutral-950 dark:text-white">Recent Analyses</h2>
        <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">Completed comparisons saved in workspace (click any row to view)</p>
      </div>
      <div className="divide-y divide-neutral-100 dark:divide-neutral-800">
        {rows.map((row, idx) => (
          <button
            key={`${row.user || row.repo}-${idx}`}
            onClick={() => onSelectUser && onSelectUser(row.user || "kunalchavan", row.role || "Backend Developer")}
            className="grid w-full grid-cols-[1fr_auto] gap-3 p-5 text-left hover:bg-neutral-50 dark:hover:bg-neutral-800/50 sm:grid-cols-4 sm:items-center"
          >
            <div>
              <span className="block text-sm font-medium text-neutral-900 dark:text-white">{row.repo}</span>
              {row.user && <span className="block text-xs text-neutral-400">@{row.user}</span>}
            </div>
            <span className="hidden text-sm text-neutral-500 dark:text-neutral-400 sm:block">{row.role}</span>
            <span className="hidden text-sm text-neutral-500 dark:text-neutral-400 sm:block">{row.date}</span>
            <span className="rounded-full bg-neutral-100 dark:bg-neutral-800 px-2.5 py-1 text-xs font-semibold text-neutral-700 dark:text-neutral-300">{row.score} match</span>
          </button>
        ))}
      </div>
    </Panel>
  );
}

function Dialog({
  kind,
  requirement,
  onClose,
  onSignOut,
  user,
  onUpdateUser,
}: {
  kind: Exclude<DialogKind, null>;
  requirement: Requirement;
  onClose: () => void;
  onSignOut: () => void;
  user: UserProfile;
  onUpdateUser: (updated: UserProfile) => void;
}) {
  const [saved, setSaved] = useState(false);
  const [notifications, setNotifications] = useState(true);

  const [formName, setFormName] = useState(user.name);
  const [formUsername, setFormUsername] = useState(user.username);
  const [formEmail, setFormEmail] = useState(user.email);
  const [formBio, setFormBio] = useState(user.bio || "");
  const [formAvatar, setFormAvatar] = useState(user.avatarUrl || "");

  useEffect(() => {
    setFormName(user.name);
    setFormUsername(user.username);
    setFormEmail(user.email);
    setFormBio(user.bio || "");
    setFormAvatar(user.avatarUrl || "");
    setSaved(false);
  }, [user, kind]);

  useEffect(() => {
    const handler = (event: KeyboardEvent) => event.key === "Escape" && onClose();
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  const handleSaveProfile = () => {
    const updated: UserProfile = {
      ...user,
      name: formName.trim() || user.name,
      username: formUsername.trim().toLowerCase() || user.username,
      email: formEmail.trim() || user.email,
      bio: formBio.trim(),
      avatarUrl: formAvatar.trim() || user.avatarUrl,
    };
    onUpdateUser(updated);
    setSaved(true);
    setTimeout(() => {
      setSaved(false);
      onClose();
    }, 700);
  };

  const content: Record<Exclude<DialogKind, null | "evidence" | "signout" | "profile" | "settings">, { title: string; body: string }> = {
    preferences: { title: "Preferences", body: "Active Theme: System Adaptive · Compact Density · Repository Change Webhooks Enabled." },
    help: { title: "Help & Support", body: "Need assistance with your repository analysis? Contact support@commitcheck.dev or explore documentation on 5-stage token pruning." },
  };

  const title =
    kind === "evidence"
      ? `${requirement.name} Evidence`
      : kind === "signout"
        ? "Sign out of CommitCheck?"
        : kind === "profile"
          ? "My Profile"
          : kind === "settings"
            ? "Account Settings"
            : content[kind].title;
  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/60 p-4" role="dialog" aria-modal="true" aria-labelledby="dialog-title" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-2xl">
        <div className="flex items-center justify-between border-b border-neutral-200 dark:border-neutral-800 px-5 py-4">
          <h2 id="dialog-title" className="font-semibold text-neutral-950 dark:text-white">{title}</h2>
          <button onClick={onClose} aria-label="Close dialog" className="rounded-md p-1.5 text-neutral-500 hover:bg-neutral-100 dark:hover:bg-neutral-800"><X size={18} /></button>
        </div>
        <div className="p-5">
          {kind === "evidence" ? (
            <>
              <div className="mb-3 flex items-center gap-2 text-sm font-medium text-neutral-800 dark:text-neutral-200"><FileCode2 size={16} />{requirement.file || "No source path"}</div>
              <pre className="max-h-[60vh] overflow-auto rounded-lg bg-neutral-950 p-4 font-mono text-xs leading-6 text-neutral-300"><code>{requirement.code || "// No code snippet in scope"}</code></pre>
              <p className="mt-4 text-sm leading-6 text-neutral-600 dark:text-neutral-400 whitespace-pre-line">{requirement.explanation}</p>
            </>
          ) : kind === "signout" ? (
            <>
              <p className="text-sm leading-6 text-neutral-600 dark:text-neutral-400">Signing out will end your session and take you back to the authentication screen.</p>
              <div className="mt-5 flex justify-end gap-2">
                <Button variant="secondary" onClick={onClose}>Cancel</Button>
                <Button variant="danger" onClick={onSignOut}>Confirm Sign Out</Button>
              </div>
            </>
          ) : kind === "profile" ? (
            <>
              <div className="mb-5 flex items-center gap-4 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950 p-4">
                <UserAvatar user={{ ...user, name: formName, username: formUsername, avatarUrl: formAvatar }} className="size-12" />
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-neutral-950 dark:text-white truncate">{formName || user.name}</p>
                  <p className="mt-0.5 text-xs text-neutral-500 dark:text-neutral-400 truncate">@{formUsername || user.username} · {user.provider.toUpperCase()} plan</p>
                </div>
              </div>
              <div className="mb-3">
                <h3 className="text-sm font-semibold text-neutral-900 dark:text-white">Profile Details</h3>
                <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">Manage identity details displayed across your reports.</p>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block">
                  <span className="mb-1.5 block text-xs font-medium text-neutral-700 dark:text-neutral-300">Full name</span>
                  <input
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    placeholder="Your Name"
                    className="h-10 w-full rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-950 px-3 text-sm text-neutral-900 dark:text-white outline-none focus:border-neutral-500 focus:ring-2 focus:ring-neutral-200 dark:focus:ring-neutral-800"
                  />
                </label>
                <label className="block">
                  <span className="mb-1.5 block text-xs font-medium text-neutral-700 dark:text-neutral-300">GitHub username</span>
                  <input
                    value={formUsername}
                    onChange={(e) => setFormUsername(e.target.value)}
                    placeholder="github-handle"
                    className="h-10 w-full rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-950 px-3 text-sm text-neutral-900 dark:text-white outline-none focus:border-neutral-500 focus:ring-2 focus:ring-neutral-200 dark:focus:ring-neutral-800"
                  />
                </label>
                <label className="block sm:col-span-2">
                  <span className="mb-1.5 block text-xs font-medium text-neutral-700 dark:text-neutral-300">Email address</span>
                  <input
                    type="email"
                    value={formEmail}
                    onChange={(e) => setFormEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="h-10 w-full rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-950 px-3 text-sm text-neutral-900 dark:text-white outline-none focus:border-neutral-500 focus:ring-2 focus:ring-neutral-200 dark:focus:ring-neutral-800"
                  />
                </label>
                <label className="block sm:col-span-2">
                  <span className="mb-1.5 block text-xs font-medium text-neutral-700 dark:text-neutral-300">Avatar Image URL (Optional)</span>
                  <input
                    type="text"
                    value={formAvatar}
                    onChange={(e) => setFormAvatar(e.target.value)}
                    placeholder="https://github.com/username.png"
                    className="h-10 w-full rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-950 px-3 text-sm text-neutral-900 dark:text-white outline-none focus:border-neutral-500 focus:ring-2 focus:ring-neutral-200 dark:focus:ring-neutral-800"
                  />
                </label>
                <label className="block sm:col-span-2">
                  <span className="mb-1.5 block text-xs font-medium text-neutral-700 dark:text-neutral-300">Bio</span>
                  <textarea
                    value={formBio}
                    onChange={(e) => setFormBio(e.target.value)}
                    placeholder="Short bio"
                    className="min-h-20 w-full resize-none rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-950 px-3 py-2 text-sm text-neutral-900 dark:text-white outline-none focus:border-neutral-500 focus:ring-2 focus:ring-neutral-200 dark:focus:ring-neutral-800"
                  />
                </label>
              </div>
              {saved && <p className="mt-4 flex items-center gap-2 text-sm text-green-700 dark:text-green-400"><CheckCircle2 size={15} /> Profile saved.</p>}
              <div className="mt-5 flex justify-end gap-2">
                <Button variant="secondary" onClick={onClose}>Cancel</Button>
                <Button onClick={handleSaveProfile}>Save Changes</Button>
              </div>
            </>
          ) : kind === "settings" ? (
            <>
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-4 rounded-lg border border-neutral-200 dark:border-neutral-800 p-4">
                  <div className="flex items-start gap-3">
                    <Code2 size={18} className="mt-0.5 text-neutral-600 dark:text-neutral-400" />
                    <div>
                      <p className="text-sm font-medium text-neutral-900 dark:text-white">GitHub Connection</p>
                      <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">@{user.username} · Verified</p>
                    </div>
                  </div>
                  <span className="rounded-full bg-green-50 dark:bg-green-950/50 px-2 py-1 text-[10px] font-bold text-green-700 dark:text-green-300">ACTIVE</span>
                </div>
                <button
                  onClick={() => setNotifications(!notifications)}
                  className="flex w-full items-center justify-between gap-4 rounded-lg border border-neutral-200 dark:border-neutral-800 p-4 text-left"
                >
                  <div className="flex items-start gap-3">
                    <Bell size={18} className="mt-0.5 text-neutral-600 dark:text-neutral-400" />
                    <div>
                      <p className="text-sm font-medium text-neutral-900 dark:text-white">Analysis Notifications</p>
                      <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">Notify me when repository diffs are re-assessed.</p>
                    </div>
                  </div>
                  <span className={`relative h-6 w-11 shrink-0 rounded-full transition ${notifications ? "bg-neutral-900 dark:bg-white" : "bg-neutral-300 dark:bg-neutral-700"}`}>
                    <span className={`absolute top-1 size-4 rounded-full ${notifications ? "bg-white dark:bg-neutral-900 left-6" : "bg-white left-1"} transition`} />
                  </span>
                </button>
                <div className="flex items-start gap-3 rounded-lg border border-neutral-200 dark:border-neutral-800 p-4">
                  <ShieldCheck size={18} className="mt-0.5 text-neutral-600 dark:text-neutral-400" />
                  <div>
                    <p className="text-sm font-medium text-neutral-900 dark:text-white">Account Security</p>
                    <p className="mt-1 text-xs leading-5 text-neutral-500 dark:text-neutral-400">
                      Authentication is linked through {user.provider === "google" ? "Google Account" : user.provider === "github" ? "GitHub OAuth" : "Email"} ({user.email}). Last active today.
                    </p>
                  </div>
                </div>
              </div>
              {saved && <p className="mt-4 flex items-center gap-2 text-sm text-green-700 dark:text-green-400"><CheckCircle2 size={15} /> Account settings saved.</p>}
              <div className="mt-5 flex justify-end">
                <Button onClick={() => { setSaved(true); setTimeout(() => { setSaved(false); onClose(); }, 700); }}>Save Settings</Button>
              </div>
            </>
          ) : (
            <>
              <p className="whitespace-pre-line text-sm leading-7 text-neutral-600 dark:text-neutral-400">{content[kind].body}</p>
              <div className="mt-5 flex justify-end"><Button onClick={onClose}>Done</Button></div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

const particles = Array.from({ length: 28 }, (_, index) => ({
  id: index,
  left: (index * 37 + 11) % 100,
  delay: -((index * 0.71) % 9),
  duration: 6 + (index % 6) * 0.85,
  size: index % 5 === 0 ? 3 : index % 3 === 0 ? 2 : 1,
}));

function LoginPage({
  onSignIn,
  theme,
  onToggleTheme,
}: {
  onSignIn: (profile: UserProfile) => void;
  theme: "light" | "dark";
  onToggleTheme: () => void;
}) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState<"email" | "oauth" | null>(null);

  // Authentication Modals
  const [activeModal, setActiveModal] = useState<"github" | "google" | null>(null);
  const [oauthConfig, setOauthConfig] = useState<{
    githubClientId: string;
    googleClientId: string;
    hasGithubSecret?: boolean;
  }>({ githubClientId: "", googleClientId: "", hasGithubSecret: false });

  // GitHub modal state
  const [ghInput, setGhInput] = useState("Krish-bit-arch");
  const [ghLoading, setGhLoading] = useState(false);
  const [ghError, setGhError] = useState("");

  // Google modal state
  const [googleName, setGoogleName] = useState("Krish");
  const [googleEmail, setGoogleEmail] = useState("krish@gmail.com");
  const [googleGh, setGoogleGh] = useState("Krish-bit-arch");
  const [googleLoading, setGoogleLoading] = useState(false);

  // Fetch OAuth public config on mount
  useEffect(() => {
    fetch("/api/auth/config")
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (d) setOauthConfig(d);
      })
      .catch(() => {});
  }, []);

  // Handle OAuth code/token callbacks on mount
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get("code");
    if (code) {
      setLoading("oauth");
      fetch("/api/auth/github", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code }),
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.user) {
            onSignIn(data.user);
            window.history.replaceState({}, document.title, window.location.pathname);
          } else if (data.error) {
            setError(`GitHub authentication failed: ${data.error}`);
          }
        })
        .catch((err) => setError(`GitHub login error: ${err.message}`))
        .finally(() => setLoading(null));
    }

    if (window.location.hash.includes("access_token=")) {
      const hashParams = new URLSearchParams(window.location.hash.substring(1));
      const access_token = hashParams.get("access_token");
      if (access_token) {
        setLoading("oauth");
        fetch("/api/auth/google", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ access_token }),
        })
          .then((res) => res.json())
          .then((data) => {
            if (data.user) {
              onSignIn(data.user);
              window.history.replaceState({}, document.title, window.location.pathname);
            } else if (data.error) {
              setError(`Google authentication failed: ${data.error}`);
            }
          })
          .catch((err) => setError(`Google login error: ${err.message}`))
          .finally(() => setLoading(null));
      }
    }
  }, [onSignIn]);

  const handleGithubClick = () => {
    if (oauthConfig.githubClientId && oauthConfig.hasGithubSecret) {
      const redirectUri = encodeURIComponent(window.location.origin);
      window.location.href = `https://github.com/login/oauth/authorize?client_id=${oauthConfig.githubClientId}&scope=read:user,repo&redirect_uri=${redirectUri}`;
    } else {
      setActiveModal("github");
    }
  };

  const handleGoogleClick = () => {
    if (oauthConfig.googleClientId) {
      const redirectUri = encodeURIComponent(window.location.origin);
      window.location.href = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${oauthConfig.googleClientId}&redirect_uri=${redirectUri}&response_type=token&scope=openid%20email%20profile`;
    } else {
      setActiveModal("google");
    }
  };

  const connectWithGithub = async (usernameToConnect: string) => {
    const handle = usernameToConnect.trim();
    if (!handle) {
      setGhError("Please enter a GitHub username");
      return;
    }
    setGhLoading(true);
    setGhError("");
    try {
      const res = await fetch(`/api/user?github_username=${encodeURIComponent(handle)}`);
      if (res.ok) {
        const data = await res.json();
        const profile: UserProfile = {
          name: data.name || data.login || handle,
          username: data.login || handle,
          email: data.email || `${data.login || handle}@users.noreply.github.com`,
          bio: data.bio || `GitHub developer with ${data.public_repos || 0} public repositories`,
          avatarUrl: data.avatar_url || `https://github.com/${handle}.png`,
          provider: "github",
        };
        setActiveModal(null);
        onSignIn(profile);
      } else {
        const profile: UserProfile = {
          name: handle,
          username: handle,
          email: `${handle}@users.noreply.github.com`,
          bio: "GitHub verified developer",
          avatarUrl: `https://github.com/${handle}.png`,
          provider: "github",
        };
        setActiveModal(null);
        onSignIn(profile);
      }
    } catch {
      const profile: UserProfile = {
        name: handle,
        username: handle,
        email: `${handle}@users.noreply.github.com`,
        bio: "GitHub developer",
        avatarUrl: `https://github.com/${handle}.png`,
        provider: "github",
      };
      setActiveModal(null);
      onSignIn(profile);
    } finally {
      setGhLoading(false);
    }
  };

  const connectWithGoogle = async (name: string, emailAddr: string, linkedHandle?: string) => {
    setGoogleLoading(true);
    const handle = (linkedHandle || emailAddr.split("@")[0] || "kunalchavan").trim();
    let avatar = `https://avatar.vercel.sh/${encodeURIComponent(emailAddr)}`;
    let bio = `Google authenticated developer · Linked to @${handle}`;

    try {
      if (handle) {
        const res = await fetch(`/api/user?github_username=${encodeURIComponent(handle)}`);
        if (res.ok) {
          const data = await res.json();
          if (data.avatar_url) avatar = data.avatar_url;
          if (data.bio) bio = `${data.bio} (Google: ${emailAddr})`;
        }
      }
    } catch {}

    const profile: UserProfile = {
      name,
      username: handle,
      email: emailAddr,
      bio,
      avatarUrl: avatar,
      provider: "google",
    };

    setGoogleLoading(false);
    setActiveModal(null);
    onSignIn(profile);
  };

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!email.trim() || !password) {
      setError("Enter your email address and password.");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Enter a valid email address.");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    setLoading("email");
    setError("");
    setTimeout(() => {
      setLoading(null);
      const localPart = email.split("@")[0];
      const formattedName = localPart
        .replace(/[^a-zA-Z0-9]/g, " ")
        .trim()
        .replace(/\b\w/g, (l) => l.toUpperCase()) || "Developer";
      const profile: UserProfile = {
        name: formattedName,
        username: localPart.toLowerCase().replace(/[^a-z0-9]/g, "") || "candidate",
        email: email.trim(),
        bio: "CommitCheck member",
        avatarUrl: `https://avatar.vercel.sh/${encodeURIComponent(email)}`,
        provider: "email",
      };
      onSignIn(profile);
    }, 600);
  };

  return (
    <div className={`login-screen relative min-h-screen overflow-hidden bg-neutral-950 text-white ${theme === "light" ? "login-light" : ""}`}>
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
        {particles.map((particle) => (
          <span
            key={particle.id}
            className="login-particle"
            style={{
              left: `${particle.left}%`,
              animationDelay: `${particle.delay}s`,
              animationDuration: `${particle.duration}s`,
              width: `${particle.size}px`,
              height: `${particle.size}px`,
            }}
          />
        ))}
      </div>
      <div className="pointer-events-none absolute left-1/2 top-1/2 h-80 w-80 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/[0.035] blur-3xl" />

      <button
        className="absolute left-5 top-5 z-10 flex items-center gap-3 rounded-lg p-2 text-left sm:left-8 sm:top-7"
        aria-label="CommitCheck home"
      >
        <span className="login-brand-mark flex size-9 items-center justify-center rounded-lg bg-white text-neutral-950">
          <GitBranch size={18} />
        </span>
        <span>
          <span className="block text-sm font-semibold text-white">CommitCheck</span>
          <span className="mt-0.5 block text-[9px] font-bold tracking-[0.16em] text-neutral-500">CAREER AI AUDITOR</span>
        </span>
      </button>
      <button
        onClick={onToggleTheme}
        className="login-theme-button absolute right-5 top-5 z-10 inline-flex h-10 items-center gap-2 rounded-lg border border-neutral-700 bg-neutral-900 px-3 text-xs font-medium text-neutral-200 transition hover:bg-neutral-800 sm:right-8 sm:top-7"
        aria-label={`Switch to ${theme === "light" ? "dark" : "light"} theme`}
      >
        {theme === "light" ? <Moon size={16} /> : <Sun size={16} />}
        <span className="hidden sm:inline">{theme === "light" ? "Dark theme" : "Light theme"}</span>
      </button>

      <main className="relative z-[1] flex min-h-screen items-center justify-center px-4 py-24">
        <div className="w-full max-w-md">
          <div className="mb-7 text-center">
            <div className="mx-auto mb-5 flex size-12 items-center justify-center rounded-2xl border border-neutral-700 bg-neutral-900 shadow-2xl">
              <Sparkles size={22} className="text-white" />
            </div>
            <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">Sign in to CommitCheck</h1>
            <p className="mt-2 text-sm text-neutral-400">Audit your GitHub repositories against live market demands.</p>
          </div>

          <div className="login-card rounded-2xl border border-neutral-800 bg-neutral-900/95 p-5 shadow-2xl sm:p-7">
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={handleGoogleClick}
                disabled={loading === "oauth"}
                className="inline-flex h-11 items-center justify-center gap-2 rounded-lg border border-neutral-700 bg-neutral-900 text-sm font-medium text-neutral-200 transition hover:border-neutral-500 hover:bg-neutral-800 disabled:opacity-60"
              >
                <span className="flex size-4 items-center justify-center rounded-full bg-white text-[11px] font-bold text-neutral-950">G</span>
                Google
              </button>
              <button
                type="button"
                onClick={handleGithubClick}
                disabled={loading === "oauth"}
                className="inline-flex h-11 items-center justify-center gap-2 rounded-lg border border-neutral-700 bg-neutral-900 text-sm font-medium text-neutral-200 transition hover:border-neutral-500 hover:bg-neutral-800 disabled:opacity-60"
              >
                <Code2 size={16} />
                GitHub
              </button>
            </div>

            <div className="my-5 flex items-center gap-3">
              <span className="h-px flex-1 bg-neutral-800" />
              <span className="text-[10px] font-medium uppercase tracking-widest text-neutral-500">or continue with email</span>
              <span className="h-px flex-1 bg-neutral-800" />
            </div>

            <form onSubmit={submit} className="space-y-4">
              <label className="block">
                <span className="mb-1.5 block text-xs font-medium text-neutral-300">Email address</span>
                <input
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="you@example.com"
                  autoComplete="email"
                  className="h-11 w-full rounded-lg border border-neutral-700 bg-neutral-950 px-3 text-sm text-white outline-none transition placeholder:text-neutral-600 focus:border-neutral-500 focus:ring-2 focus:ring-neutral-700"
                />
              </label>
              <label className="block">
                <span className="mb-1.5 flex items-center justify-between text-xs font-medium text-neutral-300">
                  Password
                  <button type="button" className="font-medium text-neutral-400 hover:text-white" onClick={() => setError("Enter any 6+ char password to access preview.")}>
                    Forgot password?
                  </button>
                </span>
                <span className="relative block">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    placeholder="Enter your password"
                    autoComplete="current-password"
                    className="h-11 w-full rounded-lg border border-neutral-700 bg-neutral-950 px-3 pr-11 text-sm text-white outline-none transition placeholder:text-neutral-600 focus:border-neutral-500 focus:ring-2 focus:ring-neutral-700"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((current) => !current)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-white"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                  </button>
                </span>
              </label>

              {error && (
                <div className="flex items-start gap-2 rounded-lg border border-red-900/70 bg-red-950/50 px-3 py-2.5 text-xs leading-5 text-red-300">
                  <AlertCircle size={14} className="mt-0.5 shrink-0" /> {error}
                </div>
              )}

              <button
                type="submit"
                disabled={Boolean(loading)}
                className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-white text-sm font-semibold text-neutral-950 transition hover:bg-neutral-200 disabled:opacity-60"
              >
                {loading === "email" ? <><LoaderCircle size={16} className="animate-spin" /> Signing in…</> : "Sign in with Email"}
              </button>
            </form>

            <p className="mt-5 text-center text-xs text-neutral-500">
              Want instant portfolio analysis?{" "}
              <button onClick={() => setActiveModal("github")} className="font-medium text-neutral-300 hover:text-white underline underline-offset-2">
                Connect your GitHub profile
              </button>
            </p>
          </div>
          <p className="mt-5 text-center text-[11px] leading-5 text-neutral-600">
            CommitCheck verifies public code against real-time job vacancies.
          </p>
        </div>
      </main>

      {/* GitHub Sign-In Dialog */}
      {activeModal === "github" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4" onClick={() => setActiveModal(null)}>
          <div className="w-full max-w-md rounded-2xl border border-neutral-800 bg-neutral-900 p-6 text-white shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <span className="flex size-9 items-center justify-center rounded-lg bg-white text-neutral-950">
                  <Code2 size={18} />
                </span>
                <div>
                  <h3 className="text-base font-semibold">Connect with GitHub</h3>
                  <p className="text-xs text-neutral-400">Pulls public repositories and profile proof</p>
                </div>
              </div>
              <button onClick={() => setActiveModal(null)} className="rounded-md p-1.5 text-neutral-400 hover:bg-neutral-800 hover:text-white">
                <X size={18} />
              </button>
            </div>

            <div className="mb-4">
              <label className="block text-xs font-medium text-neutral-300 mb-1.5">Enter GitHub username</label>
              <input
                type="text"
                value={ghInput}
                onChange={(e) => setGhInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && connectWithGithub(ghInput)}
                placeholder="e.g. kunalchavan, octocat, torvalds"
                className="h-11 w-full rounded-lg border border-neutral-700 bg-neutral-950 px-3 text-sm text-white outline-none focus:border-neutral-400 focus:ring-2 focus:ring-neutral-700"
              />
              {ghError && <p className="mt-1.5 text-xs text-red-400">{ghError}</p>}
            </div>

            <div className="mb-5">
              <p className="text-xs font-medium text-neutral-400 mb-2">Quick connect verified profiles:</p>
              <div className="flex flex-wrap gap-2">
                {["Krish-bit-arch", "kunal-1069", "octocat", "torvalds", "shadcn"].map((name) => (
                  <button
                    key={name}
                    type="button"
                    onClick={() => {
                      setGhInput(name);
                      connectWithGithub(name);
                    }}
                    className="rounded-full border border-neutral-700 bg-neutral-800/80 px-3 py-1 text-xs text-neutral-200 transition hover:border-neutral-500 hover:bg-neutral-700"
                  >
                    @{name}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setActiveModal(null)}
                className="h-10 flex-1 rounded-lg border border-neutral-700 bg-neutral-800 text-sm font-medium text-neutral-300 hover:bg-neutral-700"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={ghLoading}
                onClick={() => connectWithGithub(ghInput)}
                className="h-10 flex-1 inline-flex items-center justify-center gap-2 rounded-lg bg-white text-sm font-semibold text-neutral-950 hover:bg-neutral-200 disabled:opacity-60"
              >
                {ghLoading ? <><LoaderCircle size={16} className="animate-spin" /> Verifying…</> : "Connect Account"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Google Sign-In Dialog */}
      {activeModal === "google" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4" onClick={() => setActiveModal(null)}>
          <div className="w-full max-w-md rounded-2xl border border-neutral-800 bg-neutral-900 p-6 text-white shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <span className="flex size-9 items-center justify-center rounded-lg bg-white text-sm font-bold text-neutral-950">
                  G
                </span>
                <div>
                  <h3 className="text-base font-semibold">Sign in with Google</h3>
                  <p className="text-xs text-neutral-400">Choose Google workspace credentials</p>
                </div>
              </div>
              <button onClick={() => setActiveModal(null)} className="rounded-md p-1.5 text-neutral-400 hover:bg-neutral-800 hover:text-white">
                <X size={18} />
              </button>
            </div>

            <div className="mb-4 space-y-2">
              <button
                type="button"
                onClick={() => connectWithGoogle("Krish", "krish@gmail.com", "Krish-bit-arch")}
                className="flex w-full items-center gap-3 rounded-xl border border-neutral-700 bg-neutral-800/60 p-3 text-left transition hover:border-neutral-500 hover:bg-neutral-800"
              >
                <span className="flex size-10 items-center justify-center rounded-full bg-indigo-600 text-sm font-bold text-white">
                  K
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-white truncate">Krish</p>
                  <p className="text-xs text-neutral-400 truncate">krish@gmail.com · @Krish-bit-arch</p>
                </div>
                <Check size={16} className="text-neutral-500" />
              </button>

              <button
                type="button"
                onClick={() => connectWithGoogle("Kunal Chavan", "kunal.chavan@gmail.com", "kunal-1069")}
                className="flex w-full items-center gap-3 rounded-xl border border-neutral-700 bg-neutral-800/60 p-3 text-left transition hover:border-neutral-500 hover:bg-neutral-800"
              >
                <span className="flex size-10 items-center justify-center rounded-full bg-blue-600 text-sm font-bold text-white">
                  KC
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-white truncate">Kunal Chavan</p>
                  <p className="text-xs text-neutral-400 truncate">kunal.chavan@gmail.com · @kunal-1069</p>
                </div>
                <Check size={16} className="text-neutral-500" />
              </button>

              <button
                type="button"
                onClick={() => connectWithGoogle("Demo Developer", "developer@google.com", "octocat")}
                className="flex w-full items-center gap-3 rounded-xl border border-neutral-700 bg-neutral-800/60 p-3 text-left transition hover:border-neutral-500 hover:bg-neutral-800"
              >
                <span className="flex size-10 items-center justify-center rounded-full bg-emerald-600 text-sm font-bold text-white">
                  DD
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-white truncate">Demo Developer</p>
                  <p className="text-xs text-neutral-400 truncate">developer@google.com · @octocat</p>
                </div>
                <Check size={16} className="text-neutral-500" />
              </button>
            </div>

            <div className="rounded-xl border border-neutral-800 bg-neutral-950 p-4">
              <p className="text-xs font-semibold text-neutral-300 mb-3">Or customize Google identity:</p>
              <div className="space-y-3">
                <label className="block">
                  <span className="mb-1 block text-[11px] font-medium text-neutral-400">Full Name</span>
                  <input
                    type="text"
                    value={googleName}
                    onChange={(e) => setGoogleName(e.target.value)}
                    className="h-9 w-full rounded-lg border border-neutral-700 bg-neutral-900 px-3 text-xs text-white outline-none focus:border-neutral-400"
                  />
                </label>
                <label className="block">
                  <span className="mb-1 block text-[11px] font-medium text-neutral-400">Google Email</span>
                  <input
                    type="email"
                    value={googleEmail}
                    onChange={(e) => setGoogleEmail(e.target.value)}
                    className="h-9 w-full rounded-lg border border-neutral-700 bg-neutral-900 px-3 text-xs text-white outline-none focus:border-neutral-400"
                  />
                </label>
                <label className="block">
                  <span className="mb-1 block text-[11px] font-medium text-neutral-400">Linked GitHub Handle</span>
                  <input
                    type="text"
                    value={googleGh}
                    onChange={(e) => setGoogleGh(e.target.value)}
                    className="h-9 w-full rounded-lg border border-neutral-700 bg-neutral-900 px-3 text-xs text-white outline-none focus:border-neutral-400"
                  />
                </label>
              </div>
            </div>

            <div className="mt-5 flex gap-2">
              <button
                type="button"
                onClick={() => setActiveModal(null)}
                className="h-10 flex-1 rounded-lg border border-neutral-700 bg-neutral-800 text-sm font-medium text-neutral-300 hover:bg-neutral-700"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={googleLoading}
                onClick={() => connectWithGoogle(googleName, googleEmail, googleGh)}
                className="h-10 flex-1 inline-flex items-center justify-center gap-2 rounded-lg bg-white text-sm font-semibold text-neutral-950 hover:bg-neutral-200 disabled:opacity-60"
              >
                {googleLoading ? <><LoaderCircle size={16} className="animate-spin" /> Verifying…</> : "Continue with Google"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function App() {
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(() => {
    try {
      const saved = localStorage.getItem("commitcheck-user");
      if (saved) return JSON.parse(saved);
    } catch {}
    return null; // Prompt authentication page first!
  });

  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return localStorage.getItem("commitcheck-auth") === "true" && localStorage.getItem("commitcheck-user") !== null;
  });

  const [theme, setTheme] = useState<"light" | "dark">(() => {
    const savedTheme = localStorage.getItem("commitcheck-theme");
    return savedTheme === "dark" ? "dark" : "light";
  });
  const [activePage, setActivePage] = useState<Page>("Overview");
  const [mobileOpen, setMobileOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const [dialog, setDialog] = useState<DialogKind>(null);

  const [currentHandle, setCurrentHandle] = useState<string>(() => currentUser?.username || "demo-candidate");
  const [currentRole, setCurrentRole] = useState("Backend Developer");
  const [liveReport, setLiveReport] = useState<any>(null);
  const [selected, setSelected] = useState("PostgreSQL");
  const [filter, setFilter] = useState<Filter>("All");
  const [webhookComplete, setWebhookComplete] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [logs, setLogs] = useState(initialLogs);
  const [resetSignal, setResetSignal] = useState(0);
  const [reportStatus, setReportStatus] = useState<"idle" | "generating" | "done">("idle");

  const handleUpdateUser = (updated: UserProfile) => {
    setCurrentUser(updated);
    localStorage.setItem("commitcheck-user", JSON.stringify(updated));
    if (updated.username) {
      setCurrentHandle(updated.username);
    }
  };

  const handleSignIn = (profile: UserProfile) => {
    setCurrentUser(profile);
    localStorage.setItem("commitcheck-user", JSON.stringify(profile));
    localStorage.setItem("commitcheck-auth", "true");
    setIsAuthenticated(true);
    if (profile.username) {
      setCurrentHandle(profile.username);
    }
  };

  const handleSignOut = () => {
    localStorage.setItem("commitcheck-auth", "false");
    setIsAuthenticated(false);
    setAccountOpen(false);
    setDialog(null);
  };

  // Fetch initial report on load from backend if available
  useEffect(() => {
    if (!isAuthenticated || !currentHandle) return;
    fetch(`/report?github_username=${encodeURIComponent(currentHandle)}&format=json`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data && data.skills && data.skills.length > 0) {
          setLiveReport(data);
          setCurrentHandle(data.github_username || currentHandle);
          setCurrentRole(data.target_role || "Backend Developer");
          if (data.skills[0]) setSelected(data.skills[0].skill);
        }
      })
      .catch(() => {});
  }, [isAuthenticated, currentHandle]);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
    localStorage.setItem("commitcheck-theme", theme);
  }, [theme]);

  const requirements = useMemo<Requirement[]>(() => {
    if (liveReport && liveReport.skills && liveReport.skills.length > 0) {
      return liveReport.skills.map((s: any) => {
        const evList = s.evidence || [];
        const codeBlocks = evList
          .map((e: any, idx: number) => {
            const codeContent = e.full_code || e.snippet || '';
            const header = evList.length > 1 ? `// Evidence ${idx + 1}: ${e.repo}/${e.path} (Line ${e.line})\n` : '';
            return header + codeContent;
          })
          .filter(Boolean);
        const codeDisplay = codeBlocks.length > 0 ? codeBlocks.join('\n\n// ==========================================\n\n') : undefined;

        return {
          name: s.skill,
          level: (s.job_count || 0) >= 4 ? "Mandatory" : "Preferred",
          status:
            s.status === "demonstrated"
              ? "Demonstrated"
              : s.status === "partial"
                ? "Partial"
                : "Not Demonstrated",
          file: evList[0] ? `${evList[0].repo}/${evList[0].path} (L${evList[0].line})` : undefined,
          code: codeDisplay,
          explanation: `${s.rationale || "Evaluated against public repositories."}`,
          jobCount: s.job_count,
          gapAdvice: s.gap_advice,
        };
      });
    }

    return baseRequirements.map((item) =>
      item.name === "Docker" && webhookComplete
        ? {
            ...item,
            status: "Demonstrated",
            file: "Dockerfile",
            code: "FROM node:20-alpine\nWORKDIR /app\nCOPY package*.json ./\nRUN npm ci\nCOPY . .\nCMD [\"npm\", \"start\"]",
            explanation: "A production Dockerfile now defines a reproducible Node.js container build.",
          }
        : item,
    );
  }, [liveReport, webhookComplete]);

  const summary = useMemo(() => {
    if (liveReport?.summary) return liveReport.summary;
    return {
      total: requirements.length,
      demonstrated: requirements.filter((r) => r.status === "Demonstrated").length,
      partial: requirements.filter((r) => r.status === "Partial").length,
      not_demonstrated: requirements.filter((r) => r.status === "Not Demonstrated").length,
    };
  }, [liveReport, requirements]);

  const selectedRequirement = requirements.find((item) => item.name === selected) ?? requirements[0] ?? {
    name: "None",
    level: "Mandatory",
    status: "Not Demonstrated",
    explanation: "No evidence found.",
  };

  const handleAnalysisComplete = (data?: { handle: string; role: string; report: any; repo: string }) => {
    if (data?.report) {
      setLiveReport(data.report);
      setCurrentHandle(data.handle);
      setCurrentRole(data.role);
      if (data.report.skills?.[0]) setSelected(data.report.skills[0].skill);
    }
    setActivePage("Overview");
  };

  const simulate = async () => {
    if (processing || webhookComplete) return;
    setProcessing(true);
    const nowTime = new Date().toLocaleTimeString();
    setLogs((current) => [...current, { time: nowTime, text: `Push event received · repository ${currentHandle}/api-backend`, tone: "active" }]);

    try {
      await fetch('/github-push', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          repository: { name: "api-backend", owner: { login: currentHandle } },
          commits: [
            {
              id: "4f8a2c1",
              message: "Add PostgreSQL schema with foreign keys and Dockerfile",
              added: ["db/schema.sql", "Dockerfile"],
              modified: [],
            },
          ],
        }),
      });

      setLogs((current) => [
        ...current,
        { time: new Date().toLocaleTimeString(), text: "Webhook accepted (HTTP 202) · Reassessing incremental diff…", tone: "active" },
        { time: new Date().toLocaleTimeString(), text: "Commit delta scanned · 2 files changed", tone: "active" },
        { time: new Date().toLocaleTimeString(), text: "New Dockerfile & schema.sql verified with code citations", tone: "success" },
        { time: new Date().toLocaleTimeString(), text: "Analysis refreshed · match score upgraded!", tone: "success" },
      ]);

      setTimeout(async () => {
        try {
          const res = await fetch(`/report?github_username=${encodeURIComponent(currentHandle)}&format=json`);
          if (res.ok) {
            const data = await res.json();
            setLiveReport(data);
          }
        } catch {}
        setWebhookComplete(true);
        setProcessing(false);
        setSelected("Docker");
      }, 1200);
    } catch {
      setWebhookComplete(true);
      setProcessing(false);
    }
  };

  const reset = () => {
    setWebhookComplete(false);
    setProcessing(false);
    setLogs(initialLogs);
    setSelected(requirements[0]?.name || "PostgreSQL");
  };

  const newAnalysis = () => {
    setActivePage("Analyze Repository");
    setResetSignal((value) => value + 1);
    setMobileOpen(false);
  };

  const downloadEvidenceReport = async () => {
    if (reportStatus === "generating") return;
    setReportStatus("generating");
    try {
      const pdfUrl = `/report?github_username=${encodeURIComponent(currentHandle)}&format=pdf`;
      window.open(pdfUrl, "_blank");
      setReportStatus("done");
      setTimeout(() => setReportStatus("idle"), 2200);
    } catch {
      setReportStatus("idle");
    }
  };

  if (!isAuthenticated || !currentUser) {
    return (
      <LoginPage
        onSignIn={handleSignIn}
        theme={theme}
        onToggleTheme={() => setTheme((current) => (current === "light" ? "dark" : "light"))}
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#FAFAFA] text-neutral-900 dark:bg-neutral-950 dark:text-neutral-100">
      <Sidebar
        activePage={activePage}
        setActivePage={setActivePage}
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
        accountOpen={accountOpen}
        setAccountOpen={setAccountOpen}
        setDialog={setDialog}
        user={currentUser}
      />
      <main className="min-h-screen lg:ml-60">
        <div className="mx-auto max-w-[1500px] px-4 py-5 sm:px-7 sm:py-7 lg:px-8">
          <Header
            activePage={activePage}
            onMenu={() => setMobileOpen(true)}
            onNewAnalysis={newAnalysis}
            theme={theme}
            onToggleTheme={() => setTheme((current) => (current === "light" ? "dark" : "light"))}
          />
          <div className="space-y-5">
            {/* Overview Page: Complete Dashboard View */}
            {activePage === "Overview" && (
              <>
                <AnalysisForm user={currentUser} onComplete={handleAnalysisComplete} resetSignal={resetSignal} />
                <Metrics summary={summary} webhookComplete={webhookComplete} />
                <div className="grid gap-5 xl:grid-cols-2">
                  <RequirementsPanel requirements={requirements} selected={selected} onSelect={setSelected} filter={filter} setFilter={setFilter} />
                  <EvidencePanel
                    requirement={selectedRequirement}
                    onView={() => setDialog("evidence")}
                    onDownload={downloadEvidenceReport}
                    reportStatus={reportStatus}
                  />
                </div>
                <WebhookPanel complete={webhookComplete} processing={processing} logs={logs} simulate={simulate} reset={reset} />
              </>
            )}

            {/* Analyze Repository Page */}
            {activePage === "Analyze Repository" && (
              <>
                <AnalysisForm user={currentUser} onComplete={handleAnalysisComplete} resetSignal={resetSignal} />
                <Metrics summary={summary} webhookComplete={webhookComplete} />
                <div className="grid gap-5 xl:grid-cols-2">
                  <RequirementsPanel requirements={requirements} selected={selected} onSelect={setSelected} filter={filter} setFilter={setFilter} />
                  <EvidencePanel
                    requirement={selectedRequirement}
                    onView={() => setDialog("evidence")}
                    onDownload={downloadEvidenceReport}
                    reportStatus={reportStatus}
                  />
                </div>
              </>
            )}

            {/* Job Requirements Page */}
            {activePage === "Job Requirements" && (
              <>
                <div className="mb-2 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-4 flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-semibold text-neutral-900 dark:text-white">Active Market Role: {currentRole}</h3>
                    <p className="text-xs text-neutral-500 dark:text-neutral-400">Total {requirements.length} skill requirements analyzed against live remote job postings.</p>
                  </div>
                  <Button variant="secondary" onClick={() => setActivePage("Analyze Repository")}>Change Target Role</Button>
                </div>
                <div className="grid gap-5 xl:grid-cols-2">
                  <RequirementsPanel requirements={requirements} selected={selected} onSelect={setSelected} filter={filter} setFilter={setFilter} />
                  <EvidencePanel
                    requirement={selectedRequirement}
                    onView={() => setDialog("evidence")}
                    onDownload={downloadEvidenceReport}
                    reportStatus={reportStatus}
                  />
                </div>
              </>
            )}

            {/* Skill Gaps Page */}
            {activePage === "Skill Gaps" && (
              <>
                <div className="rounded-xl border border-amber-200 dark:border-amber-900 bg-amber-50/60 dark:bg-amber-950/30 p-5">
                  <div className="flex items-center gap-3">
                    <span className="flex size-10 items-center justify-center rounded-xl bg-amber-500 text-white">
                      <BarChart3 size={20} />
                    </span>
                    <div>
                      <h2 className="text-base font-semibold text-neutral-950 dark:text-white">Skill Gap Analysis & Recommendations</h2>
                      <p className="text-xs text-neutral-600 dark:text-neutral-400">
                        {summary.not_demonstrated} missing skill(s) and {summary.partial} partial match(es) identified for {currentRole}.
                      </p>
                    </div>
                  </div>
                </div>
                <Metrics summary={summary} webhookComplete={webhookComplete} />
                <div className="grid gap-5 xl:grid-cols-2">
                  <RequirementsPanel
                    requirements={requirements.filter((r) => r.status === "Not Demonstrated" || r.status === "Partial")}
                    selected={selected}
                    onSelect={setSelected}
                    filter={filter}
                    setFilter={setFilter}
                  />
                  <EvidencePanel
                    requirement={selectedRequirement}
                    onView={() => setDialog("evidence")}
                    onDownload={downloadEvidenceReport}
                    reportStatus={reportStatus}
                  />
                </div>
              </>
            )}

            {/* Repository Evidence Page */}
            {activePage === "Repository Evidence" && (
              <div className="grid gap-5 xl:grid-cols-2">
                <RequirementsPanel requirements={requirements} selected={selected} onSelect={setSelected} filter={filter} setFilter={setFilter} />
                <EvidencePanel
                  requirement={selectedRequirement}
                  onView={() => setDialog("evidence")}
                  onDownload={downloadEvidenceReport}
                  reportStatus={reportStatus}
                />
              </div>
            )}

            {/* Webhook Events Page */}
            {activePage === "Webhook Events" && (
              <WebhookPanel complete={webhookComplete} processing={processing} logs={logs} simulate={simulate} reset={reset} />
            )}

            {/* Analysis History Page */}
            {activePage === "Analysis History" && (
              <HistoryPanel
                onSelectUser={(user, role) => {
                  fetch(`/report?github_username=${encodeURIComponent(user)}&format=json`)
                    .then((r) => r.ok && r.json())
                    .then((rep) => {
                      if (rep) {
                        setLiveReport(rep);
                        setCurrentHandle(user);
                        setCurrentRole(role);
                        setActivePage("Overview");
                      }
                    });
                }}
              />
            )}
          </div>
        </div>
      </main>
      {dialog && (
        <Dialog
          kind={dialog}
          requirement={selectedRequirement}
          onClose={() => setDialog(null)}
          onSignOut={handleSignOut}
          user={currentUser}
          onUpdateUser={handleUpdateUser}
        />
      )}
    </div>
  );
}
