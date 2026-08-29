import mongoose from 'mongoose'

const commentSchema = new mongoose.Schema({
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  body: { type: String, required: true },
  editedAt: Date,
}, { timestamps: true })

const issueSchema = new mongoose.Schema({
  number: { type: Number, required: true },
  title: { type: String, required: true, maxlength: 256 },
  body: { type: String, default: '' },
  state: { type: String, enum: ['open', 'closed'], default: 'open' },
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  repository: { type: mongoose.Schema.Types.ObjectId, ref: 'Repository', required: true },

  // Labels
  labels: [{
    name: { type: String, required: true },
    color: { type: String, default: 'blue' },
  }],

  // Assignees
  assignees: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],

  // Milestone
  milestone: { type: mongoose.Schema.Types.ObjectId, ref: 'Milestone', default: null },

  // Bounty XP
  bountyXp: { type: Number, default: 0 },

  // Comments
  comments: [commentSchema],
  commentsCount: { type: Number, default: 0 },

  // Reactions
  reactions: {
    thumbsup: { type: Number, default: 0 },
    thumbsdown: { type: Number, default: 0 },
    laugh: { type: Number, default: 0 },
    confused: { type: Number, default: 0 },
    heart: { type: Number, default: 0 },
    hooray: { type: Number, default: 0 },
    rocket: { type: Number, default: 0 },
    eyes: { type: Number, default: 0 },
  },

  // Linked PRs
  linkedPullRequests: [{ type: mongoose.Schema.Types.ObjectId, ref: 'PullRequest' }],

  // Timestamps
  closedAt: Date,
  closedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true })

// Indexes
issueSchema.index({ repository: 1, number: 1 }, { unique: true })
issueSchema.index({ repository: 1, state: 1 })
issueSchema.index({ repository: 1, author: 1 })
issueSchema.index({ assignees: 1 })
issueSchema.index({ createdAt: -1 })

const Issue = mongoose.model('Issue', issueSchema)
export default Issue
