const express = require('express')
const { connectDB } = require('./lib/mongodb')

const router = express.Router()

// GET /api/leaderboard - Get global leaderboard
router.get('/', async (req, res) => {
  console.log(`[${new Date().toISOString()}] GET /api/leaderboard - Leaderboard request`)
  console.log(`Query params:`, { city: req.query.city, limit: req.query.limit, gameMode: req.query.gameMode, userId: req.query.userId })
  
  try {
    const { city, limit = '100', gameMode, userId } = req.query

    const database = await connectDB()
    const scoresCollection = database.collection('scores')

    // Build query
    let query = {}
    if (city) {
      query.city = city
    }
    if (gameMode && gameMode !== 'all') {
      query.gameMode = gameMode
    }

    // Get leaderboard
    const leaderboard = await scoresCollection
      .find(query)
      .sort({ score: -1, timestamp: -1 })
      .limit(parseInt(limit))
      .toArray()

    // Add ranks
    const leaderboardWithRanks = leaderboard.map((entry, index) => ({
      ...entry,
      rank: index + 1
    }))

    // Get user's best score if userId provided
    let userBestScore = null
    if (userId) {
      const userQuery = { ...query, userId: parseInt(userId) }
      userBestScore = await scoresCollection
        .findOne(userQuery, { sort: { score: -1 } })
    }

    console.log(`[${new Date().toISOString()}] GET /api/leaderboard - Returning ${leaderboardWithRanks.length} entries`)
    
    res.status(200).json({
      leaderboard: leaderboardWithRanks,
      userBestScore,
      total: leaderboardWithRanks.length
    })

  } catch (error) {
    console.error('Leaderboard error:', error)
    
    // Return empty leaderboard instead of 500 error
    res.status(200).json({
      leaderboard: [],
      userBestScore: null,
      total: 0,
      error: 'Database temporarily unavailable'
    })
  }
})

// GET /api/leaderboard/city - Get city-specific leaderboard
router.get('/city', async (req, res) => {
  console.log(`[${new Date().toISOString()}] GET /api/leaderboard/city - City leaderboard request`)
  console.log(`Query params:`, { city: req.query.city, limit: req.query.limit, userId: req.query.userId })
  
  try {
    const { city, limit = '50', userId } = req.query

    if (!city) {
      console.log(`[${new Date().toISOString()}] GET /api/leaderboard/city - Missing city parameter`)
      return res.status(400).json({ error: 'City parameter is required' })
    }

    const database = await connectDB()
    const scoresCollection = database.collection('scores')

    // Get city leaderboard
    const cityLeaderboard = await scoresCollection
      .find({ city })
      .sort({ score: -1, timestamp: -1 })
      .limit(parseInt(limit))
      .toArray()

    // Add ranks
    const leaderboardWithRanks = cityLeaderboard.map((entry, index) => ({
      ...entry,
      rank: index + 1
    }))

    // Get user's best score for this city if userId provided
    let userBestScore = null
    if (userId) {
      userBestScore = await scoresCollection
        .findOne(
          { city, userId: parseInt(userId) },
          { sort: { score: -1 } }
        )
    }

    console.log(`[${new Date().toISOString()}] GET /api/leaderboard/city - Returning ${leaderboardWithRanks.length} entries for city: ${city}`)
    
    res.status(200).json({
      city,
      leaderboard: leaderboardWithRanks,
      userBestScore,
      total: leaderboardWithRanks.length
    })

  } catch (error) {
    console.error('City leaderboard error:', error)
    
    // Return empty leaderboard instead of 500 error
    res.status(200).json({
      city: req.query.city || 'Unknown',
      leaderboard: [],
      userBestScore: null,
      total: 0,
      error: 'Database temporarily unavailable'
    })
  }
})

module.exports = router
