const express = require('express')
const cors = require('cors')
require('dotenv').config()

const app = express()
const PORT = process.env.PORT || 3000

// Middleware
app.use(cors())
app.use(express.json())

// Import API routes
const scoresRouter = require('./api/scores')
const leaderboardRouter = require('./api/leaderboard')

// API routes
app.use('/api/scores', scoresRouter)
app.use('/api/leaderboard', leaderboardRouter)

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'Backend API is running' })
})

// Root endpoint
app.get('/', (req, res) => {
  res.json({ 
    message: 'Gebeta GeoGuessr Backend API', 
    version: '1.0.0',
    endpoints: ['/api/scores', '/api/leaderboard', '/health']
  })
})

app.listen(PORT, () => {
  console.log(`Backend API running on port ${PORT}`)
})
