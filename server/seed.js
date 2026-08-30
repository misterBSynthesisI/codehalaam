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

import mongoose from 'mongoose'
import bcrypt from 'bcryptjs'
import dotenv from 'dotenv'
import User from './models/User.js'
import Repository from './models/Repository.js'
import Issue from './models/Issue.js'
import PullRequest from './models/PullRequest.js'
import Collaborator from './models/Collaborator.js'
import Commit from './models/Commit.js'
import Quest from './models/Quest.js'
import Offering from './models/Offering.js'
import Path from './models/Path.js'
import Comment from './models/Comment.js'
import Release from './models/Release.js'

dotenv.config()

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/codehalaam'

// Generate contribution heatmap
function generateContributions() {
  const days = []
  for (let i = 364; i >= 0; i--) {
    const date = new Date()
    date.setDate(date.getDate() - i)
    date.setHours(0, 0, 0, 0)
    const rand = Math.random()
    let count = 0
    if (rand > 0.3) count = Math.floor(Math.random() * 3) + 1
    if (rand > 0.5) count = Math.floor(Math.random() * 5) + 3
    if (rand > 0.7) count = Math.floor(Math.random() * 8) + 5
    if (rand > 0.85) count = Math.floor(Math.random() * 12) + 8
    days.push({ date, count })
  }
  return days
}

const seedUsers = [
  {
    username: 'bishesh',
    email: 'bishesh@codehalaam.dev',
    password: 'password123',
    displayName: 'Bishesh',
    bio: 'Founder & Admin of CODEHALAAM.',
    level: 20,
    xp: 5000,
    xpToNext: 6000,
    stats: { commits: 2400, pullRequests: 600, reviews: 1200, issues: 300, contributions: 5000 },
    streak: 30,
    longestStreak: 60,
    isAdmin: true,
    badgeColor: 'red',
    characterClass: 'Mage',
  },
  {
    username: 'kai-nakamura',
    email: 'kai@codehalaam.dev',
    password: 'password123',
    displayName: 'Kai Nakamura',
    bio: 'Full-stack developer. I build things with TypeScript, React, and Node. Open source enthusiast.',
    level: 12,
    xp: 2340,
    xpToNext: 3000,
    stats: { commits: 780, pullRequests: 190, reviews: 420, issues: 78, contributions: 2340 },
    streak: 14,
    longestStreak: 47,
    isAdmin: false,
    characterClass: 'Rogue',
  },
  {
    username: 'neo-coder',
    email: 'neo@codehalaam.dev',
    password: 'password123',
    displayName: 'Neo Coder',
    bio: 'Full-stack developer. Building the future of collaborative coding.',
    level: 14,
    xp: 3420,
    xpToNext: 5000,
    stats: { commits: 1284, pullRequests: 347, reviews: 892, issues: 156, contributions: 3120 },
    streak: 23,
    longestStreak: 47,
    achievements: [
      { id: 'first-commit', name: 'First Commit', unlockedAt: new Date('2024-01-15') },
      { id: 'streak-7', name: '7-Day Streak', unlockedAt: new Date('2024-02-01') },
      { id: 'team-player', name: 'Team Player', unlockedAt: new Date('2024-03-10') },
      { id: 'ship-it', name: 'Ship It', unlockedAt: new Date('2024-04-05') },
    ],
  },
  {
    username: 'sarah-dev',
    email: 'sarah@codehalaam.dev',
    password: 'password123',
    displayName: 'Sarah Chen',
    bio: 'Design systems enthusiast. React & TypeScript.',
    level: 11,
    xp: 2100,
    xpToNext: 3000,
    stats: { commits: 892, pullRequests: 234, reviews: 567, issues: 89, contributions: 2100 },
    streak: 15,
    longestStreak: 32,
  },
  {
    username: 'mike-reviewer',
    email: 'mike@codehalaam.dev',
    password: 'password123',
    displayName: 'Mike Ross',
    bio: 'Backend engineer. Go, Rust, distributed systems.',
    level: 9,
    xp: 1500,
    xpToNext: 2500,
    stats: { commits: 654, pullRequests: 178, reviews: 892, issues: 67, contributions: 1500 },
    streak: 8,
    longestStreak: 21,
  },
  {
    username: 'contributor-99',
    email: 'alex@codehalaam.dev',
    password: 'password123',
    displayName: 'Alex Kim',
    bio: 'Open source contributor. Documentation & testing.',
    level: 7,
    xp: 890,
    xpToNext: 1500,
    stats: { commits: 345, pullRequests: 89, reviews: 234, issues: 45, contributions: 890 },
    streak: 5,
    longestStreak: 14,
  },
]

// ─── Beautiful repos for Kai Nakamura ───────────────────────────────────────

