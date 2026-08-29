import mongoose from 'mongoose'

const commitSchema = new mongoose.Schema({
  sha: {
    type: String,
    required: true,
    unique: true,
  },
  message: {
    type: String,
    required: true,
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  repository: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Repository',
    required: true,
  },
  branch: {
    type: String,
    default: 'main',
  },
  parentShas: [String],

  // Stats
  additions: { type: Number, default: 0 },
  deletions: { type: Number, default: 0 },
  filesChanged: { type: Number, default: 0 },

  // Files modified
  files: [{
    filename: String,
    status: { type: String, enum: ['added', 'removed', 'modified', 'renamed'] },
    additions: Number,
    deletions: Number,
  }],

  // XP earned
  xpEarned: { type: Number, default: 10 },

  verified: { type: Boolean, default: true },
}, { timestamps: true })

// Indexes
commitSchema.index({ repository: 1, sha: 1 }, { unique: true })
commitSchema.index({ repository: 1, branch: 1 })
commitSchema.index({ author: 1 })
commitSchema.index({ createdAt: -1 })

const Commit = mongoose.model('Commit', commitSchema)
export default Commit
