const express = require('express')
const cors = require('cors')
const path = require('path')
require('dotenv').config()

const app = express()
const PORT = process.env.PORT || 3000

// Middleware
app.use(cors())
app.use(express.json())
app.use(express.static(path.join(__dirname, 'dist')))

// Import API routes
const scoresRouter = require('./api/scores')
const leaderboardRouter = require('./api/leaderboard')

// API routes
app.use('/api/scores', scoresRouter)
app.use('/api/leaderboard', leaderboardRouter)

// Serve the React app for all other routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'))
})

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
