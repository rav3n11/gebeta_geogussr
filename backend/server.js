const express = require('express')
const cors = require('cors')
require('dotenv').config()

const app = express()
const PORT = process.env.PORT || 3000

// Middleware
app.use(cors())
app.use(express.json())

// Import API routes
const scoresRouter = require('./scores.js')
const leaderboardRouter = require('./leaderboard.js')

// API routes
app.use('/api/scores', scoresRouter)
app.use('/api/leaderboard', leaderboardRouter)

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'Backend API is running' })
})

// MongoDB connection test endpoint
app.get('/api/test-db', async (req, res) => {
  try {
    const { MongoClient } = require('mongodb')
    const mongoUri = process.env.MONGODB_URI
    
    if (!mongoUri) {
      return res.status(500).json({ error: 'MONGODB_URI not set' })
    }

    console.log('Testing MongoDB connection...')
    console.log('MongoDB URI (masked):', mongoUri.replace(/\/\/[^:]+:[^@]+@/, '//***:***@'))
    
    const client = new MongoClient(mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      ssl: true,
      sslValidate: false,
      tlsAllowInvalidCertificates: true,
      tlsAllowInvalidHostnames: true,
      serverSelectionTimeoutMS: 10000
    })
    
    await client.connect()
    await client.db('admin').command({ ping: 1 })
    await client.close()
    
    res.json({ 
      status: 'success', 
      message: 'MongoDB connection successful',
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('MongoDB test error:', error)
    res.status(500).json({ 
      error: 'MongoDB connection failed', 
      message: error.message,
      timestamp: new Date().toISOString()
    })
  }
})

// Root endpoint
app.get('/', (req, res) => {
  res.json({ 
    message: 'Gebeta GeoGuessr Backend API', 
    version: '1.0.0',
    endpoints: ['/api/scores', '/api/leaderboard', '/health', '/api/test-db']
  })
})

app.listen(PORT, () => {
  console.log(`Backend API running on port ${PORT}`)
})
