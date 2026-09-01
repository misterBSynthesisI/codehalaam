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

import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  BookOpen, Upload, GitBranch, FileCode, Terminal, Package,
  FolderPlus, Check, ChevronRight, Cloud,
} from 'lucide-react'

const SECTIONS = [
  {
    id: 'getting-started',
    icon: BookOpen,
    title: 'Getting Started',
    content: `CODEHALAAM is a gamified code hosting platform. You can create repositories (codexes), push code, open quests (issues), submit offerings (pull requests), and earn XP for every contribution.

**Key terminology:**
- Repository = Codex
- Branch = Path
- Issue = Quest
- Pull Request = Offering
- Star = Ember
- Fork = Echo
- Merge = Bind

Every action earns XP. Level up by contributing!`,
  },
  {
    id: 'create-codex',
    icon: FolderPlus,
    title: 'Creating Your First Codex',
    content: `1. Sign in and click **New Codex** (or navigate to /new).
2. Give it a name, description, and choose public or private.
3. Select a license (MIT is recommended for open source).
4. Click **Create Codex**.

Your codex is now live with a default README.md, .gitignore, and package.json.`,
  },
  {
    id: 'git-push',
    icon: GitBranch,
    title: 'Pushing Your Project via Git',
    content: `CODEHALAAM supports standard Git. Clone your codex, add files, and push:

\`\`\`bash
# Clone your codex
git clone https://codehalaam.vercel.app/your-username/your-codex.git
cd your-codex

# Add your project files
git add .
git commit -m "Initial project upload"
git push origin main
\`\`\`

If your codex is private, you'll be prompted for your CODEHALAAM username and password (or personal access token).`,
  },
  {
    id: 'upload-file',
    icon: Upload,
    title: 'Uploading Project Files (up to 30 MB)',
    content: `Prefer to upload without Git? You can upload project files directly:

1. Navigate to your codex page.
2. Click **Upload File** in the codex toolbar.
3. Select a file (max 30 MB per file).
4. The file is stored in Vercel Blob (persistent CDN storage).

**Accepted file types:**
- Archives: .zip, .tar, .gz, .tgz, .bz2, .7z, .rar
- Code: .js, .ts, .py, .go, .rs, .java, .c, .cpp, .php, .sh
- Config: .json, .yaml, .yml, .xml, .csv, .env
- Images: .png, .jpg, .jpeg, .gif, .webp, .svg
- Docs: .pdf, .doc, .docx, .md, .txt`,
  },
  {
    id: 'quests-offerings',
    icon: FileCode,
    title: 'Quests & Offerings (Issues & PRs)',
    content: `**Quests (Issues):**
- Open a quest to track bugs, feature requests, or tasks.
- Each quest can have a bounty XP reward.
- Quests are numbered sequentially per codex.

**Offerings (Pull Requests):**
- Submit an offering from a source Path to a target Path.
- Collaborators can review, comment, and bind (merge) offerings.
- Binding an offering awards +50 XP to the author.

**Collaboration:**
- Invite users by username or email.
- Roles: Owner, Admin, Write, Read.
- Non-existing users get an invitation link.`,
  },
  {
    id: 'gamification',
    icon: Package,
    title: 'XP & Gamification',
    content: `Every action earns XP:

| Action | XP |
|--------|-----|
| Commit | +10 |
| Open Offering (PR) | +10 |
| Bind Offering (Merge) | +50 |
| Close Quest | +15 |
| Code Review | +25 |
| Ember (Star) | +2 |
| Echo (Fork) | +15 |
| Comment | +2 |

Level up with a 1.5x XP multiplier per level. Maintain streaks by contributing daily!`,
  },
  {
    id: 'api',
    icon: Terminal,
    title: 'Using the API',
    content: `CODEHALAAM has a full REST API at /api/*. Authenticate with a JWT bearer token:

\`\`\`bash
# Login
curl -X POST https://codehalaam.vercel.app/api/auth/login \\
  -H "Content-Type: application/json" \\
  -d '{"email":"you@example.com","password":"yourpassword"}'

# Use the token
curl https://codehalaam.vercel.app/api/auth/me \\
  -H "Authorization: Bearer <your-token>"
\`\`\`

See the full API reference in the README.`,
  },
  {
    id: 'deployment',
    icon: Cloud,
    title: 'Deploying Your Own CODEHALAAM',
    content: `Want to host your own instance? It's free:

1. Fork the repo on GitHub.
2. Import to Vercel (one-click deploy).
3. Create a free MongoDB Atlas cluster.
4. Set environment variables (MONGODB_URI, JWT_SECRET, CLIENT_URL).
5. Visit /setup to create your admin account.

That's it — one server, one database, free tier.`,
  },
]

