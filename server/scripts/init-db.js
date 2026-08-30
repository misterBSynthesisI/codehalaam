/**
 * CODEHALAAM — The Gamified Code Hosting Platform
 * 
 * © 2026 JustShipitAI. All rights reserved.
 * 
 * CONFIDENTIAL — TRADE SECRET
 * 
 * This file is proprietary and confidential. Unauthorized
 * copying, distribution, modification, or reverse engineering
 * of this file, via any medium, is strictly prohibited.
 * 
 * This code was developed with AI assistance under strict
 * confidentiality protocols. All intellectual property rights
 * are retained by the Owner.
 * 
 * For licensing inquiries: justshipitai@gmail.com
 */

import dotenv from 'dotenv'
import mongoose from 'mongoose'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
dotenv.config({ path: path.join(__dirname, '..', '.env') })

import User from '../models/User.js'
import Repository from '../models/Repository.js'
import Commit from '../models/Commit.js'
import Issue from '../models/Issue.js'
import Quest from '../models/Quest.js'
import PullRequest from '../models/PullRequest.js'
import Collaborator from '../models/Collaborator.js'
import Notification from '../models/Notification.js'

// ─── Helpers ───────────────────────────────────────────────
function sha() {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
}

function daysAgo(n) {
  const d = new Date()
  d.setDate(d.getDate() - n)
  return d
}

function randomBetween(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

// ─── File contents (real HTML + TypeScript) ────────────────
const FILES = {
  'index.html': {
    name: 'index.html', type: 'file', language: 'HTML', size: '2.1 KB',
    content: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Portfolio — Kai Nakamura</title>
  <link rel="stylesheet" href="/styles/main.css" />
  <script type="module" src="/src/main.ts"></script>
</head>
<body>
  <nav class="navbar" id="navbar">
    <div class="container">
      <a href="/" class="logo">KN<span class="accent">.</span></a>
      <ul class="nav-links">
        <li><a href="#about">About</a></li>
        <li><a href="#projects">Projects</a></li>
        <li><a href="#contact">Contact</a></li>
      </ul>
    </div>
  </nav>
  <header class="hero" id="hero">
    <div class="container">
      <h1>Building the future,<br/>one <span class="accent">component</span> at a time.</h1>
      <p class="subtitle">Full-stack developer & open source contributor</p>
      <div class="hero-actions">
        <a href="#projects" class="btn btn-primary">View My Work</a>
        <a href="#contact" class="btn btn-outline">Get In Touch</a>
      </div>
    </div>
  </header>
  <main>
    <section id="about" class="section">
      <div class="container">
        <h2>About Me</h2>
        <p>I craft performant web applications with modern tools.</p>
      </div>
    </section>
  </main>
</body>
</html>`,
  },
  'main.ts': {
    name: 'main.ts', type: 'file', language: 'TypeScript', size: '1.8 KB',
    content: `import { initRouter } from './router';
import { initTheme } from './theme';
import { initAnimations } from './animations';

document.addEventListener('DOMContentLoaded', () => {
  console.log('[Portfolio] Initializing...');

  // Initialize theme system
  initTheme();

  // Initialize SPA router
  initRouter({
    routes: {
      '/': () => import('./pages/home'),
      '/about': () => import('./pages/about'),
      '/projects': () => import('./pages/projects'),
    },
    fallback: '/404',
  });

  // Initialize scroll animations
  initAnimations({
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px',
  });

  // Navbar scroll effect
  const navbar = document.getElementById('navbar');
  if (navbar) {
    window.addEventListener('scroll', () => {
      navbar.classList.toggle('scrolled', window.scrollY > 50);
    });
  }

  console.log('[Portfolio] Ready ✓');
});`,
  },
  'router.ts': {
    name: 'router.ts', type: 'file', language: 'TypeScript', size: '1.2 KB',
    content: `interface RouteConfig {
  routes: Record<string, () => Promise<{ default: () => void }>>;
  fallback?: string;
}

let currentRoute = '/';

export function initRouter(config: RouteConfig) {
  const { routes, fallback } = config;

  window.addEventListener('popstate', () => handleRoute(routes, fallback));

  document.addEventListener('click', (e) => {
    const link = (e.target as HTMLElement).closest('a[href^="/"]');
    if (link) {
      e.preventDefault();
      const path = link.getAttribute('href') || '/';
      history.pushState(null, '', path);
      handleRoute(routes, fallback);
    }
  });

  handleRoute(routes, fallback);
}

async function handleRoute(
  routes: Record<string, () => Promise<{ default: () => void }>>,
  fallback?: string,
) {
  const path = window.location.pathname;
  currentRoute = path;

  const loader = routes[path] || (fallback ? routes[fallback] : null);

  if (loader) {
    const mod = await loader();
    mod.default();
  } else {
    document.querySelector('#app')!.innerHTML = '<h1>404</h1>';
  }
}`,
  },
  'styles/main.css': {
    name: 'styles', type: 'folder', children: [
      {
        name: 'main.css', type: 'file', language: 'CSS', size: '3.2 KB',
        content: `:root {
  --accent: #6c5ce7;
  --accent-light: #a29bfe;
  --bg: #0a0a0b;
  --bg-card: #141416;
  --text: #e8e6e3;
  --text-muted: #8b8a88;
  --border: #2a2a2d;
  --radius: 12px;
  --transition: 200ms cubic-bezier(0.16, 1, 0.3, 1);
}

* { margin: 0; padding: 0; box-sizing: border-box; }

body {
  font-family: 'Inter', -apple-system, system-ui, sans-serif;
  background: var(--bg);
  color: var(--text);
  line-height: 1.6;
  -webkit-font-smoothing: antialiased;
}

.container { max-width: 1100px; margin: 0 auto; padding: 0 24px; }

.hero {
  min-height: 80vh;
  display: flex;
  align-items: center;
  padding: 100px 0;
}

.hero h1 {
  font-size: clamp(2.5rem, 5vw, 4rem);
  font-weight: 700;
  line-height: 1.1;
  letter-spacing: -0.03em;
}

.accent { color: var(--accent); }

.btn {
  display: inline-flex;
  align-items: center;
  padding: 12px 24px;
  border-radius: var(--radius);
  font-weight: 500;
  font-size: 0.95rem;
  text-decoration: none;
  transition: all var(--transition);
  cursor: pointer;
}

.btn-primary {
  background: var(--accent);
  color: white;
  border: none;
}

.btn-primary:hover { background: var(--accent-light); transform: translateY(-1px); }`,
      },
    ],
  },
  'package.json': {
    name: 'package.json', type: 'file', language: 'JSON', size: '0.6 KB',
    content: `{
  "name": "portfolio-site",
  "version": "2.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "framer-motion": "^11.0.0"
  }
}`,
  },
}

const FILES_NEURAL_UI = {
  'src/App.tsx': {
    name: 'src', type: 'folder', children: [
      {
        name: 'App.tsx', type: 'file', language: 'TypeScript', size: '1.4 KB',
        content: `import { useState } from 'react';
import { ThemeProvider } from './contexts/ThemeContext';
import { Navbar } from './components/Navbar';
import { Dashboard } from './pages/Dashboard';
import { ParticleField } from './components/ParticleField';

export default function App() {
  const [activeTab, setActiveTab] = useState<'overview' | 'code' | 'stats'>('overview');

  return (
    <ThemeProvider>
      <div className="app">
        <ParticleField />
        <Navbar activeTab={activeTab} onTabChange={setActiveTab} />
        <main className="main-content">
          <Dashboard activeTab={activeTab} />
        </main>
      </div>
    </ThemeProvider>
  );
}`,
      },
      {
        name: 'hooks', type: 'folder', children: [
          {
            name: 'useSpringAnimation.ts', type: 'file', language: 'TypeScript', size: '0.9 KB',
            content: `import { useRef, useCallback } from 'react';

interface SpringConfig {
  stiffness?: number;
  damping?: number;
  mass?: number;
}

export function useSpringAnimation(config: SpringConfig = {}) {
  const { stiffness = 170, damping = 26, mass = 1 } = config;
  const frameRef = useRef<number>();

  const animate = useCallback(
    (from: number, to: number, onUpdate: (value: number) => void) => {
      let velocity = 0;
      let position = from;
      const target = to;

      const step = () => {
        const displacement = position - target;
        const springForce = -stiffness * displacement;
        const dampingForce = -damping * velocity;
        const acceleration = (springForce + dampingForce) / mass;

        velocity += acceleration * (1 / 60);
        position += velocity * (1 / 60);

        onUpdate(position);

        if (Math.abs(velocity) > 0.01 || Math.abs(displacement) > 0.01) {
          frameRef.current = requestAnimationFrame(step);
        } else {
          onUpdate(target);
        }
      };

      frameRef.current = requestAnimationFrame(step);
    },
    [stiffness, damping, mass],
  );

  return { animate };
}`,
          },
        ],
      },
    ],
  },
  'package.json': {
    name: 'package.json', type: 'file', language: 'JSON', size: '0.7 KB',
    content: `{
  "name": "neural-ui",
  "version": "0.1.0",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc -b && vite build",
    "lint": "eslint src --ext .ts,.tsx"
  },
  "dependencies": {
    "react": "^18.3.0",
    "react-dom": "^18.3.0",
    "framer-motion": "^11.0.0",
    "lucide-react": "^0.400.0"
  }
}`,
  },
}

const FILES_FORM_VALIDATOR = {
  'src/validator.ts': {
    name: 'src', type: 'folder', children: [
      {
        name: 'validator.ts', type: 'file', language: 'TypeScript', size: '1.6 KB',
        content: `type ValidationRule = {
  test: (value: string) => boolean;
  message: string;
};

type ValidationSchema = Record<string, ValidationRule[]>;

const RULES: Record<string, ValidationRule[]> = {
  email: [
    { test: (v) => v.length > 0, message: 'Email is required' },
    { test: (v) => /^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/.test(v), message: 'Invalid email format' },
  ],
  password: [
    { test: (v) => v.length >= 8, message: 'Password must be at least 8 characters' },
    { test: (v) => /[A-Z]/.test(v), message: 'Must contain an uppercase letter' },
    { test: (v) => /[0-9]/.test(v), message: 'Must contain a number' },
  ],
  username: [
    { test: (v) => v.length >= 3, message: 'Username must be at least 3 characters' },
    { test: (v) => /^[a-zA-Z0-9_-]+$/.test(v), message: 'Only letters, numbers, - and _ allowed' },
  ],
};

export function validate(field: string, value: string): string | null {
  const rules = RULES[field];
  if (!rules) return null;

  for (const rule of rules) {
    if (!rule.test(value)) return rule.message;
  }
  return null;
}

export function validateAll(schema: ValidationSchema, data: Record<string, string>) {
  const errors: Record<string, string> = {};
  let valid = true;

  for (const [field, rules] of Object.entries(schema)) {
    for (const rule of rules) {
      if (!rule.test(data[field] || '')) {
        errors[field] = rule.message;
        valid = false;
        break;
      }
    }
  }

  return { valid, errors };
}`,
      },
      {
        name: 'index.ts', type: 'file', language: 'TypeScript', size: '0.5 KB',
        content: `export { validate, validateAll } from './validator';
export type { ValidationRule, ValidationSchema } from './types';`,
      },
    ],
  },
  'index.html': {
    name: 'index.html', type: 'file', language: 'HTML', size: '0.8 KB',
    content: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>Form Validator Demo</title>
  <link rel="stylesheet" href="/style.css" />
</head>
<body>
  <div id="app">
    <h1>Validate Your Input</h1>
    <form id="demo-form">
      <input type="email" name="email" placeholder="Email" required />
      <input type="password" name="password" placeholder="Password (8+ chars)" required />
      <input type="text" name="username" placeholder="Username" required />
      <button type="submit">Submit</button>
    </form>
    <div id="errors"></div>
  </div>
  <script type="module" src="/src/index.ts"></script>
</body>
</html>`,
  },
}

