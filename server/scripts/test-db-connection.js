/**
 * CODEHALAAM — MongoDB Atlas Connection Test
 * 
 * Run this to verify your MONGODB_URI connection string works.
 * Usage:
 *   cd server && node scripts/test-db-connection.js
 *   OR with a specific URI:
 *   MONGODB_URI="mongodb+srv://..." node scripts/test-db-connection.js
 */

import mongoose from 'mongoose'
import dotenv from 'dotenv'

dotenv.config()

const uri = process.env.MONGODB_URI

console.log('\n🔍 MongoDB Atlas Connection Test')
console.log('================================\n')

if (!uri) {
  console.error('❌ MONGODB_URI is not set!')
  console.error('\n   Either:')
  console.error('   1. Put it in server/.env:')
  console.error('      MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/codehalaam')
  console.error('\n   2. Or pass it as an env var:')
  console.error('      MONGODB_URI="mongodb+srv://..." node scripts/test-db-connection.js')
  process.exit(1)
}

// Mask the password in logs
const maskedUri = uri.replace(/(mongodb(?:\+srv)?:\/\/)([^:]+):([^@]+)@/, '$1$2:****@')
console.log(`📡 Connecting to: ${maskedUri}\n`)

const start = Date.now()

mongoose.connect(uri, { serverSelectionTimeoutMS: 10000 })
  .then((conn) => {
    const ms = Date.now() - start
    const dbName = conn.connection.db?.databaseName || 'unknown'
    console.log(`✅ SUCCESS! Connected to MongoDB Atlas`)
    console.log(`   Database: ${dbName}`)
    console.log(`   Host: ${conn.connection.host}`)
    console.log(`   Time: ${ms}ms`)
    console.log('\n🎉 Your connection string works! Use this exact URI in Vercel env vars.')
    process.exit(0)
  })
  .catch((err) => {
    const ms = Date.now() - start
    console.error(`❌ FAILED after ${ms}ms\n`)
    console.error(`   Error: ${err.message}\n`)

    if (err.name === 'MongoServerSelectionError') {
      console.error('   🔧 Most likely causes:\n')
      console.error('   1. Network Access not configured:')
      console.error('      → Atlas → Network Access → Add IP → "Allow Access From Anywhere" (0.0.0.0/0)\n')
      console.error('   2. Wrong password in the URI:')
      console.error('      → Atlas → Database Access → check your user\'s password')
      console.error('      → Make sure you replaced <db_password> with the actual password\n')
      console.error('   3. Wrong cluster hostname:')
      console.error('      → Atlas → Database → Connect → Drivers → copy the exact hostname\n')
    } else if (err.name === 'MongoServerError' && err.code === 18) {
      console.error('   🔧 Authentication failed!')
      console.error('   → The username or password in your URI is wrong.')
      console.error('   → Atlas → Database Access → verify the user exists and the password matches.\n')
    } else if (err.message?.includes('Invalid schema') || err.message?.includes('URI must')) {
      console.error('   🔧 The URI format is wrong!')
      console.error('   → It should start with mongodb:// or mongodb+srv://')
      console.error('   → Example: mongodb+srv://user:pass@cluster0.abc.mongodb.net/codehalaam?retryWrites=true&w=majority\n')
    }

    process.exit(1)
  })
