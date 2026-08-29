import express from 'express'
import Repository from '../models/Repository.js'
import Commit from '../models/Commit.js'
import { protect } from '../middleware/auth.js'

const router = express.Router()

// GET /api/repos - Get user's repos
router.get('/', protect, async (req, res) => {
  try {
    const { sort = 'updated', direction = 'desc', type = 'all' } = req.query

    const query = { owner: req.user._id }
    if (type === 'public') query.visibility = 'public'
    if (type === 'private') query.visibility = 'private'

    const sortObj = {}
    if (sort === 'name') sortObj.name = direction === 'asc' ? 1 : -1
    else if (sort === 'stars') sortObj.starsCount = direction === 'asc' ? 1 : -1
    else sortObj.updatedAt = direction === 'asc' ? 1 : -1

    const repos = await Repository.find(query)
      .sort(sortObj)
      .populate('owner', 'username avatarUrl')

    res.json({ repos, total: repos.length })
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch repositories' })
  }
})

// GET /api/repos/:owner/:name - Get single repo
router.get('/:owner/:name', async (req, res) => {
  try {
    const owner = await (await import('../models/User.js')).default.findOne({ username: req.params.owner })
    if (!owner) {
      return res.status(404).json({ error: 'User not found' })
    }

    const repo = await Repository.findOne({ owner: owner._id, name: req.params.name })
      .populate('owner', 'username displayName avatarUrl')

    if (!repo) {
      return res.status(404).json({ error: 'Repository not found' })
    }

    // Get languages stats
    const languageStats = {}
    const countFiles = (files) => {
      for (const file of files) {
        if (file.type === 'file' && file.language) {
          languageStats[file.language] = (languageStats[file.language] || 0) + 1
        }
        if (file.children?.length) countFiles(file.children)
      }
    }
    countFiles(repo.fileTree)

    const total = Object.values(languageStats).reduce((a, b) => a + b, 0)
    const languages = Object.entries(languageStats).map(([name, count]) => ({
      name,
      percentage: Math.round((count / total) * 100),
    }))

    res.json({ repo, languages })
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch repository' })
  }
})

// POST /api/repos - Create repo
router.post('/', protect, async (req, res) => {
  try {
    const { name, description, visibility, hasIssues, homepage, license, topics } = req.body

    if (!name) {
      return res.status(400).json({ error: 'Repository name is required' })
    }

    // Check for existing repo
    const existing = await Repository.findOne({ owner: req.user._id, name })
    if (existing) {
      return res.status(422).json({ error: 'Repository already exists' })
    }

    // Create repo with default file tree
    const repo = await Repository.create({
      name,
      description,
      owner: req.user._id,
      visibility: visibility || 'public',
      hasIssues: hasIssues !== false,
      homepage,
      license,
      topics,
      branches: [{ name: 'main', isDefault: true }],
      fileTree: [
        {
          name: 'README.md',
          type: 'file',
          content: `# ${name}\n\n${description || 'A new repository'}\n\n## Getting Started\n\n\`\`\`bash\ngit clone https://github.com/${req.user.username}/${name}.git\ncd ${name}\nnpm install\n\`\`\`\n\n## Usage\n\nAdd usage instructions here.\n\n## Contributing\n\nContributions are welcome! Please read our [Contributing Guide](CONTRIBUTING.md).\n\n## License\n\n${license || 'MIT'}`,
          size: '1.2 KB',
          language: 'Markdown',
        },
        { name: '.gitignore', type: 'file', content: 'node_modules/\n.env\n.DS_Store\ndist/', size: '0.1 KB' },
        {
          name: 'package.json',
          type: 'file',
          content: JSON.stringify({
            name,
            version: '1.0.0',
            description: description || '',
            main: 'index.js',
            scripts: { test: 'echo "Error: no test specified" && exit 1' },
            license: license || 'MIT',
          }, null, 2),
          size: '0.4 KB',
          language: 'JSON',
        },
      ],
    })

    // Create initial commit
    const sha = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
    await Commit.create({
      sha,
      message: 'Initial commit',
      author: req.user._id,
      repository: repo._id,
      branch: 'main',
      filesChanged: 3,
      additions: 30,
      deletions: 0,
    })

    // Award XP
    await req.user.awardXP(10, 'Repository created')

    res.status(201).json({ repo })
  } catch (err) {
    console.error('Create repo error:', err)
    res.status(500).json({ error: 'Failed to create repository' })
  }
})

// PUT /api/repos/:owner/:name - Update repo
router.put('/:owner/:name', protect, async (req, res) => {
  try {
    const owner = await (await import('../models/User.js')).default.findOne({ username: req.params.owner })
    if (!owner || owner._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Not authorized' })
    }

    const repo = await Repository.findOne({ owner: owner._id, name: req.params.name })
    if (!repo) {
      return res.status(404).json({ error: 'Repository not found' })
    }

    const allowedUpdates = [
      'description', 'visibility', 'homepage', 'hasIssues', 'hasWiki',
      'defaultBranch', 'license', 'topics', 'archived'
    ]

    for (const field of allowedUpdates) {
      if (req.body[field] !== undefined) {
        repo[field] = req.body[field]
      }
    }

    await repo.save()

    res.json({ repo })
  } catch (err) {
    res.status(500).json({ error: 'Failed to update repository' })
  }
})