const kaiRepos = [
  {
    name: 'aurora-ui',
    description: 'A sleek, accessible React component library built with Tailwind CSS andRadix primitives. Ship beautiful interfaces in minutes.',
    language: 'TypeScript',
    visibility: 'public',
    starsCount: 3421,
    forksCount: 587,
    hasIssues: true,
    topics: ['react', 'components', 'tailwindcss', 'radix', 'accessibility', 'design-system'],
    license: 'MIT',
    openIssuesCount: 14,
    openPullRequestsCount: 3,
    defaultReadme: `# ✨ Aurora UI

> A sleek, accessible React component library built with Tailwind CSS and Radix primitives.

[![MIT License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![npm version](https://img.shields.io/badge/npm-2.4.0-brightgreen.svg)](https://npmjs.com/package/aurora-ui)
[![Bundle Size](https://img.shields.io/bundlephobia/minzip/aurora-ui)](https://bundlephobia.com/package/aurora-ui)
[![Storybook](https://img.shields.io/badge/storybook-7.x-orange.svg)](https://storybook.aurora-ui.dev)

---

## 🌅 Why Aurora?

Most component libraries force you to fight the styling system. Aurora gives you **composable, unstyled primitives** with beautiful defaults that you can override with Tailwind — no \`!important\` wars.

### Design Philosophy

- **Accessible by default** — WAI-ARIA compliant, keyboard navigable, screen reader tested
- **Tailwind-native** — every component accepts \`className\` and merges it seamlessly
- **Radix-powered** — built on Radix UI primitives for bulletproof behavior
- **Type-safe** — full TypeScript coverage with exported prop types
- **Dark mode ready** — uses CSS variables, works with any Tailwind dark mode strategy

## 🚀 Quick Start

\`\`\`bash
npm install aurora-ui tailwindcss @radix-ui/react-* 
\`\`\`

\`\`\`tsx
import { Button, Dialog, TextField } from 'aurora-ui'

function App() {
  const [open, setOpen] = useState(false)
  
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <Dialog.Trigger asChild>
        <Button variant="primary">Open Modal</Button>
      </Dialog.Trigger>
      <Dialog.Content>
        <Dialog.Title>Get Started</Dialog.Title>
        <TextField placeholder="Enter your email..." />
        <Dialog.Close asChild>
          <Button>Submit</Button>
        </Dialog.Close>
      </Dialog.Content>
    </Dialog>
  )
}
\`\`\`

## 🎨 Components

| Component | Description | Status |
|-----------|-------------|--------|
| **Button** | Primary, secondary, ghost, danger variants with loading states | ✅ Stable |
| **Dialog** | Modal with focus trap, close on overlay click, animations | ✅ Stable |
| **TextField** | Input with label, helper text, error state, and icon support | ✅ Stable |
| **Select** | Dropdown with search, multi-select, and grouped options | ✅ Stable |
| **Toast** | Animated notification with auto-dismiss and swipe to close | ✅ Stable |
| **Tooltip** | Delay-aware popover with rich content support | ✅ Stable |
| **Dropdown Menu** | Keyboard-navigable menu with sub-menus and separators | 🔄 Beta |
| **Tabs** | Controlled and uncontrolled tabs with lazy rendering | 🔄 Beta |
| **Accordion** | Collapsible sections with smooth height animations | 📋 Planned |
| **Calendar** | Date picker with range selection and locale support | 📋 Planned |

## 🏗 Architecture

\`\`\`
aurora-ui/
├── src/
│   ├── components/       # Component implementations
│   │   ├── Button/
│   │   │   ├── Button.tsx
│   │   │   ├── Button.test.tsx
│   │   │   └── Button.stories.tsx
│   │   └── index.ts      # Barrel exports
│   ├── hooks/            # Shared hooks (useControllableState, etc.)
│   ├── styles/           # Tailwind preset + CSS variables
│   ├── utils/            # cn() helper, polymorphic component types
│   └── index.ts          # Public API
├── stories/              # Storybook stories
├── tailwind-preset.js    # Extend your Tailwind config
└── vitest.config.ts      # Test configuration
\`\`\`

## 🧪 Testing

Every component ships with:

- **Unit tests** — Vitest + React Testing Library
- **Interaction tests** — Storybook play functions
- **Visual regression** — Chromatic screenshot diffs
- **A11y audits** — axe-core integration in CI

\`\`\`bash
npm test              # Run unit tests
npm run test:a11y     # Run accessibility tests
npm run test:visual   # Run visual regression
\`\`\`

## 📦 Tree-Shaking

Aurora ships ESM-only with full tree-shaking support. Import only what you need:

\`\`\`tsx
// ✅ Only the Button bundle is included
import { Button } from 'aurora-ui'
\`\`\`

## 🤝 Contributing

1. Fork the repo
2. Create your feature branch (\`git checkout -b feat/amazing-feature\`)
3. Write tests for your changes
4. Run \`npm test\` and \`npm run lint\`
5. Open a Pull Request

See [CONTRIBUTING.md](CONTRIBUTING.md) for detailed guidelines.

## 📄 License

MIT © Kai Nakamura`,
    fileTree: [
      {
        name: 'README.md', type: 'file',
        content: `# ✨ Aurora UI\n\n> A sleek, accessible React component library built with Tailwind CSS and Radix primitives.\n\n## Quick Start\n\n\`\`\`bash\nnpm install aurora-ui\n\`\`\`\n\n## Components\n\nButton, Dialog, TextField, Select, Toast, Tooltip, DropdownMenu, Tabs`,
        size: '1.8 KB', language: 'Markdown',
      },
      { name: '.gitignore', type: 'file', content: 'node_modules/\n.env\n.DS_Store\ndist/', size: '0.1 KB' },
      { name: 'package.json', type: 'file', content: JSON.stringify({ name: 'aurora-ui', version: '2.4.0', main: 'dist/index.js', types: 'dist/index.d.ts', scripts: { build: 'tsup', test: 'vitest', storybook: 'storybook dev -p 6006' }, peerDependencies: { react: '>=18', 'react-dom': '>=18' } }, null, 2), size: '0.6 KB', language: 'JSON' },
      { name: 'tailwind-preset.js', type: 'file', content: `// Aurora UI Tailwind preset\nexport default {\n  theme: {\n    extend: {\n      colors: {\n        aurora: {\n          50: '#f0f5ff',\n          500: '#6366f1',\n          600: '#4f46e5',\n          900: '#312e81',\n        },\n      },\n    },\n  },\n}`, size: '0.3 KB', language: 'JavaScript' },
      {
        name: 'src', type: 'folder', children: [
          { name: 'index.ts', type: 'file', content: `export { Button } from './components/Button'\nexport { Dialog } from './components/Dialog'\nexport { TextField } from './components/TextField'\nexport { Toast } from './components/Toast'\nexport { Tooltip } from './components/Tooltip'`, size: '0.3 KB', language: 'TypeScript' },
          {
            name: 'components', type: 'folder', children: [
              {
                name: 'Button.tsx', type: 'file',
                content: `import { forwardRef } from 'react'\nimport { cn } from '../utils/cn'\nimport { cva, type VariantProps } from 'class-variance-authority'\n\nconst buttonVariants = cva(\n  'inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-aurora-500 disabled:pointer-events-none disabled:opacity-50',\n  {\n    variants: {\n      variant: {\n        primary: 'bg-aurora-600 text-white hover:bg-aurora-700',\n        secondary: 'bg-gray-100 text-gray-900 hover:bg-gray-200',\n        ghost: 'hover:bg-gray-100',\n        danger: 'bg-red-600 text-white hover:bg-red-700',\n      },\n      size: {\n        sm: 'h-8 px-3',\n        md: 'h-10 px-4',\n        lg: 'h-12 px-6',\n      },\n    },\n    defaultVariants: { variant: 'primary', size: 'md' },\n  }\n)\n\nexport interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> {\n  isLoading?: boolean\n}\n\nexport const Button = forwardRef<HTMLButtonElement, ButtonProps>(\n  ({ className, variant, size, isLoading, children, ...props }, ref) => (\n    <button className={cn(buttonVariants({ variant, size, className }))} ref={ref} disabled={isLoading} {...props}>\n      {isLoading && <span className="mr-2 h-4 w-4 animate-spin border-2 border-current border-t-transparent rounded-full" />}\n      {children}\n    </button>\n  )\n)`,
                size: '1.2 KB', language: 'TypeScript',
              },
            ],
          },
        ],
      },
    ],
  },
  {
    name: 'dotfiles',
    description: 'My personal dev environment config — Neovim, tmux, zsh, and more. One command to set up a beautiful terminal.',
    language: 'Shell',
    visibility: 'public',
    starsCount: 892,
    forksCount: 134,
    hasIssues: false,
    topics: ['dotfiles', 'neovim', 'tmux', 'zsh', 'terminal', 'setup'],
    license: 'MIT',
    defaultReadme: `# 🖥️ dotfiles

> My personal development environment — one command to set up everything.

[![Stars](https://img.shields.io/github/stars/kai-nakamura/dotfiles)](https://github.com/kai-nakamura/dotfiles)
[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

---

## ✨ What's Inside

| Tool | Config | Highlights |
|------|--------|------------|
| **Neovim** | \`nvim/\` | LSP, Treesitter, Telescope, Lualine, custom keymaps |
| **tmux** | \`tmux.conf\` | Sensible prefix (\`Ctrl+A\`), vim navigation, status bar |
| **zsh** | \`zshrc\` | Fast prompt, aliases, plugins via zinit |
| **Starship** | \`starship.toml\` | Minimal cross-shell prompt |
| **Alacritty** | \`alacritty.yml\` | GPU-accelerated, blur, JetBrains Mono |
| **Git** | \`gitconfig\` | Global aliases, diff tools, signing |

## 🚀 Quick Install

\`\`\`bash
git clone https://github.com/kai-nakamura/dotfiles.git ~/dotfiles
cd ~/dotfiles
./install.sh
\`\`\`

The installer will:
1. Back up any existing configs to \`~/.dotfiles-backup/\`
2. Create symlinks from \`~\` to the dotfiles repo
3. Install dependencies (Neovim, tmux, zsh, etc.)
4. Set up zsh as default shell

## 📸 Preview

\`\`\`
┌──────────────────────────────────────────────────────┐
│  ~/Projects/aurora-ui  main  ●  ✓  ✗  ─             │
│  ✦ kai@arch ~ nvim src/Button.tsx                    │
│  ╭────────────────────────────────────────────╮      │
│  │ 1  import { forwardRef } from 'react'      │      │
│  │ 2  import { cn } from '../utils/cn'        │      │
│  │ 3  import { cva, type VariantProps }        │      │
│  │ 4    from 'class-variance-authority'       │      │
│  │ > 5                                       │      │
│  │ 6  const buttonVariants = cva(...)         │      │
│  ╰────────────────────────────────────────────╯      │
│  NORMAL  src/Button.tsx  [+]  5:1                    │
└──────────────────────────────────────────────────────┘
\`\`\`

## 🎨 Theme

Uses a custom **Aurora** color scheme:
- **Primary:** \`#6366f1\` (Indigo)
- **Background:** \`#0f0f23\` (Deep space)
- **Accent:** \`#22d3ee\` (Cyan)
- **Error:** \`#ef4444\` (Red)
- **Success:** \`#10b981\` (Emerald)

## ⚙️ Customization

Each config file is self-contained. Fork this repo and modify:

- \`nvim/lua/keymaps.lua\` — change keybindings
- \`tmux.conf\` — adjust prefix key or status bar
- \`zshrc\` — add/remove plugins

## 📄 License

MIT © Kai Nakamura`,
    fileTree: [
      {
        name: 'README.md', type: 'file',
        content: `# 🖥️ dotfiles\n\nMy personal dev environment config — Neovim, tmux, zsh, and more.\n\n## Quick Install\n\n\`\`\`bash\ngit clone https://github.com/kai-nakamura/dotfiles.git ~/dotfiles\ncd ~/dotfiles && ./install.sh\n\`\`\``,
        size: '1.5 KB', language: 'Markdown',
      },
      { name: '.gitignore', type: 'file', content: '*.swp\n*.swo\n.DS_Store', size: '0.05 KB' },
      { name: 'install.sh', type: 'file', content: `#!/bin/bash\nset -euo pipefail\n\necho "🖥️  Setting up Kai's dev environment..."\n\n# Back up existing configs\nBACKUP_DIR="$HOME/.dotfiles-backup/$(date +%Y%m%d)"\nmkdir -p "$BACKUP_DIR"\n\nfor file in nvim tmux.conf zshrc starship.toml alacritty.yml gitconfig; do\n  [ -e "$HOME/.$file" ] && mv "$HOME/.$file" "$BACKUP_DIR/"\n  ln -sf "$HOME/dotfiles/$file" "$HOME/.$file"\ndone\n\necho "✅ Dotfiles installed! Restart your shell."`, size: '0.4 KB', language: 'Shell' },
      {
        name: 'nvim', type: 'folder', children: [
          { name: 'init.lua', type: 'file', content: `-- Kai's Neovim config\nrequire('plugins')\nrequire('keymaps')\nrequire('options')`, size: '0.1 KB', language: 'Lua' },
          { name: 'options.lua', type: 'file', content: `vim.opt.number = true\nvim.opt.relativenumber = true\nvim.opt.tabstop = 2\nvim.opt.shiftwidth = 2\nvim.opt.expandtab = true\nvim.opt.smartindent = true\nvim.opt.wrap = false\nvim.opt.swapfile = false\nvim.opt.backup = false\nvim.opt.undofile = true\nvim.opt.termguicolors = true`, size: '0.3 KB', language: 'Lua' },
        ],
      },
    ],
  },
  {
    name: 'neuro-search',
    description: 'Full-text search engine with AI-powered relevance ranking. Blazingly fast, memory-efficient, zero dependencies.',
    language: 'Rust',
    visibility: 'public',
    starsCount: 1847,
    forksCount: 312,
    hasIssues: true,
    topics: ['rust', 'search', 'full-text', 'machine-learning', 'information-retrieval', 'cli'],
    license: 'Apache-2.0',
    openIssuesCount: 8,
    defaultReadme: `# 🧠 neuro-search

> Full-text search engine with AI-powered relevance ranking. Blazingly fast, memory-efficient, zero dependencies.

[![Rust](https://img.shields.io/badge/rust-1.75+-orange.svg)](https://rust-lang.org)
[![License](https://img.shields.io/badge/license-Apache--2.0-blue.svg)](LICENSE)
[![Build](https://img.shields.io/github/actions/workflow/status/kai-nakamura/neuro-search/ci.yml)](https://github.com/kai-nakamura/neuro-search/actions)
[![Crate](https://img.shields.io/crates/v/neuro-search.svg)](https://crates.io/crates/neuro-search)

---

## ⚡ Features

- **BM25 + Neural Ranking** — combines traditional information retrieval with learned embeddings
- **Sub-millisecond queries** — indexed 10M documents in < 200ms on commodity hardware
- **Zero dependencies** — pure Rust, no C bindings, no runtime required
- **Incremental indexing** — add/remove documents without rebuilding the index
- **BM25F scoring** — field-weighted scoring for structured documents
- **Typo tolerance** — fuzzy matching with configurable edit distance
- **CLI + Library** — use as a command-line tool or embed in your Rust project

## 🚀 Quick Start

### CLI

\`\`\`bash
# Install
cargo install neuro-search

# Index a directory
neuro-search index ./documents --output ./index.db

# Search
neuro-search search "machine learning" --index ./index.db --limit 10
\`\`\`

### As a Library

\`\`\`rust
use neuro_search::{Index, Query};

fn main() -> Result<(), Box<dyn std::error::Error>> {
    // Create or load an index
    let mut index = Index::create("./my-index.db")?;
    
    // Add documents
    index.add_document(Document {
        id: "readme-1".into(),
        title: "Getting Started".into(),
        body: "Welcome to neuro-search...".into(),
        tags: vec!["intro".into(), "tutorial".into()],
    })?;
    
    // Build the index (BM25 + neural embeddings)
    index.build()?;
    
    // Search with relevance ranking
    let results = index.search(
        Query::new("machine learning")
            .with_limit(10)
            .with_fuzzy(true)
    )?;
    
    for result in results {
        println!("{} (score: {:.3})", result.title, result.score);
    }
    
    Ok(())
}
\`\`\`

## 📊 Benchmarks

| Dataset | Documents | Index Time | Query Time | Memory |
|---------|-----------|------------|------------|--------|
| enwiki-2023 | 10M | 48s | 0.3ms | 1.2GB |
| github-code | 5M | 22s | 0.2ms | 800MB |
| stackoverflow | 2M | 9s | 0.1ms | 340MB |

*Benchmarked on M2 MacBook Pro, 16GB RAM*

## 🏗 Architecture

\`\`\`
neuro-search/
├── crates/
│   ├── neuro-core/        # Core index and query engine
│   ├── neuro-tokenizer/   # Multilingual tokenizer
│   ├── neuro-embeddings/  # ONNX neural embeddings
│   └── neuro-cli/         # CLI interface
├── benches/               # Criterion benchmarks
└── tests/                 # Integration tests
\`\`\`

## 🔧 Configuration

\`\`\`toml
[search]
max_results = 10
fuzzy_distance = 2
boost_title = 2.0
boost_tags = 1.5

[embedding]
model = "all-MiniLM-L6-v2"
batch_size = 128
\`\`\`

## 🤝 Contributing

Contributions welcome! Please read [CONTRIBUTING.md](CONTRIBUTING.md).

## 📄 License

Apache-2.0 © Kai Nakamura`,
    fileTree: [
      {
        name: 'README.md', type: 'file',
        content: `# 🧠 neuro-search\n\n> Full-text search engine with AI-powered relevance ranking.\n\n## Quick Start\n\n\`\`\`bash\ncargo install neuro-search\nneuro-search index ./docs --output ./index.db\nneuro-search search "query" --index ./index.db\n\`\`\``,
        size: '1.6 KB', language: 'Markdown',
      },
      { name: 'Cargo.toml', type: 'file', content: `[package]\nname = "neuro-search"\nversion = "0.9.4"\nedition = "2021"\nlicense = "Apache-2.0"\n\n[dependencies]\ntokenizers = "0.15"\nndarray = "0.15"\nserde = { version = "1", features = ["derive"] }\nclap = { version = "4", features = ["derive"] }\n\n[dev-dependencies]\ncriterion = "0.5"`, size: '0.4 KB', language: 'TOML' },
      {
        name: 'crates', type: 'folder', children: [
          {
            name: 'neuro-core', type: 'folder', children: [
              {
                name: 'src', type: 'folder', children: [
                  { name: 'lib.rs', type: 'file', content: `pub mod index;\npub mod query;\npub mod scoring;\n\npub struct Document {\n    pub id: String,\n    pub title: String,\n    pub body: String,\n    pub tags: Vec<String>,\n}`, size: '0.2 KB', language: 'Rust' },
                ],
              },
            ],
          },
        ],
      },
    ],
  },
  {
    name: 'pixel-dungeon',
    description: 'A browser-based roguelike dungeon crawler built with TypeScript and Canvas API. Procedurally generated levels, permadeath, retro pixel art.',
    language: 'TypeScript',
    visibility: 'public',
    starsCount: 2156,
    forksCount: 478,
    hasIssues: true,
    topics: ['game', 'roguelike', 'typescript', 'canvas', 'pixel-art', 'procedural-generation'],
    license: 'MIT',
    openIssuesCount: 22,
    defaultReadme: `# 🗡️ Pixel Dungeon

> A browser-based roguelike dungeon crawler with procedural generation and retro pixel art.

[![Play Now](https://img.shields.io/badge/PLAY-online-brightgreen.svg)](https://pixel-dungeon.kai.dev)
[![TypeScript](https://img.shields.io/badge/typescript-5.3-blue.svg)](https://typescriptlang.org)
[![Canvas API](https://img.shields.io/badge/render-Canvas-orange.svg)](https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API)
[![MIT License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

---

## 🎮 About

Born from a love of **Nethack**, **Binding of Isaac**, and **Slay the Spire**. Pixel Dungeon is a turn-based roguelike where every run is unique — procedurally generated dungeons, randomized loot, and permanent death.

### Features

- **🏰 Procedural Generation** — BSP tree dungeon generation with guaranteed solvability
- **⚔️ Turn-Based Combat** — tactical positioning matters, every move counts
- **🎭 8 Character Classes** — Warrior, Mage, Rogue, Archer, Necromancer, Paladin, Monk, Alchemist
- **🎒 Inventory System** — weapons, armor, potions, scrolls, rings, and artifacts
- **💀 Permadeath** — when you die, the dungeon resets. No save scumming.
- **📊 Score Leaderboard** — compete for the deepest run
- **🌐 Multiplayer Spectator** — share your run with friends in real-time

## 🚀 Play

Visit **[pixel-dungeon.kai.dev](https://pixel-dungeon.kai.dev)** or run locally:

\`\`\`bash
git clone https://github.com/kai-nakamura/pixel-dungeon.git
cd pixel-dungeon
npm install
npm run dev
\`\`\`

Open \`http://localhost:3000\` and start descending.

## 🎮 Controls

| Key | Action |
|-----|--------|
| \`WASD\` / \`Arrow Keys\` | Move |
| \`Space\` / \`Enter\` | Interact / Pick up |
| \`I\` | Inventory |
| \`E\` | Use item |
| \`.\` | Wait a turn |
| \`>\` | Descend stairs |
| \`Ctrl+Q\` | Quit (confirm) |

## 🏗 Tech Stack

- **Rendering:** HTML5 Canvas with custom sprite renderer
- **Engine:** Custom ECS (Entity Component System) in TypeScript
- **Generation:** Binary Space Partitioning + random walk corridors
- **Combat:** Modified D&D 5e simplified rules
- **Audio:** Web Audio API for retro chiptune SFX
- **Build:** Vite + TypeScript, zero runtime dependencies

## 📂 Project Structure

\`\`\`
pixel-dungeon/
├── src/
│   ├── engine/          # ECS core, game loop, input handler
│   ├── systems/         # Rendering, physics, combat, AI
│   ├── components/      # Position, Health, Inventory, etc.
│   ├── entities/        # Player, enemies, items, tiles
│   ├── generation/      # BSP dungeon generator, loot tables
│   ├── renderer/        # Canvas sprite renderer, camera
│   ├── audio/           # Sound effects manager
│   ├── ui/              # HUD, inventory screen, death screen
│   └── main.ts          # Entry point
├── assets/              # Sprites, tilesets, fonts, sounds
├── tests/               # Unit + integration tests
└── public/              # Static HTML shell
\`\`\`

## 🎨 Art Style

16x16 pixel art sprites with a limited 32-color palette inspired by Game Boy and NES aesthetics. All sprites are hand-crafted in Aseprite.

## 📄 License

MIT © Kai Nakamura`,
    fileTree: [
      {
        name: 'README.md', type: 'file',
        content: `# 🗡️ Pixel Dungeon\n\n> A browser-based roguelike dungeon crawler with procedural generation.\n\n## Play\n\n\`\`\`bash\nnpm install && npm run dev\n\`\`\`\n\nOpen http://localhost:3000`,
        size: '1.7 KB', language: 'Markdown',
      },
      { name: '.gitignore', type: 'file', content: 'node_modules/\ndist/\n.DS_Store', size: '0.05 KB' },
      { name: 'package.json', type: 'file', content: JSON.stringify({ name: 'pixel-dungeon', version: '1.0.0', scripts: { dev: 'vite', build: 'tsc && vite build', test: 'vitest' }, dependencies: { 'esbuild-wasm': '^0.19.0' }, devDependencies: { vite: '^5.0.0', typescript: '^5.3.0', vitest: '^1.0.0' } }, null, 2), size: '0.5 KB', language: 'JSON' },
      {
        name: 'src', type: 'folder', children: [
          { name: 'main.ts', type: 'file', content: `import { GameEngine } from './engine/GameEngine'\nimport { DungeonGenerator } from './generation/DungeonGenerator'\nimport { CanvasRenderer } from './renderer/CanvasRenderer'\n\nconst canvas = document.getElementById('game') as HTMLCanvasElement\nconst engine = new GameEngine(new CanvasRenderer(canvas))\nconst dungeon = new DungeonGenerator({ width: 80, height: 40, rooms: 12 })\n\nengine.init(dungeon.generate())\nengine.start()`, size: '0.3 KB', language: 'TypeScript' },
          {
            name: 'engine', type: 'folder', children: [
              { name: 'GameEngine.ts', type: 'file', content: `export class GameEngine {\n  private running = false\n  private lastTime = 0\n\n  constructor(private renderer: Renderer) {}\n\n  init(world: World) {\n    this.world = world\n  }\n\n  start() {\n    this.running = true\n    requestAnimationFrame(this.loop.bind(this))\n  }\n\n  private loop(time: number) {\n    const dt = time - this.lastTime\n    this.lastTime = time\n    this.update(dt)\n    this.renderer.render(this.world)\n    if (this.running) requestAnimationFrame(this.loop.bind(this))\n  }\n}`, size: '0.5 KB', language: 'TypeScript' },
            ],
          },
        ],
      },
    ],
  },
  {
    name: 'api-forge',
    description: 'Scaffold production-ready REST and GraphQL APIs in seconds. Generates TypeScript, OpenAPI specs, and Docker configs from a YAML schema.',
    language: 'Go',
    visibility: 'public',
    starsCount: 1203,
    forksCount: 198,
    hasIssues: true,
    topics: ['cli', 'api', 'graphql', 'openapi', 'code-generation', 'scaffold'],
    license: 'MIT',
    openIssuesCount: 6,
    defaultReadme: `# ⚒️ API Forge

> Scaffold production-ready REST and GraphQL APIs in seconds. Generates TypeScript, OpenAPI specs, and Docker configs from a YAML schema.

[![Go](https://img.shields.io/badge/go-1.21+-00ADD8.svg)](https://go.dev)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Release](https://img.shields.io/github/v/release/kai-nakamura/api-forge)](https://github.com/kai-nakamura/api-forge/releases)

---

## 🔥 Why API Forge?

Writing the same boilerplate for every new API project is tedious. API Forge reads a **YAML schema** and generates:

- **TypeScript server** (Express or Fastify)
- **Type-safe client SDK** (fetch + Zod validation)
- **OpenAPI 3.1 spec** (for Swagger UI, Postman, etc.)
- **GraphQL schema** + resolvers
- **Docker + docker-compose** configs
- **Database migrations** (Prisma or Drizzle)

## ⚡ Quick Start

### 1. Define your schema

\`\`\`yaml
# api-schema.yml
name: bookshelf
version: "1.0.0"

models:
  Book:
    fields:
      title: { type: string, required: true }
      author: { type: string, required: true }
      isbn: { type: string, unique: true }
      rating: { type: float, min: 0, max: 5 }
      publishedAt: { type: datetime }

  Author:
    fields:
      name: { type: string, required: true }
      bio: { type: string }
      books: { type: relation, model: Book, hasMany: true }

routes:
  - model: Book
    operations: [list, get, create, update, delete]
    auth: jwt
  - model: Author
    operations: [list, get, create]
    auth: jwt
\`\`\`

### 2. Generate

\`\`\`bash
api-forge generate api-schema.yml --output ./bookshelf-api
\`\`\`

### 3. Run

\`\`\`bash
cd bookshelf-api
docker-compose up -d
npm run dev
\`\`\`

Your API is now running at \`http://localhost:4000\` with:
- REST: \`GET /api/books\`, \`POST /api/books\`, etc.
- GraphQL: \`http://localhost:4000/graphql\`
- Swagger: \`http://localhost:4000/docs\`

## 📋 What Gets Generated

\`\`\`
bookshelf-api/
├── src/
│   ├── routes/           # Express/Fastify route handlers
│   ├── models/           # TypeScript types + Zod schemas
│   ├── services/         # Business logic layer
│   ├── middleware/        # Auth, validation, error handling
│   └── index.ts          # Server entry point
├── prisma/
│   └── schema.prisma     # Database schema
├── graphql/
│   ├── schema.graphql    # GraphQL schema
│   └── resolvers/        # Generated resolvers
├── client/
│   └── sdk.ts            # Type-safe client SDK
├── docker-compose.yml
├── Dockerfile
└── openapi.yml           # OpenAPI 3.1 spec
\`\`\`

## 🛠 CLI Options

\`\`\`
api-forge generate [schema] [flags]

Flags:
  -o, --output string    Output directory (default "./generated")
  -f, --framework string Server framework: express|fastify (default "express")
  -d, --database string  Database: prisma|drizzle|none (default "prisma")
  --graphql              Generate GraphQL schema and resolvers
  --docker               Generate Dockerfile and docker-compose
  --client               Generate TypeScript client SDK
\`\`\`

## 📄 License

MIT © Kai Nakamura`,
    fileTree: [
      {
        name: 'README.md', type: 'file',
        content: `# ⚒️ API Forge\n\n> Scaffold production-ready REST and GraphQL APIs in seconds.\n\n## Quick Start\n\n\`\`\`bash\ngo install github.com/kai-nakamura/api-forge@latest\napi-forge generate api-schema.yml --output ./my-api\n\`\`\``,
        size: '1.4 KB', language: 'Markdown',
      },
      { name: 'go.mod', type: 'file', content: `module github.com/kai-nakamura/api-forge\n\ngo 1.21\n\nrequire (\n\tgopkg.in/yaml.v3 v3.0.1\n\tgithub.com/spf13/cobra v1.8.0\n)`, size: '0.2 KB', language: 'Go' },
      {
        name: 'cmd', type: 'folder', children: [
          {
            name: 'generate.go', type: 'file',
            content: `package cmd\n\nimport (\n\t"fmt"\n\t"os"\n\n\t"github.com/spf13/cobra"\n\t"github.com/kai-nakamura/api-forge/pkg/generator"\n)\n\nvar generateCmd = &cobra.Command{\n\tUse:   "generate [schema]",\n\tShort: "Generate API from YAML schema",\n\tArgs:  cobra.ExactArgs(1),\n\tRunE: func(cmd *cobra.Command, args []string) error {\n\t\tschema, err := generator.ParseSchema(args[0])\n\t\tif err != nil {\n\t\t\treturn fmt.Errorf("failed to parse schema: %w", err)\n\t\t}\n\t\toutput, _ := cmd.Flags().GetString("output")\n\t\treturn generator.Generate(schema, output)\n\t},\n}\n\nfunc init() {\n\tgenerateCmd.Flags().StringP("output", "o", "./generated", "Output directory")\n\trootCmd.AddCommand(generateCmd)\n}`,
            size: '0.7 KB', language: 'Go',
          },
        ],
      },
    ],
  },
]