const FILES_WEATHER = {
  'src/App.tsx': {
    name: 'src', type: 'folder', children: [
      {
        name: 'App.tsx', type: 'file', language: 'TypeScript', size: '1.1 KB',
        content: `import { useState, useEffect } from 'react';

interface WeatherData {
  city: string;
  temp: number;
  condition: string;
  humidity: number;
  wind: number;
}

export function WeatherApp() {
  const [data, setData] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchWeather('Tokyo');
  }, []);

  async function fetchWeather(city: string) {
    setLoading(true);
    try {
      const res = await fetch(\`/api/weather?city=\${encodeURIComponent(city)}\`);
      const json = await res.json();
      setData(json);
    } catch (err) {
      console.error('Weather fetch failed:', err);
    } finally {
      setLoading(false);
    }
  }

  if (loading) return <div className="skeleton" />;
  if (!data) return <div>Failed to load weather</div>;

  return (
    <div className="weather-card">
      <h2>{data.city}</h2>
      <div className="temp">{data.temp}°C</div>
      <div className="condition">{data.condition}</div>
      <div className="meta">
        <span>💧 {data.humidity}%</span>
        <span>🌬️ {data.wind} km/h</span>
      </div>
    </div>
  );
}`,
      },
    ],
  },
  'README.md': {
    name: 'README.md', type: 'file', language: 'Markdown', size: '0.4 KB',
    content: `# 🌤️ Weather Dashboard

A minimal weather dashboard built with React and TypeScript.

## Features
- Real-time weather data
- City search
- 7-day forecast
- Responsive design

## Tech Stack
- React 18
- TypeScript
- Tailwind CSS`,
  },
}

