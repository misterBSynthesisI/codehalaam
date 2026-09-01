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

/**
 * Vercel serverless entry.
 *
 * Vercel scans /api/*.js and turns each file into a serverless function.
 * This file is mapped to the catch-all route via vercel.json so that the
 * entire Express API (mounted at /api/*) runs inside ONE function — meaning
 * only one server is ever needed on Vercel, even on the free tier.
 *
 * Usage of a single function is what makes this "one tap deploy":
 *   - The frontend is built as static assets (served by Vercel's CDN).
 *   - All /api/* requests are rewritten here and handled by Express.
 *   - MongoDB Atlas is reached over the network; no local DB process needed.
 *
 * Socket.io cannot hold WebSocket connections on Vercel serverless, so the
 * realtime layer is intentionally NOT started here. The Express app still
 * attaches `io` as undefined-safe so routes that reference app.get('io')
 * do not crash. Local development keeps full Socket.io via server/index.js.
 */

import { ensureConnected } from '../server/config/db.js'
import app from '../server/app.js'

/**
 * Ensure the Mongoose connection is established before handling the request.
 * On Vercel, invocations are reused across warm requests, so this is a cheap
 * no-op once connected. On cold starts it performs the initial handshake.
 */
async function ensureDb(req, res, next) {
  try {
    await ensureConnected()
    next()
  } catch (err) {
    console.error('❌ DB unavailable on serverless:', err.message)
    res.status(503).json({
      status: 'degraded',
      database: 'disconnected',
      error: 'Database is not reachable. Check MONGODB_URI.',
    })
  }
}

// Attach the DB guard before any existing middleware/routes.
app.use(ensureDb)

// Export the Express app as the serverless function handler.
export default app