// ─── Repos for Bishesh ─────────────────────────────────────────────────────

const bisheshRepos = [
  {
    name: 'codehalaam',
    description: 'The gamified code hosting platform — free private repos, unlimited collaborators, XP rewards.',
    language: 'TypeScript',
    visibility: 'public',
    starsCount: 4512,
    forksCount: 789,
    hasIssues: true,
    topics: ['code-hosting', 'gamification', 'react', 'node', 'mongodb'],
    license: 'MIT',
    openIssuesCount: 32,
    openPullRequestsCount: 7,
  },
  {
    name: 'quantum-state-engine',
    description: 'High-performance state management with predictable updates',
    language: 'Rust',
    visibility: 'public',
    starsCount: 1923,
    forksCount: 267,
    topics: ['state-management', 'rust', 'performance'],
    license: 'Apache-2.0',
  },
]

// ─── Repos for other users ─────────────────────────────────────────────────

const neoRepos = [
  {
    name: 'neural-link-ui',
    description: 'A component library for building accessible web interfaces with React',
    language: 'TypeScript',
    visibility: 'public',
    starsCount: 2847,
    forksCount: 423,
    topics: ['react', 'components', 'accessibility', 'ui'],
    license: 'MIT',
  },
]

const sarahRepos = [
  {
    name: 'hologram-css',
    description: 'CSS framework that generates responsive layouts with minimal markup',
    language: 'CSS',
    visibility: 'public',
    starsCount: 891,
    forksCount: 134,
    topics: ['css', 'framework', 'responsive'],
    license: 'MIT',
  },
]

