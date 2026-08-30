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

import Collaborator from '../models/Collaborator.js'

/**
 * Check if a user can view a codex.
 * - Public codex → always true
 * - Null user → false for private
 * - Admin → always true
 * - Owner → always true
 * - Collaborator → true
 * - Otherwise → false
 */
export async function canViewCodex(user, codex) {
  // Public codex — visible to everyone
  if (codex.visibility === 'public') return true

  // Private codex — requires authentication
  if (!user) return false

  // Admin can see everything
  if (user.isAdmin) return true

  // Owner can always see their own codex
  const ownerId = codex.owner?._id ? codex.owner._id.toString() : codex.owner.toString()
  if (ownerId === user._id.toString()) return true

  // Check if user is a collaborator
  const collab = await Collaborator.findOne({
    codex: codex._id,
    user: user._id,
  })
  if (collab) return true

  return false
}

/**
 * Check if a user can edit a codex.
 * - Owner → true
 * - Admin collaborator → true
 * - Site admin → true
 * - Otherwise → false
 */
export async function canEditCodex(user, codex) {
  if (!user) return false
  if (user.isAdmin) return true

  const ownerId = codex.owner?._id ? codex.owner._id.toString() : codex.owner.toString()
  if (ownerId === user._id.toString()) return true

  const collab = await Collaborator.findOne({
    codex: codex._id,
    user: user._id,
    role: 'Admin',
  })
  if (collab) return true

  return false
}

/**
 * Check if a user can delete a codex.
 * - Owner → true
 * - Site admin → true
 * - Otherwise → false
 */
export async function canDeleteCodex(user, codex) {
  if (!user) return false
  if (user.isAdmin) return true

  const ownerId = codex.owner?._id ? codex.owner._id.toString() : codex.owner.toString()
  if (ownerId === user._id.toString()) return true

  return false
}

/**
 * Check if a user can manage collaborators for a codex.
 * - Owner → true
 * - Admin collaborator → true
 * - Site admin → true
 * - Otherwise → false
 */
export async function canManageCollaborators(user, codex) {
  if (!user) return false
  if (user.isAdmin) return true

  const ownerId = codex.owner?._id ? codex.owner._id.toString() : codex.owner.toString()
  if (ownerId === user._id.toString()) return true

  const collab = await Collaborator.findOne({
    codex: codex._id,
    user: user._id,
    role: 'Admin',
  })
  if (collab) return true

  return false
}
