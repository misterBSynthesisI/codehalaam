import mongoose from 'mongoose'

const collaboratorSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  repository: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Repository',
    required: true,
  },
  role: {
    type: String,
    enum: ['admin', 'write', 'triage', 'read'],
    default: 'read',
  },
  invitedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  acceptedAt: {
    type: Date,
    default: null,
  },
  pending: {
    type: Boolean,
    default: true,
  },
}, { timestamps: true })

// One role per user per repo
collaboratorSchema.index({ user: 1, repository: 1 }, { unique: true })
collaboratorSchema.index({ repository: 1, role: 1 })
collaboratorSchema.index({ user: 1 })

const Collaborator = mongoose.model('Collaborator', collaboratorSchema)
export default Collaborator