// DELETE /api/repos/:owner/:name - Delete repo
router.delete('/:owner/:name', protect, async (req, res) => {
  try {
    const owner = await (await import('../models/User.js')).default.findOne({ username: req.params.owner })
    if (!owner || owner._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Not authorized' })
    }

    const repo = await Repository.findOne({ owner: owner._id, name: req.params.name })
    if (!repo) {
      return res.status(404).json({ error: 'Repository not found' })
    }

    await repo.deleteOne()
    await Commit.deleteMany({ repository: repo._id })

    res.json({ message: 'Repository deleted' })
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete repository' })
  }
})

// POST /api/repos/:owner/:name/star - Toggle star
router.post('/:owner/:name/star', protect, async (req, res) => {
  try {
    const owner = await (await import('../models/User.js')).default.findOne({ username: req.params.owner })
    if (!owner) return res.status(404).json({ error: 'User not found' })

    const repo = await Repository.findOne({ owner: owner._id, name: req.params.name })
    if (!repo) return res.status(404).json({ error: 'Repository not found' })

    const isStarred = repo.stargazers.includes(req.user._id)

    if (isStarred) {
      repo.stargazers.pull(req.user._id)
      repo.starsCount = Math.max(0, repo.starsCount - 1)
    } else {
      repo.stargazers.push(req.user._id)
      repo.starsCount += 1
      await req.user.awardXP(2, 'Starred a repository')
    }

    await repo.save()

    res.json({ starred: !isStarred, starsCount: repo.starsCount })
  } catch (err) {
    res.status(500).json({ error: 'Failed to toggle star' })
  }
})

// POST /api/repos/:owner/:name/fork - Fork repo
router.post('/:owner/:name/fork', protect, async (req, res) => {
  try {
    const owner = await (await import('../models/User.js')).default.findOne({ username: req.params.owner })
    if (!owner) return res.status(404).json({ error: 'User not found' })

    const original = await Repository.findOne({ owner: owner._id, name: req.params.name })
    if (!original) return res.status(404).json({ error: 'Repository not found' })

    // Check for existing fork
    const existingFork = await Repository.findOne({ owner: req.user._id, name: original.name })
    if (existingFork) {
      return res.status(422).json({ error: 'You already have a fork of this repository' })
    }

    const fork = await Repository.create({
      name: original.name,
      description: `Fork of ${owner.username}/${original.name}`,
      owner: req.user._id,
      language: original.language,
      visibility: 'public',
      fileTree: original.fileTree,
      branches: original.branches.map(b => ({ ...b })),
    })

    original.forksCount += 1
    await original.save()

    await req.user.awardXP(15, `Forked ${owner.username}/${original.name}`)

    res.status(201).json({ repo: fork })
  } catch (err) {
    res.status(500).json({ error: 'Failed to fork repository' })
  }
})

// GET /api/repos/:owner/:name/commits - Get commit history
router.get('/:owner/:name/commits', async (req, res) => {
  try {
    const owner = await (await import('../models/User.js')).default.findOne({ username: req.params.owner })
    if (!owner) return res.status(404).json({ error: 'User not found' })

    const repo = await Repository.findOne({ owner: owner._id, name: req.params.name })
    if (!repo) return res.status(404).json({ error: 'Repository not found' })

    const commits = await Commit.find({ repository: repo._id })
      .sort({ createdAt: -1 })
      .limit(50)
      .populate('author', 'username avatarUrl')

    res.json({ commits })
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch commits' })
  }
})

// GET /api/repos/:owner/:name/file - Get file content
router.get('/:owner/:name/file', async (req, res) => {
  try {
    const { path } = req.query
    if (!path) return res.status(400).json({ error: 'Path is required' })

    const owner = await (await import('../models/User.js')).default.findOne({ username: req.params.owner })
    if (!owner) return res.status(404).json({ error: 'User not found' })

    const repo = await Repository.findOne({ owner: owner._id, name: req.params.name })
    if (!repo) return res.status(404).json({ error: 'Repository not found' })

    // Navigate file tree
    const parts = path.split('/')
    let current = repo.fileTree

    for (let i = 0; i < parts.length; i++) {
      const found = current.find(f => f.name === parts[i])
      if (!found) return res.status(404).json({ error: 'File not found' })
      if (i === parts.length - 1) {
        return res.json({ file: found, path })
      }
      if (found.children) {
        current = found.children
      } else {
        return res.status(404).json({ error: 'File not found' })
      }
    }

    res.status(404).json({ error: 'File not found' })
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch file' })
  }
})

export default router