export function DocsPage() {
  const [activeSection, setActiveSection] = useState(SECTIONS[0].id)

  return (
    <div style={{ backgroundColor: 'var(--color-canvas-default)', color: 'var(--color-fg-default)', minHeight: '100vh' }}>
      <div className="container-lg py-6 max-w-5xl">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <BookOpen className="w-6 h-6" style={{ color: 'var(--color-accent-fg)' }} />
          <h1 className="text-2xl font-semibold">Developer Documentation</h1>
        </div>

        <div className="flex gap-6">
          {/* Sidebar */}
          <aside className="w-56 shrink-0 hidden md:block">
            <nav className="sticky top-4 space-y-0.5">
              {SECTIONS.map(section => {
                const Icon = section.icon
                return (
                  <button
                    key={section.id}
                    onClick={() => {
                      setActiveSection(section.id)
                      document.getElementById(section.id)?.scrollIntoView({ behavior: 'smooth' })
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-md text-sm text-left transition-colors"
                    style={{
                      backgroundColor: activeSection === section.id ? 'var(--color-accent-muted)' : 'transparent',
                      color: activeSection === section.id ? 'var(--color-accent-fg)' : 'var(--color-fg-muted)',
                    }}
                  >
                    <Icon className="w-4 h-4 shrink-0" />
                    <span className="truncate">{section.title}</span>
                  </button>
                )
              })}
            </nav>
          </aside>

          {/* Content */}
          <div className="flex-1 min-w-0">
            {SECTIONS.map((section, i) => {
              const Icon = section.icon
              return (
                <motion.section
                  key={section.id}
                  id={section.id}
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="Box mb-4"
                >
                  <div className="Box-header">
                    <h2 className="Box-title flex items-center gap-2 text-base">
                      <Icon className="w-4 h-4" style={{ color: 'var(--color-accent-fg)' }} />
                      {section.title}
                    </h2>
                  </div>
                  <div className="Box-body">
                    <div className="prose prose-sm max-w-none">
                      {section.content.split('\n').map((line, idx) => {
                        if (line.startsWith('```')) return null
                        if (line.startsWith('| ')) {
                          return <div key={idx} className="text-xs font-mono overflow-x-auto" style={{ color: 'var(--color-fg-muted)' }}>{line}</div>
                        }
                        if (line.startsWith('# ')) {
                          return <h3 key={idx} className="text-sm font-semibold mt-3 mb-1">{line.slice(2)}</h3>
                        }
                        if (line.startsWith('- ')) {
                          return (
                            <div key={idx} className="flex items-start gap-2 text-sm mb-1">
                              <Check className="w-3.5 h-3.5 mt-0.5 shrink-0" style={{ color: 'var(--color-success-fg)' }} />
                              <span>{renderInline(line.slice(2))}</span>
                            </div>
                          )
                        }
                        if (line.match(/^\d+\./)) {
                          return (
                            <div key={idx} className="flex items-start gap-2 text-sm mb-1">
                              <ChevronRight className="w-3.5 h-3.5 mt-0.5 shrink-0" style={{ color: 'var(--color-accent-fg)' }} />
                              <span>{renderInline(line.replace(/^\d+\.\s*/, ''))}</span>
                            </div>
                          )
                        }
                        if (line.trim() === '') return <div key={idx} className="h-2" />
                        return <p key={idx} className="text-sm mb-2" style={{ color: 'var(--color-fg-default)' }}>{renderInline(line)}</p>
                      })}
                    </div>
                  </div>
                </motion.section>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}

// Simple inline markdown renderer (bold, code, links)
function renderInline(text: string): React.ReactNode {
  const parts = text.split(/(\*\*[^*]+\*\*|`[^`]+`)/g)
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={i}>{part.slice(2, -2)}</strong>
    }
    if (part.startsWith('`') && part.endsWith('`')) {
      return <code key={i} className="px-1 py-0.5 rounded text-xs" style={{ backgroundColor: 'var(--color-canvas-subtle)' }}>{part.slice(1, -1)}</code>
    }
    return part
  })
}
