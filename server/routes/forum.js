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

import express from 'express'
import ForumPost from '../models/ForumPost.js'
import { protect, optionalAuth } from '../middleware/auth.js'

const router = express.Router()

// GET /api/forum — List posts (sorted by score or recency)
router.get('/', async (req, res) => {
  try {
    const { sort = 'hot', tag, search, page = 1, limit = 20 } = req.query
    const query = {}
    if (tag) query.tags = tag
    if (search) {
      query.$text = { $search: search }
    }

    const sortObj = sort === 'new' ? { createdAt: -1 }
      : sort === 'unanswered' ? { isAnswered: 1, createdAt: -1 }
      : { isPinned: -1, score: -1, createdAt: -1 } // hot (default)

    const posts = await ForumPost.find(query)
      .sort(sortObj)
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .populate('author', 'username displayName avatarUrl badgeColor')
      .populate('answers.author', 'username displayName avatarUrl badgeColor')

    const total = await ForumPost.countDocuments(query)

    res.json({ posts, total, page: parseInt(page), pages: Math.ceil(total / limit) })
  } catch (err) {
    console.error('Forum list error:', err)
    res.status(500).json({ error: 'Failed to fetch forum posts' })
  }
})

// GET /api/forum/:id — Get single post
router.get('/:id', optionalAuth, async (req, res) => {
  try {
    const post = await ForumPost.findById(req.params.id)
      .populate('author', 'username displayName avatarUrl badgeColor')
      .populate('answers.author', 'username displayName avatarUrl badgeColor')
      .populate('upvotes', 'username')
      .populate('downvotes', 'username')

    if (!post) return res.status(404).json({ error: 'Post not found' })

    // Increment views
    post.views += 1
    await post.save()

    res.json({ post })
  } catch (err) {
    console.error('Forum get error:', err)
    res.status(500).json({ error: 'Failed to fetch post' })
  }
})

// POST /api/forum — Create a new post
router.post('/', protect, async (req, res) => {
  try {
    const { title, body, tags } = req.body
    if (!title || !body) return res.status(400).json({ error: 'Title and body are required' })

    const post = await ForumPost.create({
      title,
      body,
      author: req.user._id,
      tags: (tags || []).slice(0, 5),
    })

    const populated = await post.populate('author', 'username displayName avatarUrl badgeColor')
    res.status(201).json({ post: populated })
  } catch (err) {
    console.error('Forum create error:', err)
    res.status(500).json({ error: 'Failed to create post' })
  }
})

// POST /api/forum/:id/answer — Add an answer
router.post('/:id/answer', protect, async (req, res) => {
  try {
    const post = await ForumPost.findById(req.params.id)
    if (!post) return res.status(404).json({ error: 'Post not found' })
    if (post.isClosed) return res.status(400).json({ error: 'This thread is closed' })

    const { body } = req.body
    if (!body || body.trim().length < 5) return res.status(400).json({ error: 'Answer body is required (min 5 chars)' })

    post.answers.push({ body, author: req.user._id })
    await post.save()

    const populated = await post.populate('answers.author', 'username displayName avatarUrl badgeColor')
    const newAnswer = populated.answers[populated.answers.length - 1]
    res.status(201).json({ answer: newAnswer })
  } catch (err) {
    console.error('Forum answer error:', err)
    res.status(500).json({ error: 'Failed to post answer' })
  }
})

// POST /api/forum/:id/vote — Vote on a post (up or down)
router.post('/:id/vote', protect, async (req, res) => {
  try {
    const post = await ForumPost.findById(req.params.id)
    if (!post) return res.status(404).json({ error: 'Post not found' })

    const { direction } = req.body // 'up' or 'down'
    const userId = req.user._id

    // Remove from both arrays first
    post.upvotes = post.upvotes.filter(u => u.toString() !== userId.toString())
    post.downvotes = post.downvotes.filter(u => u.toString() !== userId.toString())

    if (direction === 'up') {
      post.upvotes.push(userId)
    } else if (direction === 'down') {
      post.downvotes.push(userId)
    }
    // If neither, it's an unvote (already removed)

    post.score = post.upvotes.length - post.downvotes.length
    await post.save()

    res.json({
      score: post.score,
      upvotes: post.upvotes.length,
      downvotes: post.downvotes.length,
      userVote: direction === 'up' ? 'up' : direction === 'down' ? 'down' : null,
    })
  } catch (err) {
    console.error('Forum vote error:', err)
    res.status(500).json({ error: 'Failed to vote' })
  }
})

// POST /api/forum/:id/answer/:answerId/accept — Accept an answer
router.post('/:id/answer/:answerId/accept', protect, async (req, res) => {
  try {
    const post = await ForumPost.findById(req.params.id)
    if (!post) return res.status(404).json({ error: 'Post not found' })

    // Only the post author or an admin can accept an answer
    if (post.author.toString() !== req.user._id.toString() && !req.user.isAdmin) {
      return res.status(403).json({ error: 'Only the author or admin can accept an answer' })
    }

    // Un-accept all other answers
    post.answers.forEach(a => {
      if (a._id.toString() === req.params.answerId) {
        a.isAccepted = true
      } else {
        a.isAccepted = false
      }
    })
    post.isAnswered = true
    await post.save()

    res.json({ post })
  } catch (err) {
    console.error('Forum accept error:', err)
    res.status(500).json({ error: 'Failed to accept answer' })
  }
})

// DELETE /api/forum/:id — Delete a post (author or admin)
router.delete('/:id', protect, async (req, res) => {
  try {
    const post = await ForumPost.findById(req.params.id)
    if (!post) return res.status(404).json({ error: 'Post not found' })

    if (post.author.toString() !== req.user._id.toString() && !req.user.isAdmin) {
      return res.status(403).json({ error: 'Not authorized' })
    }

    await post.deleteOne()
    res.json({ message: 'Post deleted' })
  } catch (err) {
    console.error('Forum delete error:', err)
    res.status(500).json({ error: 'Failed to delete post' })
  }
})

export default router