const FILES_CLI = {
  'src/cli.ts': {
    name: 'src', type: 'folder', children: [
      {
        name: 'cli.ts', type: 'file', language: 'TypeScript', size: '1.3 KB',
        content: `#!/usr/bin/env node

import { parseArgs } from './parser';
import { generateProject } from './generator';

const HELP = \`
📋 init-craft — Scaffold modern projects instantly

Usage:
  init-craft <template> [project-name] [options]

Templates:
  react        React + Vite + TypeScript
  node         Node.js + Express + TypeScript
  fullstack    React + Node.js + Prisma

Options:
  --yes, -y    Skip all prompts
  --dry-run    Show what would be created
  --help, -h   Show this help message

Examples:
  init-craft react my-app
  init-craft node api-server --yes
\`;

async function main() {
  const args = parseArgs(process.argv.slice(2));

  if (args.help) {
    console.log(HELP);
    process.exit(0);
  }

  const template = args._[0];
  const projectName = args._[1] || 'my-project';

  if (!template) {
    console.error('Error: Please specify a template');
    console.log(HELP);
    process.exit(1);
  }

  console.log(\\\`\\n🚀 Creating \\\${projectName} with template: \\\${template}\\n\\\`);

  if (args['dry-run']) {
    console.log('[dry-run] Would create project structure...');
    process.exit(0);
  }

  await generateProject(template, projectName, { yes: args.yes });
  console.log('\\n✅ Project created successfully!');
}

main().catch(console.error);`,
      },
    ],
  },
  'README.md': {
    name: 'README.md', type: 'file', language: 'Markdown', size: '0.3 KB',
    content: `# ⚡ init-craft

Scaffold modern fullstack projects in one command.

## Install
\`\`\`bash
npm install -g init-craft
\`\`\`

## Usage
\`\`\`bash
init-craft react my-app
init-craft node api-server --yes
\`\`\``,
  },
}

const FILES_PORTFOLIO_V2 = {
  'src/components/Hero.tsx': {
    name: 'src', type: 'folder', children: [
      {
        name: 'components', type: 'folder', children: [
          {
            name: 'Hero.tsx', type: 'file', language: 'TypeScript', size: '0.9 KB',
            content: `import { motion } from 'framer-motion';

export function Hero() {
  return (
    <section className="hero">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: 'spring', bounce: 0, duration: 0.6 }}
      >
        <h1>
          Hi, I'm <span className="gradient-text">Aria Chen</span>
        </h1>
        <p>I design and build digital experiences.</p>
      </motion.div>
    </section>
  );
}`,
          },
        ],
      },
    ],
  },
  'README.md': {
    name: 'README.md', type: 'file', language: 'Markdown', size: '0.2 KB',
    content: `# Aria's Portfolio v2

Revamped portfolio with Framer Motion animations.`,
  },
}

const FILES_LANG = {
  'src/parser.ts': {
    name: 'src', type: 'folder', children: [
      {
        name: 'parser.ts', type: 'file', language: 'TypeScript', size: '1.5 KB',
        content: `interface Token {
  type: 'IDENT' | 'NUMBER' | 'STRING' | 'OPERATOR' | 'KEYWORD';
  value: string;
  line: number;
  col: number;
}

export class Lexer {
  private pos = 0;
  private line = 1;
  private col = 1;

  constructor(private source: string) {}

  tokenize(): Token[] {
    const tokens: Token[] = [];

    while (this.pos < this.source.length) {
      const ch = this.source[this.pos];

      if (ch === '\\n') { this.line++; this.col = 1; this.pos++; continue; }
      if (/\s/.test(ch)) { this.col++; this.pos++; continue; }
      if (ch === '/' && this.source[this.pos + 1] === '/') {
        while (this.pos < this.source.length && this.source[this.pos] !== '\\n') this.pos++;
        continue;
      }

      if (/[a-zA-Z_]/.test(ch)) {
        const start = this.pos;
        while (this.pos < this.source.length && /[a-zA-Z0-9_]/.test(this.source[this.pos])) this.pos++;
        const value = this.source.slice(start, this.pos);
        const keywords = ['fn', 'let', 'if', 'else', 'return', 'while'];
        tokens.push({ type: keywords.includes(value) ? 'KEYWORD' : 'IDENT', value, line: this.line, col: this.col });
        this.col += this.pos - start;
        continue;
      }

      if (/[0-9]/.test(ch)) {
        const start = this.pos;
        while (this.pos < this.source.length && /[0-9.]/.test(this.source[this.pos])) this.pos++;
        tokens.push({ type: 'NUMBER', value: this.source.slice(start, this.pos), line: this.line, col: this.col });
        this.col += this.pos - start;
        continue;
      }

      this.pos++; this.col++;
    }

    return tokens;
  }
}`,
      },
    ],
  },
  'README.md': {
    name: 'README.md', type: 'file', language: 'Markdown', size: '0.3 KB',
    content: `# 🗣️ Lang — A Toy Programming Language

A simple interpreted language with functions, variables, and control flow.

## Grammar
\`\`\`
program    := statement*
statement  := let_stmt | fn_def | if_stmt | return_stmt | expr_stmt
expr       := NUMBER | IDENT | STRING | expr op expr
\`\`\``,
  },
}

// ─── Contribution heatmap generator ────────────────────────
function generateHeatmap(days = 180) {
  const days_arr = []
  for (let i = days; i >= 0; i--) {
    const date = daysAgo(i)
    const dayOfWeek = date.getDay()
    // Weekdays more active, some random zeros
    const count = dayOfWeek === 0 || dayOfWeek === 6
      ? (Math.random() > 0.4 ? randomBetween(0, 3) : 0)
      : (Math.random() > 0.15 ? randomBetween(1, 8) : 0)
    days_arr.push({ date, count })
  }
  return days_arr
}

