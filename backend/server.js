const express = require('express')
const cors = require('cors')
require('dotenv').config()

const app = express()
const PORT = process.env.PORT || 3000

// Middleware
app.use(cors({
  origin: [
    'http://localhost:5173', // Vite dev server
    'http://localhost:3000', // Local frontend
    'https://gebeta-geogussr.onrender.com', // Production frontend
    'https://gebeta-geogussr-backend.onrender.com', // Production backend
    'https://geo.play.gebeta.app' // main domain
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}))
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
    const { connectDB } = require('./lib/mongodb')
    
    console.log('Testing MongoDB connection...')
    
    const db = await connectDB()
    await db.admin().ping()
    
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