const mikeRepos = [
  {
    name: 'darknet-api',
    description: 'Encrypted API gateway with zero-knowledge proof authentication',
    language: 'Go',
    visibility: 'private',
    starsCount: 1200,
    forksCount: 89,
    topics: ['api', 'security', 'encryption'],
    license: 'MIT',
  },
]

const alexRepos = [
  {
    name: 'synth-wave-cli',
    description: 'Terminal interface with gesture recognition and accessibility features',
    language: 'TypeScript',
    visibility: 'public',
    starsCount: 1567,
    forksCount: 201,
    topics: ['cli', 'terminal', 'accessibility'],
    license: 'MIT',
  },
]

// ─── Seed Function ─────────────────────────────────────────────────────────

async function seed() {
  try {
    console.log('[SEED] Connecting to MongoDB...')
    await mongoose.connect(MONGODB_URI)
    console.log('[SEED] Connected to MongoDB')

    // Clear existing data
    console.log('[SEED] Clearing existing data...')
    await Promise.all([
      User.deleteMany({}),
      Repository.deleteMany({}),
      Issue.deleteMany({}),
      PullRequest.deleteMany({}),
      Collaborator.deleteMany({}),
      Commit.deleteMany({}),
      Quest.deleteMany({}),
      Offering.deleteMany({}),
      Path.deleteMany({}),
      Comment.deleteMany({}),
      Release.deleteMany({}),
    ])

    // Create users
    console.log('[SEED] Creating users...')
    const users = {}
    for (const userData of seedUsers) {
      const user = await User.create({
        ...userData,
        contributionDays: generateContributions(),
        website: `https://${userData.username}.dev`,
      })
      users[user.username] = user
      console.log(`  Created user: ${user.username} ${user.isAdmin ? '(admin)' : ''}`)
    }

    const bishesh = users['bishesh']
    const kai = users['kai-nakamura']
    const neo = users['neo-coder']
    const sarah = users['sarah-dev']
    const mike = users['mike-reviewer']
    const alex = users['contributor-99']

    // ─── Create Repos ────────────────────────────────────────────────────
    console.log('[SEED] Creating repositories...')

    // Kai's repos (5 beautiful projects)
    const kaiRepoDocs = []
    for (const repoData of kaiRepos) {
      const repo = await Repository.create({
        ...repoData,
        owner: kai._id,
        branches: [{ name: 'main', isDefault: true }, { name: 'develop' }],
        fileTree: repoData.fileTree || [
          { name: 'README.md', type: 'file', content: `# ${repoData.name}\n\n${repoData.description}`, size: '1.2 KB', language: 'Markdown' },
          { name: '.gitignore', type: 'file', content: 'node_modules/\n.env\n.DS_Store\ndist/', size: '0.1 KB' },
        ],
      })
      kaiRepoDocs.push(repo)
      console.log(`  📦 Created repo: kai-nakamura/${repo.name} (${repo.language})`)
    }

    // Bishesh's repos
    for (const repoData of bisheshRepos) {
      const repo = await Repository.create({
        ...repoData,
        owner: bishesh._id,
        branches: [{ name: 'main', isDefault: true }],
        fileTree: [
          { name: 'README.md', type: 'file', content: `# ${repoData.name}\n\n${repoData.description}`, size: '1.2 KB', language: 'Markdown' },
          { name: '.gitignore', type: 'file', content: 'node_modules/\n.env', size: '0.1 KB' },
        ],
      })
      console.log(`  📦 Created repo: bishesh/${repo.name}`)
    }

    // Other users' repos
    const otherRepoSets = [
      { repos: neoRepos, owner: neo, label: 'neo-coder' },
      { repos: sarahRepos, owner: sarah, label: 'sarah-dev' },
      { repos: mikeRepos, owner: mike, label: 'mike-reviewer' },
      { repos: alexRepos, owner: alex, label: 'contributor-99' },
    ]

    for (const { repos: repoSet, owner, label } of otherRepoSets) {
      for (const repoData of repoSet) {
        const repo = await Repository.create({
          ...repoData,
          owner: owner._id,
          branches: [{ name: 'main', isDefault: true }],
          fileTree: [
            { name: 'README.md', type: 'file', content: `# ${repoData.name}\n\n${repoData.description}`, size: '1.2 KB', language: 'Markdown' },
            { name: '.gitignore', type: 'file', content: 'node_modules/\n.env', size: '0.1 KB' },
          ],
        })
        console.log(`  📦 Created repo: ${label}/${repo.name}`)
      }
    }

    // ─── Create Issues for Kai's Repos ──────────────────────────────────
    console.log('[SEED] Creating issues for Kai\'s repos...')

    const kaiIssues = [
      // aurora-ui issues
      { repo: kaiRepoDocs[0], number: 42, title: 'Button loading spinner not visible on dark backgrounds', state: 'open', author: sarah._id, labels: [{ name: 'bug', color: 'red' }, { name: 'good first issue', color: 'green' }], assignees: [kai._id], bountyXp: 30, body: 'The loading spinner in Button uses `border-current` which is invisible on dark backgrounds. Need to ensure contrast.' },
      { repo: kaiRepoDocs[0], number: 41, title: 'Add Tooltip component', state: 'open', author: kai._id, labels: [{ name: 'enhancement', color: 'blue' }], bountyXp: 80, body: 'Implement a Tooltip component using Radix UI primitive. Should support all placements, delay, and rich content.' },
      { repo: kaiRepoDocs[0], number: 40, title: 'DropdownMenu keyboard navigation broken on Firefox', state: 'open', author: neo._id, labels: [{ name: 'bug', color: 'red' }, { name: 'priority: medium', color: 'yellow' }], body: 'Arrow keys don\'t navigate sub-items in Firefox 121. Works fine in Chrome.' },
      { repo: kaiRepoDocs[0], number: 39, title: 'Add Calendar / DatePicker component', state: 'open', author: kai._id, labels: [{ name: 'enhancement', color: 'blue' }, { name: 'help wanted', color: 'purple' }], bountyXp: 120, body: 'A date picker with range selection, locale support, and keyboard navigation. Should use Radix UI Popover for the dropdown.' },
      { repo: kaiRepoDocs[0], number: 38, title: 'Document polymorphic "as" prop pattern', state: 'closed', author: kai._id, labels: [{ name: 'documentation', color: 'blue' }], closedAt: new Date(Date.now() - 5 * 86400000), closedBy: kai._id },

      // neuro-search issues
      { repo: kaiRepoDocs[2], number: 15, title: 'Support CJK tokenization', state: 'open', author: neo._id, labels: [{ name: 'enhancement', color: 'blue' }, { name: 'i18n', color: 'purple' }], bountyXp: 150, body: 'Chinese, Japanese, and Korean text is not tokenized correctly. Need to add ICU or jieba-based tokenizer.' },
      { repo: kaiRepoDocs[2], number: 14, title: 'Memory leak when indexing large document sets', state: 'open', author: mike._id, labels: [{ name: 'bug', color: 'red' }, { name: 'priority: high', color: 'red' }], body: 'Indexing 5M+ documents causes memory to grow unbounded. Likely the embedding cache is not being flushed.' },
      { repo: kaiRepoDocs[2], number: 13, title: 'Add HTTP API server mode', state: 'open', author: kai._id, labels: [{ name: 'enhancement', color: 'blue' }], bountyXp: 100, body: 'Add a \`neuro-search serve\` command that exposes the search index over HTTP/JSON.' },

      // pixel-dungeon issues
      { repo: kaiRepoDocs[3], number: 28, title: 'Add minimap to HUD', state: 'open', author: sarah._id, labels: [{ name: 'enhancement', color: 'blue' }], bountyXp: 60, body: 'A small minimap in the corner showing explored rooms and the player position.' },
      { repo: kaiRepoDocs[3], number: 27, title: 'Sound effects lag on Safari', state: 'open', author: alex._id, labels: [{ name: 'bug', color: 'red' }, { name: 'browser-compat', color: 'yellow' }], body: 'Web Audio API playback has ~200ms latency on Safari 17. Need to use AudioWorklet instead of ScriptProcessorNode.' },
      { repo: kaiRepoDocs[3], number: 26, title: 'Necromancer class summon mechanic is broken', state: 'open', author: kai._id, labels: [{ name: 'bug', color: 'red' }], body: 'Summoned skeletons disappear when moving between rooms. The entity lifetime is tied to room scope instead of player scope.' },

      // api-forge issues
      { repo: kaiRepoDocs[4], number: 10, title: 'Generate Zod schemas from YAML types', state: 'open', author: kai._id, labels: [{ name: 'enhancement', color: 'blue' }], bountyXp: 75, body: 'Auto-generate Zod validation schemas alongside TypeScript types for runtime validation.' },
      { repo: kaiRepoDocs[4], number: 9, title: 'Support nested model relations in GraphQL', state: 'open', author: neo._id, labels: [{ name: 'enhancement', color: 'blue' }], body: 'Currently only flat models are supported. Need to handle \`hasMany\`, \`belongsTo\`, and \`manyToMany\` relations.' },
    ]

    for (const issue of kaiIssues) {
      await Issue.create({
        ...issue,
        repository: issue.repo._id,
        author: issue.author,
      })
    }
    console.log(`  Created ${kaiIssues.length} issues across Kai's repos`)

    // ─── Create Pull Requests for Kai's Repos ────────────────────────────
    console.log('[SEED] Creating pull requests for Kai\'s repos...')

    const kaiPRs = [
      { repo: kaiRepoDocs[0], number: 89, title: 'Add Toast component with auto-dismiss and swipe-to-close', state: 'merged', author: kai._id, base: 'main', head: 'feat/toast-component', additions: 342, deletions: 8, changedFiles: 6, labels: [{ name: 'enhancement', color: 'blue' }], mergedAt: new Date(Date.now() - 12 * 3600000), mergedBy: kai._id },
      { repo: kaiRepoDocs[0], number: 88, title: 'Fix Button focus ring visibility on Safari', state: 'merged', author: sarah._id, base: 'main', head: 'fix/button-focus-safari', additions: 18, deletions: 4, changedFiles: 2, labels: [{ name: 'bug', color: 'red' }], mergedAt: new Date(Date.now() - 3 * 86400000), mergedBy: kai._id },
      { repo: kaiRepoDocs[0], number: 87, title: 'Implement DropdownMenu with sub-menu support', state: 'open', author: kai._id, base: 'main', head: 'feat/dropdown-menu', additions: 567, deletions: 0, changedFiles: 8, labels: [{ name: 'enhancement', color: 'blue' }], requestedReviewers: [neo._id] },
      { repo: kaiRepoDocs[0], number: 86, title: 'Add TextField password toggle and clear button', state: 'open', author: neo._id, base: 'main', head: 'feat/textfield-addons', additions: 124, deletions: 32, changedFiles: 4, labels: [{ name: 'enhancement', color: 'blue' }], requestedReviewers: [kai._id] },
      { repo: kaiRepoDocs[2], number: 22, title: 'Implement BM25F scoring with field weights', state: 'merged', author: kai._id, base: 'main', head: 'feat/bm25f-scoring', additions: 890, deletions: 234, changedFiles: 12, labels: [{ name: 'enhancement', color: 'blue' }], mergedAt: new Date(Date.now() - 7 * 86400000), mergedBy: kai._id },
      { repo: kaiRepoDocs[2], number: 21, title: 'Add fuzzy matching with edit distance', state: 'open', author: kai._id, base: 'main', head: 'feat/fuzzy-search', additions: 234, deletions: 12, changedFiles: 5, labels: [{ name: 'enhancement', color: 'blue' }], requestedReviewers: [mike._id] },
      { repo: kaiRepoDocs[3], number: 35, title: 'Implement BSP dungeon generation algorithm', state: 'merged', author: kai._id, base: 'main', head: 'feat/bsp-dungeon', additions: 1200, deletions: 0, changedFiles: 15, labels: [{ name: 'enhancement', color: 'blue' }], mergedAt: new Date(Date.now() - 14 * 86400000), mergedBy: kai._id },
      { repo: kaiRepoDocs[3], number: 34, title: 'Add Necromancer class with summon ability', state: 'open', author: kai._id, base: 'main', head: 'feat/necromancer-class', additions: 456, deletions: 23, changedFiles: 8, labels: [{ name: 'enhancement', color: 'blue' }, { name: 'class', color: 'purple' }], requestedReviewers: [sarah._id] },
      { repo: kaiRepoDocs[4], number: 15, title: 'Add Prisma schema generation from YAML', state: 'merged', author: kai._id, base: 'main', head: 'feat/prisma-gen', additions: 678, deletions: 45, changedFiles: 10, labels: [{ name: 'enhancement', color: 'blue' }], mergedAt: new Date(Date.now() - 5 * 86400000), mergedBy: kai._id },
    ]

    for (const pr of kaiPRs) {
      await PullRequest.create({
        ...pr,
        repository: pr.repo._id,
        author: pr.author,
      })
    }
    console.log(`  Created ${kaiPRs.length} pull requests across Kai's repos`)

    // ─── Create Collaborators for Kai's aurora-ui ────────────────────────
    console.log('[SEED] Creating collaborators...')
    await Collaborator.create({ codex: kaiRepoDocs[0]._id, user: sarah._id, repository: kaiRepoDocs[0]._id, role: 'Write', addedBy: kai._id, invitedBy: kai._id, pending: false, acceptedAt: new Date() })
    await Collaborator.create({ codex: kaiRepoDocs[0]._id, user: neo._id, repository: kaiRepoDocs[0]._id, role: 'Write', addedBy: kai._id, invitedBy: kai._id, pending: false, acceptedAt: new Date() })
    console.log('  Created collaborators for kai-nakamura/aurora-ui')

    // ─── Create Commits for Kai's Repos ─────────────────────────────────
    console.log('[SEED] Creating commits for Kai\'s repos...')

    const kaiCommits = [
      // aurora-ui commits
      'Initial commit', 'Add Button component with variants', 'Add Dialog component using Radix UI',
      'Implement TextField with label and error state', 'Add Toast notification system', 'Fix Safari focus ring bug',
      'Add Tooltip component', 'Update documentation with usage examples',
      // neuro-search commits
      'Implement BM25 scoring engine', 'Add incremental indexing', 'Implement BM25F field weighting',
      'Add fuzzy matching with Levenshtein distance', 'Benchmarks: 10M docs in 48s',
      // pixel-dungeon commits
      'Initial commit — game engine skeleton', 'Implement BSP dungeon generation', 'Add player movement and collision',
      'Implement 8 character classes', 'Add inventory system with item slots', 'Pixel art sprites for all enemies',
      // api-forge commits
      'Initial commit — YAML parser and CLI scaffold', 'Implement TypeScript code generation', 'Add Prisma schema generation',
      'Add Docker and docker-compose output', 'Implement OpenAPI 3.1 spec generation',
      // dotfiles commits
      'Initial commit — add all configs', 'Add Neovim LSP configuration', 'Update tmux status bar theme',
    ]

    // Distribute commits across repos (more for aurora-ui and neuro-search)
    const repoCommitMap = [
      ...Array(8).fill(0),  // aurora-ui: 8 commits
      ...Array(5).fill(1),  // neuro-search: 5 commits
      ...Array(6).fill(2),  // pixel-dungeon: 6 commits
      ...Array(5).fill(3),  // api-forge: 5 commits
      ...Array(3).fill(4),  // dotfiles: 3 commits
    ]

    for (let i = 0; i < kaiCommits.length; i++) {
      const repoIdx = repoCommitMap[i]
      if (repoIdx >= kaiRepoDocs.length) continue
      const sha = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
      await Commit.create({
        sha,
        message: kaiCommits[i],
        author: kai._id,
        repository: kaiRepoDocs[repoIdx]._id,
        branch: 'main',
        additions: Math.floor(Math.random() * 200) + 10,
        deletions: Math.floor(Math.random() * 50),
        filesChanged: Math.floor(Math.random() * 8) + 1,
      })
    }
    console.log(`  Created ${kaiCommits.length} commits across Kai's repos`)

    // ═══════════════════════════════════════════════════════════════════
    //  BARRY DEMO DATA — Codex Home, Quests, Offerings, etc.
    // ═══════════════════════════════════════════════════════════════════
    console.log('[SEED] Creating Barry demo data...')

    // Use Kai's aurora-ui as the demo Codex
    const demoCodex = kaiRepoDocs[0] // aurora-ui

    // Paths
    const defaultPath = await Path.create({ codex: demoCodex._id, name: 'main', createdBy: kai._id, isDefault: true })
    const devPath = await Path.create({ codex: demoCodex._id, name: 'develop', createdBy: kai._id, isDefault: false })
    const featPath = await Path.create({ codex: demoCodex._id, name: 'feat/toast-component', createdBy: kai._id, isDefault: false })
    console.log('  Created paths: main, develop, feat/toast-component')

    // Quests
    const q1 = await Quest.create({
      codex: demoCodex._id, number: 1, title: 'Add dark mode toggle to navbar',
      body: 'The theme toggle should use localStorage to persist user preference.\n\n## Requirements\n- Toggle between dark/light\n- Persist preference\n- Respect system preference',
      status: 'Open', bountyXp: 30, author: sarah._id, assignees: [kai._id],
    })
    const q2 = await Quest.create({
      codex: demoCodex._id, number: 2, title: 'Fix tooltip positioning on edge of screen',
      body: 'Tooltips near the viewport edge overflow. Need to flip position when near edge.',
      status: 'In Progress', bountyXp: 20, author: neo._id, assignees: [neo._id],
    })
    console.log('  Created 2 quests for demo codex')

    // Comments on Quest 1
    await Comment.create({ targetType: 'Quest', targetId: q1._id, author: kai._id, body: 'Great idea! I\'ll start on this next sprint.' })
    await Comment.create({ targetType: 'Quest', targetId: q1._id, author: sarah._id, body: 'I have some mockups ready — will share them tomorrow.' })
    await Comment.create({ targetType: 'Quest', targetId: q2._id, author: mike._id, body: 'This is a known issue with Radix UI. We should use `sideOffset` prop.' })
    console.log('  Created comments on quests')

    // Offerings
    const o1 = await Offering.create({
      codex: demoCodex._id, number: 1, title: 'Implement Toast notification component',
      body: 'Adds a Toast component with auto-dismiss, swipe-to-close, and multiple variants (success, error, info).\n\nCloses Quest #3.',
      sourcePath: 'feat/toast-component', targetPath: 'main', status: 'Bound',
      author: kai._id, boundAt: new Date(Date.now() - 2 * 86400000),
    })
    const o2 = await Offering.create({
      codex: demoCodex._id, number: 2, title: 'Add DropdownMenu with keyboard navigation',
      body: 'Implements a fully keyboard-navigable dropdown menu with sub-menu support.',
      sourcePath: 'feat/dropdown-menu', targetPath: 'main', status: 'Open',
      author: kai._id,
    })
    console.log('  Created 2 offerings for demo codex')

    // Comments on Offering 2
    await Comment.create({ targetType: 'Offering', targetId: o2._id, author: sarah._id, body: 'Looks great! A few suggestions on the focus trap logic...' })
    console.log('  Created comments on offerings')

    // Releases
    const rel1 = await Release.create({
      codex: demoCodex._id, tagName: 'v2.4.0', title: 'Aurora UI v2.4.0 — Toast & Tooltip',
      body: '## What\'s Changed\n\n- **Toast** component with auto-dismiss and swipe-to-close\n- **Tooltip** component with delay and rich content\n- Fixed Safari focus ring visibility\n\n## Breaking Changes\n\nNone. This is a minor release.',
      author: kai._id,
    })
    console.log('  Created release v2.4.0 for demo codex')

    // Collaborators (already exist from earlier seed, but let's add more)
    await Collaborator.create({
      codex: demoCodex._id, repository: demoCodex._id, user: mike._id,
      role: 'Write', addedBy: kai._id, invitedBy: kai._id, pending: false, acceptedAt: new Date(),
    })
    console.log('  Added mike-reviewer as collaborator')

    // Update codex counters
    demoCodex.nextQuestNumber = 3
    demoCodex.nextOfferingNumber = 3
    demoCodex.embers = [neo._id, sarah._id]
    demoCodex.watchers = [mike._id, alex._id]
    demoCodex.echoes = [neo._id]
    await demoCodex.save()
    console.log('  Updated codex counters and social data')

    console.log('\n[SEED] ✅ Seed completed successfully!')
    console.log('[SEED] ─────────────────────────────────────────')
    console.log('[SEED] 🔐 Admin:  bishesh@codehalaam.dev / password123')
    console.log('[SEED] 🎮 Demo:   kai@codehalaam.dev    / password123')
    console.log('[SEED] 👤 Others: neo@, sarah@, mike@, alex@ (all password123)')
    console.log('[SEED] ─────────────────────────────────────────')
    console.log(`[SEED] 📦 Kai's repos: ${kaiRepos.map(r => r.name).join(', ')}`)
    console.log('[SEED] 🏠 Demo Codex: /codex/kai-nakamura/aurora-ui')
    console.log('[SEED] 📂 Code:        /codex/kai-nakamura/aurora-ui/code')

    await mongoose.disconnect()
    process.exit(0)
  } catch (err) {
    console.error('[SEED] Error:', err)
    process.exit(1)
  }
}

seed()