// ─── Main seed ─────────────────────────────────────────────
async function seed() {
  if (!process.env.MONGODB_URI) {
    console.error('❌ Missing MONGODB_URI')
    process.exit(1)
  }

  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, { serverSelectionTimeoutMS: 5000 })
    console.log(`✅ Connected to: ${conn.connection.db.databaseName}`)

    // Clear everything
    await Promise.all([
      User.deleteMany({}),
      Repository.deleteMany({}),
      Commit.deleteMany({}),
      Issue.deleteMany({}),
      Quest.deleteMany({}),
      PullRequest.deleteMany({}),
      Collaborator.deleteMany({}),
      Notification.deleteMany({}),
    ])
    console.log('🧹 Cleared all collections')

    // ─── Users ────────────────────────────────────────
    const kai = await User.create({
      username: 'kai-nakamura',
      email: 'kai@codehalaam.dev',
      password: 'kai12345',
      displayName: 'Kai Nakamura',
      bio: 'Full-stack developer. I build things with TypeScript, React, and Node. Open source enthusiast.',
      company: 'Freelance',
      location: 'Tokyo, Japan',
      website: 'https://kai.dev',
      class: 'Mage',
      level: 12,
      xp: 2340,
      xpToNext: 3000,
      streak: 14,
      longestStreak: 47,
      lastActiveDate: new Date(),
      stats: { commits: 312, pullRequests: 45, reviews: 89, issues: 67, contributions: 415 },
      achievements: [
        { id: 'first-commit', name: 'First Inscription', unlockedAt: daysAgo(170) },
        { id: 'streak-7', name: '7-Day Streak', unlockedAt: daysAgo(140) },
        { id: 'contributor', name: 'Active Contributor', unlockedAt: daysAgo(100) },
        { id: 'mentor', name: 'Code Mentor', unlockedAt: daysAgo(50) },
      ],
      contributionDays: generateHeatmap(),
    })

    const aria = await User.create({
      username: 'aria-chen',
      email: 'aria@codehalaam.dev',
      password: 'aria12345',
      displayName: 'Aria Chen',
      bio: 'UI/UX designer turned developer. Passionate about design systems and accessibility.',
      company: 'DesignCraft Studio',
      location: 'San Francisco, CA',
      website: 'https://aria.design',
      class: 'Rogue',
      level: 8,
      xp: 1120,
      xpToNext: 1500,
      streak: 5,
      longestStreak: 21,
      lastActiveDate: new Date(),
      stats: { commits: 89, pullRequests: 12, reviews: 34, issues: 28, contributions: 120 },
      achievements: [
        { id: 'first-commit', name: 'First Inscription', unlockedAt: daysAgo(90) },
        { id: 'designer', name: 'Pixel Perfect', unlockedAt: daysAgo(60) },
      ],
      contributionDays: generateHeatmap(),
    })

    const marcus = await User.create({
      username: 'marcus-reed',
      email: 'marcus@codehalaam.dev',
      password: 'marcus12',
      displayName: 'Marcus Reed',
      bio: 'DevOps engineer and infrastructure nerd. Docker, Kubernetes, and CI/CD pipelines.',
      company: 'CloudNine Labs',
      location: 'Berlin, Germany',
      class: 'Tank',
      level: 15,
      xp: 4200,
      xpToNext: 5000,
      streak: 30,
      longestStreak: 62,
      lastActiveDate: new Date(),
      stats: { commits: 567, pullRequests: 78, reviews: 156, issues: 93, contributions: 680 },
      achievements: [
        { id: 'first-commit', name: 'First Inscription', unlockedAt: daysAgo(200) },
        { id: 'streak-30', name: '30-Day Streak', unlockedAt: daysAgo(30) },
        { id: 'veteran', name: 'Codex Veteran', unlockedAt: daysAgo(90) },
        { id: 'mentor', name: 'Code Mentor', unlockedAt: daysAgo(60) },
        { id: 'architect', name: 'Systems Architect', unlockedAt: daysAgo(20) },
      ],
      contributionDays: generateHeatmap(),
    })

    const luna = await User.create({
      username: 'luna-voss',
      email: 'luna@codehalaam.dev',
      password: 'luna1234',
      displayName: 'Luna Voss',
      bio: 'Data scientist exploring ML. Python by day, TypeScript by night.',
      company: 'DataFlow Inc',
      location: 'Amsterdam, Netherlands',
      class: 'Mage',
      level: 6,
      xp: 780,
      xpToNext: 1000,
      streak: 3,
      longestStreak: 12,
      lastActiveDate: daysAgo(1),
      stats: { commits: 45, pullRequests: 8, reviews: 15, issues: 22, contributions: 62 },
      achievements: [
        { id: 'first-commit', name: 'First Inscription', unlockedAt: daysAgo(45) },
      ],
      contributionDays: generateHeatmap(),
    })

    console.log(`👤 Created ${4} users`)

    // ─── Repositories ─────────────────────────────────
    const repo1 = await Repository.create({
      name: 'portfolio-site',
      description: 'My personal portfolio built with Vite, TypeScript, and modern CSS. Features smooth animations and a dark theme.',
      owner: kai._id,
      visibility: 'public',
      language: 'TypeScript',
      languages: [{ name: 'TypeScript', percentage: 62, color: '#3178c6' }, { name: 'HTML', percentage: 21, color: '#e34c26' }, { name: 'CSS', percentage: 17, color: '#563d7c' }],
      starsCount: 24,
      forksCount: 6,
      stargazers: [aria._id, marcus._id, luna._id],
      fileTree: [FILES['index.html'], FILES['main.ts'], FILES['router.ts'], FILES['styles/main.css'], FILES['package.json']],
      defaultReadme: '# Portfolio Site\n\nMy personal portfolio built with Vite + TypeScript.\n\n## Features\n- SPA routing\n- Dark theme\n- Scroll animations\n- Responsive design',
      branches: [{ name: 'main', isDefault: true, lastCommit: { message: 'feat: add router and theme system', author: kai.username, date: daysAgo(2) } }, { name: 'dev', lastCommit: { message: 'refactor: extract hooks', author: kai.username, date: daysAgo(1) } }],
      topics: ['portfolio', 'vite', 'typescript', 'dark-theme'],
      hasIssues: true,
      xpReward: 10,
    })

    const repo2 = await Repository.create({
      name: 'neural-ui',
      description: 'An experimental component library with particle effects and spring physics. Built for the next generation of web interfaces.',
      owner: kai._id,
      visibility: 'public',
      language: 'TypeScript',
      languages: [{ name: 'TypeScript', percentage: 85, color: '#3178c6' }, { name: 'CSS', percentage: 15, color: '#563d7c' }],
      starsCount: 156,
      forksCount: 32,
      stargazers: [aria._id, marcus._id, luna._id],
      fileTree: [FILES_NEURAL_UI['src/App.tsx'], FILES_NEURAL_UI['package.json']],
      defaultReadme: '# 🧠 Neural UI\n\nA next-gen component library with spring physics and particle effects.\n\n## Components\n- ParticleField\n- SpringButton\n- GlassCard\n- AnimatedCounter',
      branches: [{ name: 'main', isDefault: true, lastCommit: { message: 'feat: add useSpringAnimation hook', author: kai.username, date: daysAgo(3) } }, { name: 'feat/glass-card', lastCommit: { message: 'wip: glass card component', author: aria.username, date: daysAgo(1) } }],
      topics: ['react', 'animations', 'spring-physics', 'components'],
      hasIssues: true,
      xpReward: 15,
    })

    const repo3 = await Repository.create({
      name: 'form-validator',
      description: 'Lightweight, zero-dependency form validation library for TypeScript projects.',
      owner: aria._id,
      visibility: 'public',
      language: 'TypeScript',
      languages: [{ name: 'TypeScript', percentage: 100, color: '#3178c6' }],
      starsCount: 43,
      forksCount: 11,
      stargazers: [kai._id, luna._id],
      fileTree: [FILES_FORM_VALIDATOR['src/validator.ts'], FILES_FORM_VALIDATOR['src/index.ts'], FILES_FORM_VALIDATOR['index.html']],
      defaultReadme: '# Form Validator\n\nZero-dependency form validation with TypeScript.\n\n## Usage\n```ts\nimport { validate } from "form-validator";\nconst error = validate("email", "not-an-email");\n```',
      branches: [{ name: 'main', isDefault: true, lastCommit: { message: 'feat: add email and password rules', author: aria.username, date: daysAgo(5) } }],
      topics: ['validation', 'typescript', 'forms'],
      hasIssues: true,
      xpReward: 10,
    })

    const repo4 = await Repository.create({
      name: 'weather-dashboard',
      description: 'Minimal weather dashboard with clean UI. Fetches real-time data and displays 7-day forecasts.',
      owner: luna._id,
      visibility: 'public',
      language: 'TypeScript',
      languages: [{ name: 'TypeScript', percentage: 70, color: '#3178c6' }, { name: 'HTML', percentage: 30, color: '#e34c26' }],
      starsCount: 8,
      forksCount: 2,
      stargazers: [kai._id],
      fileTree: [FILES_WEATHER['src/App.tsx'], FILES_WEATHER['README.md']],
      defaultReadme: '# 🌤️ Weather Dashboard\n\nA minimal weather dashboard built with React and TypeScript.',
      branches: [{ name: 'main', isDefault: true, lastCommit: { message: 'feat: initial weather card', author: luna.username, date: daysAgo(7) } }],
      topics: ['weather', 'react', 'dashboard'],
      hasIssues: true,
      xpReward: 10,
    })

    const repo5 = await Repository.create({
      name: 'init-craft',
      description: 'CLI tool to scaffold modern fullstack projects in one command. Supports React, Node, and fullstack templates.',
      owner: marcus._id,
      visibility: 'public',
      language: 'TypeScript',
      languages: [{ name: 'TypeScript', percentage: 92, color: '#3178c6' }, { name: 'Markdown', percentage: 8, color: '#083fa1' }],
      starsCount: 89,
      forksCount: 17,
      stargazers: [kai._id, aria._id, luna._id],
      fileTree: [FILES_CLI['src/cli.ts'], FILES_CLI['README.md']],
      defaultReadme: '# ⚡ init-craft\n\nScaffold modern fullstack projects in one command.',
      branches: [{ name: 'main', isDefault: true, lastCommit: { message: 'feat: add node template', author: marcus.username, date: daysAgo(4) } }, { name: 'feat/fullstack', lastCommit: { message: 'wip: fullstack template', author: marcus.username, date: daysAgo(2) } }],
      topics: ['cli', 'scaffolding', 'typescript', 'devtools'],
      hasIssues: true,
      xpReward: 10,
    })

    const repo6 = await Repository.create({
      name: 'lang',
      description: 'A toy programming language with lexer, parser, and interpreter. Written for learning compiler design.',
      owner: marcus._id,
      visibility: 'public',
      language: 'TypeScript',
      languages: [{ name: 'TypeScript', percentage: 100, color: '#3178c6' }],
      starsCount: 34,
      forksCount: 8,
      stargazers: [kai._id, luna._id],
      fileTree: [FILES_LANG['src/parser.ts'], FILES_LANG['README.md']],
      defaultReadme: '# 🗣️ Lang\n\nA toy programming language with lexer, parser, and interpreter.',
      branches: [{ name: 'main', isDefault: true, lastCommit: { message: 'feat: implement lexer', author: marcus.username, date: daysAgo(10) } }],
      topics: ['compiler', 'parser', 'programming-language'],
      hasIssues: true,
      xpReward: 10,
    })

    const repo7 = await Repository.create({
      name: 'aria-portfolio',
      description: 'My developer portfolio showcasing design work and open source projects.',
      owner: aria._id,
      visibility: 'public',
      language: 'TypeScript',
      languages: [{ name: 'TypeScript', percentage: 80, color: '#3178c6' }, { name: 'HTML', percentage: 20, color: '#e34c26' }],
      starsCount: 12,
      forksCount: 1,
      stargazers: [kai._id, luna._id],
      fileTree: [FILES_PORTFOLIO_V2['src/components/Hero.tsx'], FILES_PORTFOLIO_V2['README.md']],
      defaultReadme: "# Aria's Portfolio v2\n\nRevamped portfolio with Framer Motion animations.",
      branches: [{ name: 'main', isDefault: true, lastCommit: { message: 'feat: add hero animation', author: aria.username, date: daysAgo(6) } }],
      topics: ['portfolio', 'framer-motion', 'design'],
      hasIssues: true,
      xpReward: 10,
    })

    console.log(`📦 Created ${7} repositories with file trees`)

    // ─── Commits ──────────────────────────────────────
    const commitData = [
      // Portfolio-site commits
      { repo: repo1, author: kai, message: 'init: scaffold project with Vite', daysAgo: 30, files: [{ filename: 'package.json', status: 'added', additions: 25, deletions: 0 }, { filename: 'vite.config.ts', status: 'added', additions: 12, deletions: 0 }] },
      { repo: repo1, author: kai, message: 'feat: add SPA router with history API', daysAgo: 28, files: [{ filename: 'src/router.ts', status: 'added', additions: 45, deletions: 0 }, { filename: 'src/main.ts', status: 'modified', additions: 8, deletions: 2 }] },
      { repo: repo1, author: kai, message: 'feat: implement dark theme with CSS variables', daysAgo: 25, files: [{ filename: 'styles/main.css', status: 'added', additions: 67, deletions: 0 }] },
      { repo: repo1, author: aria, message: 'style: polish typography and spacing', daysAgo: 20, files: [{ filename: 'styles/main.css', status: 'modified', additions: 15, deletions: 8 }] },
      { repo: repo1, author: kai, message: 'feat: add scroll-triggered animations', daysAgo: 15, files: [{ filename: 'src/animations.ts', status: 'added', additions: 38, deletions: 0 }, { filename: 'src/main.ts', status: 'modified', additions: 5, deletions: 1 }] },
      { repo: repo1, author: kai, message: 'fix: mobile nav overflow on small screens', daysAgo: 10, files: [{ filename: 'styles/main.css', status: 'modified', additions: 12, deletions: 5 }] },
      { repo: repo1, author: kai, message: 'feat: add index.html with semantic markup', daysAgo: 5, files: [{ filename: 'index.html', status: 'added', additions: 42, deletions: 0 }] },
      { repo: repo1, author: kai, message: 'refactor: extract router into standalone module', daysAgo: 2, files: [{ filename: 'src/router.ts', status: 'modified', additions: 20, deletions: 15 }] },

      // Neural-UI commits
      { repo: repo2, author: kai, message: 'init: neural-ui component library', daysAgo: 40, files: [{ filename: 'package.json', status: 'added', additions: 30, deletions: 0 }, { filename: 'src/App.tsx', status: 'added', additions: 20, deletions: 0 }] },
      { repo: repo2, author: kai, message: 'feat: add useSpringAnimation hook', daysAgo: 35, files: [{ filename: 'src/hooks/useSpringAnimation.ts', status: 'added', additions: 52, deletions: 0 }] },
      { repo: repo2, author: aria, message: 'feat: add ParticleField background component', daysAgo: 30, files: [{ filename: 'src/components/ParticleField.tsx', status: 'added', additions: 78, deletions: 0 }] },
      { repo: repo2, author: kai, message: 'feat: add ThemeProvider context', daysAgo: 25, files: [{ filename: 'src/contexts/ThemeContext.tsx', status: 'added', additions: 35, deletions: 0 }] },
      { repo: repo2, author: marcus, message: 'ci: add GitHub Actions workflow', daysAgo: 20, files: [{ filename: '.github/workflows/ci.yml', status: 'added', additions: 28, deletions: 0 }] },
      { repo: repo2, author: kai, message: 'fix: spring animation jitter at low FPS', daysAgo: 15, files: [{ filename: 'src/hooks/useSpringAnimation.ts', status: 'modified', additions: 12, deletions: 8 }] },
      { repo: repo2, author: kai, message: 'feat: add glass card component with blur', daysAgo: 3, files: [{ filename: 'src/components/GlassCard.tsx', status: 'added', additions: 45, deletions: 0 }] },

      // Form-validator commits
      { repo: repo3, author: aria, message: 'init: form-validator library', daysAgo: 30, files: [{ filename: 'src/validator.ts', status: 'added', additions: 60, deletions: 0 }, { filename: 'src/index.ts', status: 'added', additions: 5, deletions: 0 }] },
      { repo: repo3, author: aria, message: 'feat: add email and password validation rules', daysAgo: 25, files: [{ filename: 'src/validator.ts', status: 'modified', additions: 25, deletions: 5 }] },
      { repo: repo3, author: kai, message: 'fix: username regex allows invalid chars', daysAgo: 18, files: [{ filename: 'src/validator.ts', status: 'modified', additions: 3, deletions: 2 }] },
      { repo: repo3, author: aria, message: 'feat: add validateAll for batch validation', daysAgo: 10, files: [{ filename: 'src/validator.ts', status: 'modified', additions: 22, deletions: 0 }] },
      { repo: repo3, author: aria, message: 'docs: add README with usage examples', daysAgo: 5, files: [{ filename: 'README.md', status: 'added', additions: 18, deletions: 0 }] },

      // Init-craft commits
      { repo: repo5, author: marcus, message: 'init: scaffold CLI project', daysAgo: 50, files: [{ filename: 'package.json', status: 'added', additions: 22, deletions: 0 }, { filename: 'src/cli.ts', status: 'added', additions: 35, deletions: 0 }] },
      { repo: repo5, author: marcus, message: 'feat: add react template generator', daysAgo: 45, files: [{ filename: 'src/templates/react.ts', status: 'added', additions: 85, deletions: 0 }] },
      { repo: repo5, author: marcus, message: 'feat: add node template generator', daysAgo: 38, files: [{ filename: 'src/templates/node.ts', status: 'added', additions: 65, deletions: 0 }] },
      { repo: repo5, author: kai, message: 'refactor: extract arg parser into module', daysAgo: 30, files: [{ filename: 'src/parser.ts', status: 'added', additions: 40, deletions: 12 }] },
      { repo: repo5, author: marcus, message: 'feat: add dry-run flag', daysAgo: 22, files: [{ filename: 'src/cli.ts', status: 'modified', additions: 18, deletions: 5 }] },
      { repo: repo5, author: marcus, message: 'feat: add fullstack template', daysAgo: 2, files: [{ filename: 'src/templates/fullstack.ts', status: 'added', additions: 110, deletions: 0 }] },

      // Lang commits
      { repo: repo6, author: marcus, message: 'init: lang project — toy programming language', daysAgo: 60, files: [{ filename: 'README.md', status: 'added', additions: 20, deletions: 0 }] },
      { repo: repo6, author: marcus, message: 'feat: implement lexer with token types', daysAgo: 55, files: [{ filename: 'src/parser.ts', status: 'added', additions: 75, deletions: 0 }] },
      { repo: repo6, author: kai, message: 'fix: lexer skips single-line comments correctly', daysAgo: 48, files: [{ filename: 'src/parser.ts', status: 'modified', additions: 8, deletions: 3 }] },
      { repo: repo6, author: marcus, message: 'feat: add parser for function definitions', daysAgo: 40, files: [{ filename: 'src/parser.ts', status: 'modified', additions: 55, deletions: 10 }] },

      // Weather dashboard commits
      { repo: repo4, author: luna, message: 'init: weather dashboard project', daysAgo: 20, files: [{ filename: 'src/App.tsx', status: 'added', additions: 55, deletions: 0 }] },
      { repo: repo4, author: luna, message: 'feat: add weather card component', daysAgo: 15, files: [{ filename: 'src/App.tsx', status: 'modified', additions: 30, deletions: 5 }] },
      { repo: repo4, author: luna, message: 'fix: handle API timeout gracefully', daysAgo: 8, files: [{ filename: 'src/App.tsx', status: 'modified', additions: 12, deletions: 4 }] },

      // Aria portfolio commits
      { repo: repo7, author: aria, message: 'init: portfolio v2 with framer-motion', daysAgo: 25, files: [{ filename: 'package.json', status: 'added', additions: 18, deletions: 0 }] },
      { repo: repo7, author: aria, message: 'feat: add hero section with spring animation', daysAgo: 20, files: [{ filename: 'src/components/Hero.tsx', status: 'added', additions: 28, deletions: 0 }] },
    ]

    const commits = []
    let lastSha = null
    for (const c of commitData) {
      const s = sha()
      const commit = await Commit.create({
        sha: s,
        message: c.message,
        author: c.author._id,
        repository: c.repo._id,
        branch: 'main',
        parentShas: lastSha ? [lastSha] : [],
        additions: c.files.reduce((sum, f) => sum + f.additions, 0),
        deletions: c.files.reduce((sum, f) => sum + f.deletions, 0),
        filesChanged: c.files.length,
        files: c.files,
        xpEarned: 10,
        createdAt: daysAgo(c.daysAgo),
      })
      commits.push(commit)
      lastSha = s
    }

    console.log(`📜 Created ${commits.length} commits`)

    // ─── Issues ───────────────────────────────────────
    const issueData = [
      { repo: repo1, author: aria, title: 'Mobile nav overflows on 320px screens', body: 'The hamburger menu items extend beyond the viewport on very small screens. Need to add max-height and scroll.', labels: [{ name: 'bug', color: 'red' }, { name: 'good first issue', color: 'green' }], state: 'open', daysAgo: 12, bountyXp: 10 },
      { repo: repo1, author: marcus, title: 'Add dark/light theme toggle', body: 'It would be nice to have a manual toggle in addition to the system preference detection.', labels: [{ name: 'enhancement', color: 'blue' }], state: 'open', daysAgo: 8, bountyXp: 15 },
      { repo: repo2, author: kai, title: 'ParticleField performance on low-end devices', body: 'The particle animation drops below 30fps on devices with integrated GPUs. Consider reducing particle count or using OffscreenCanvas.', labels: [{ name: 'performance', color: 'orange' }, { name: 'help wanted', color: 'purple' }], state: 'open', daysAgo: 10, bountyXp: 25 },
      { repo: repo2, author: aria, title: 'Add GlassCard component', body: 'A translucent card component using backdrop-filter, following the Apple Design system guidelines.', labels: [{ name: 'enhancement', color: 'blue' }], state: 'closed', daysAgo: 20, closedAt: daysAgo(3), closedBy: kai._id, bountyXp: 20 },
      { repo: repo3, author: luna, title: 'Add URL validation rule', body: 'Would be useful to have a URL validator for form fields that accept website links.', labels: [{ name: 'enhancement', color: 'blue' }], state: 'open', daysAgo: 5, bountyXp: 10 },
      { repo: repo5, author: kai, title: 'Add --template flag for direct template selection', body: 'Instead of positional args, support --template react for clarity.', labels: [{ name: 'enhancement', color: 'blue' }], state: 'open', daysAgo: 15, bountyXp: 10 },
      { repo: repo5, author: marcus, title: 'Fullstack template is missing Prisma schema', body: 'The fullstack template should include a basic Prisma schema with User and Post models.', labels: [{ name: 'bug', color: 'red' }], state: 'open', daysAgo: 4, bountyXp: 15 },
      { repo: repo6, author: kai, title: 'Lexer does not handle string literals', body: 'Strings with double quotes should be tokenized as STRING type.', labels: [{ name: 'enhancement', color: 'blue' }, { name: 'good first issue', color: 'green' }], state: 'open', daysAgo: 25, bountyXp: 20 },
      { repo: repo4, author: kai, title: 'Add unit tests for weather API', body: 'Need test coverage for the fetchWeather function and error handling paths.', labels: [{ name: 'testing', color: 'cyan' }], state: 'open', daysAgo: 7, bountyXp: 10 },
    ]

    const issues = []
    for (const i of issueData) {
      const issue = await Issue.create({
        number: issueData.indexOf(i) + 1,
        title: i.title,
        body: i.body,
        state: i.state,
        author: i.author._id,
        repository: i.repo._id,
        labels: i.labels,
        bountyXp: i.bountyXp,
        closedAt: i.closedAt,
        closedBy: i.closedBy,
        comments: i.state === 'closed' ? [{ author: kai._id, body: 'Fixed in the latest commit.', createdAt: i.closedAt }] : [],
        commentsCount: i.state === 'closed' ? 1 : 0,
        createdAt: daysAgo(i.daysAgo),
      })
      issues.push(issue)
    }

    console.log(`🎫 Created ${issues.length} issues`)

    // ─── Pull Requests ────────────────────────────────
    const prData = [
      { repo: repo1, author: kai, title: 'feat: add SPA router with history API', body: 'Implements client-side routing using the History API. Supports nested routes and a 404 fallback.', state: 'merged', head: 'feat/router', daysAgo: 28, mergedAt: daysAgo(27), additions: 45, deletions: 0, changedFiles: 2 },
      { repo: repo1, author: aria, title: 'style: polish typography and spacing', body: 'Tightened letter-spacing on headings, improved line-height for body text, added responsive font sizes.', state: 'merged', head: 'style/typography', daysAgo: 20, mergedAt: daysAgo(19), additions: 15, deletions: 8, changedFiles: 1 },
      { repo: repo1, author: kai, title: 'feat: add scroll-triggered animations', body: 'Uses IntersectionObserver for performant scroll animations. No library dependency.', state: 'merged', head: 'feat/animations', daysAgo: 15, mergedAt: daysAgo(14), additions: 38, deletions: 0, changedFiles: 2 },
      { repo: repo2, author: kai, title: 'feat: add useSpringAnimation hook', body: 'A custom hook that implements spring physics for natural-feeling animations. Supports stiffness, damping, and mass configuration.', state: 'merged', head: 'feat/spring-hook', daysAgo: 35, mergedAt: daysAgo(34), additions: 52, deletions: 0, changedFiles: 1 },
      { repo: repo2, author: aria, title: 'feat: add ParticleField background component', body: 'Renders a canvas-based particle system with configurable density, speed, and connection distance.', state: 'merged', head: 'feat/particles', daysAgo: 30, mergedAt: daysAgo(29), additions: 78, deletions: 0, changedFiles: 1 },
      { repo: repo2, author: kai, title: 'feat: add GlassCard component with blur', body: 'A translucent card component using backdrop-filter with light edge highlight, following Apple Design principles.', state: 'open', head: 'feat/glass-card', daysAgo: 3, additions: 45, deletions: 0, changedFiles: 1 },
      { repo: repo3, author: kai, title: 'fix: username regex allows invalid characters', body: 'The original regex `^[a-zA-Z0-9]+$` was correct but the validator was using a loose match. Tightened the pattern.', state: 'merged', head: 'fix/username-regex', daysAgo: 18, mergedAt: daysAgo(17), additions: 3, deletions: 2, changedFiles: 1 },
      { repo: repo3, author: aria, title: 'feat: add validateAll for batch validation', body: 'Runs all validation rules across multiple fields in a single call. Returns a Record of field→error.', state: 'merged', head: 'feat/validate-all', daysAgo: 10, mergedAt: daysAgo(9), additions: 22, deletions: 0, changedFiles: 1 },
      { repo: repo5, author: marcus, title: 'feat: add fullstack template', body: 'Adds a fullstack template with React frontend, Express backend, and Prisma ORM setup.', state: 'open', head: 'feat/fullstack', daysAgo: 2, additions: 110, deletions: 0, changedFiles: 3 },
      { repo: repo6, author: marcus, title: 'feat: add parser for function definitions', body: 'Extends the lexer with function definition parsing. Supports fn name(params) { body } syntax.', state: 'merged', head: 'feat/parser', daysAgo: 40, mergedAt: daysAgo(39), additions: 55, deletions: 10, changedFiles: 1 },
      { repo: repo4, author: luna, title: 'feat: weather card component', body: 'Adds a responsive weather card with temperature, condition, humidity, and wind display.', state: 'merged', head: 'feat/weather-card', daysAgo: 15, mergedAt: daysAgo(14), additions: 30, deletions: 5, changedFiles: 1 },
      { repo: repo7, author: aria, title: 'feat: hero section with spring animation', body: 'Adds the hero section with Framer Motion spring entrance animation.', state: 'merged', head: 'feat/hero', daysAgo: 20, mergedAt: daysAgo(19), additions: 28, deletions: 0, changedFiles: 1 },
    ]

    const pullRequests = []
    for (const p of prData) {
      const pr = await PullRequest.create({
        number: prData.indexOf(p) + 1,
        title: p.title,
        body: p.body,
        state: p.state,
        author: p.author._id,
        repository: p.repo._id,
        base: 'main',
        head: p.head,
        additions: p.additions,
        deletions: p.deletions,
        changedFiles: p.changedFiles,
        merged: p.state === 'merged',
        mergedAt: p.mergedAt,
        mergedBy: p.state === 'merged' ? p.author._id : undefined,
        mergeCommitSha: p.state === 'merged' ? sha() : undefined,
        createdAt: daysAgo(p.daysAgo),
      })
      pullRequests.push(pr)
    }

    console.log(`🔀 Created ${pullRequests.length} pull requests`)

    // ─── Quests ───────────────────────────────────────
    const questData = [
      { repo: repo1, author: marcus, title: 'Add unit tests for router', body: 'Write tests for the SPA router covering navigation, back/forward, and 404 fallback.', status: 'Open', bountyXp: 20, labels: [{ name: 'testing', color: 'cyan' }] },
      { repo: repo2, author: kai, title: 'Implement OffscreenCanvas for ParticleField', body: 'Move particle rendering to OffscreenCanvas for better performance on low-end devices.', status: 'In Progress', bountyXp: 30, assignee: marcus._id, labels: [{ name: 'performance', color: 'orange' }] },
      { repo: repo2, author: aria, title: 'Add keyboard navigation to all components', body: 'Ensure all interactive components are fully keyboard accessible (Tab, Enter, Escape).', status: 'Open', bountyXp: 25, labels: [{ name: 'accessibility', color: 'purple' }] },
      { repo: repo3, author: kai, title: 'Add phone number validation rule', body: 'Support international phone number formats (E.164 and common patterns).', status: 'Open', bountyXp: 15, labels: [{ name: 'enhancement', color: 'blue' }] },
      { repo: repo5, author: marcus, title: 'Add interactive template preview', body: 'Show a tree preview of the project structure before generating files.', status: 'Open', bountyXp: 20, labels: [{ name: 'enhancement', color: 'blue' }] },
      { repo: repo6, author: marcus, title: 'Implement basic interpreter', body: 'After parsing, execute the AST. Start with variable assignment and print statements.', status: 'Open', bountyXp: 40, labels: [{ name: 'core', color: 'red' }] },
    ]

    const quests = []
    for (const q of questData) {
      const quest = await Quest.create({
        repo: q.repo._id,
        title: q.title,
        body: q.body,
        status: q.status,
        bountyXp: q.bountyXp,
        author: kai._id,
        assignee: q.assignee || null,
        labels: q.labels,
        comments: q.status === 'In Progress' ? [{ author: marcus._id, body: 'Started working on this. Exploring OffscreenCanvas support.', createdAt: daysAgo(3) }] : [],
      })
      quests.push(quest)
    }

    console.log(`⚔️ Created ${quests.length} quests`)

    // ─── Collaborators ────────────────────────────────
    await Collaborator.create([
      { user: aria._id, repository: repo1._id, role: 'write', invitedBy: kai._id, acceptedAt: daysAgo(25), pending: false },
      { user: marcus._id, repository: repo2._id, role: 'write', invitedBy: kai._id, acceptedAt: daysAgo(22), pending: false },
      { user: aria._id, repository: repo2._id, role: 'write', invitedBy: kai._id, acceptedAt: daysAgo(28), pending: false },
      { user: kai._id, repository: repo3._id, role: 'write', invitedBy: aria._id, acceptedAt: daysAgo(20), pending: false },
      { user: luna._id, repository: repo1._id, role: 'read', invitedBy: kai._id, acceptedAt: daysAgo(15), pending: false },
      { user: kai._id, repository: repo5._id, role: 'write', invitedBy: marcus._id, acceptedAt: daysAgo(35), pending: false },
    ])

    console.log(`👥 Created collaborator relationships`)

    // ─── Notifications ────────────────────────────────
    const notifData = [
      { recipient: kai._id, actor: aria._id, type: 'EMBER_RECEIVED', targetId: repo2._id, targetModel: 'Codex' },
      { recipient: kai._id, actor: marcus._id, type: 'EMBER_RECEIVED', targetId: repo2._id, targetModel: 'Codex' },
      { recipient: kai._id, actor: luna._id, type: 'EMBER_RECEIVED', targetId: repo1._id, targetModel: 'Codex' },
      { recipient: kai._id, actor: marcus._id, type: 'OFFERING_MADE', targetId: pullRequests[0]._id, targetModel: 'Offering' },
      { recipient: aria._id, actor: kai._id, type: 'OFFERING_MADE', targetId: pullRequests[6]._id, targetModel: 'Offering' },
      { recipient: kai._id, actor: aria._id, type: 'QUEST_COMPLETED', targetId: issues[3]._id, targetModel: 'Quest' },
      { recipient: marcus._id, actor: aria._id, type: 'ECHO_CREATED', targetId: repo2._id, targetModel: 'Codex' },
      { recipient: kai._id, actor: marcus._id, type: 'EMBER_RECEIVED', targetId: repo6._id, targetModel: 'Codex' },
      { recipient: luna._id, actor: kai._id, type: 'OFFERING_MADE', targetId: pullRequests[10]._id, targetModel: 'Offering' },
      { recipient: aria._id, actor: marcus._id, type: 'ECHO_CREATED', targetId: repo3._id, targetModel: 'Codex' },
    ]

    await Notification.insertMany(notifData)
    console.log(`🔔 Created ${notifData.length} notifications`)

    // ─── Final counts ─────────────────────────────────
    const counts = await Promise.all([
      User.countDocuments(),
      Repository.countDocuments(),
      Commit.countDocuments(),
      Issue.countDocuments(),
      PullRequest.countDocuments(),
      Quest.countDocuments(),
      Collaborator.countDocuments(),
      Notification.countDocuments(),
    ])

    console.log('\n📊 Final database state:')
    console.log(`   Users:          ${counts[0]}`)
    console.log(`   Repositories:   ${counts[1]}`)
    console.log(`   Commits:        ${counts[2]}`)
    console.log(`   Issues:         ${counts[3]}`)
    console.log(`   Pull Requests:  ${counts[4]}`)
    console.log(`   Quests:         ${counts[5]}`)
    console.log(`   Collaborators:  ${counts[6]}`)
    console.log(`   Notifications:  ${counts[7]}`)

    console.log('\n🔑 Login credentials:')
    console.log('   Kai:      kai@codehalaam.dev / kai12345')
    console.log('   Aria:     aria@codehalaam.dev / aria12345')
    console.log('   Marcus:   marcus@codehalaam.dev / marcus12')
    console.log('   Luna:     luna@codehalaam.dev / luna1234')

    console.log('\n✅ Database seeded successfully!')
  } catch (err) {
    console.error('❌ Seed error:', err.message)
  } finally {
    await mongoose.disconnect()
    console.log('🔌 Connection closed.')
    process.exit(0)
  }
}

seed()
