const express = require('express')
const { connectDB } = require('./lib/mongodb')

const router = express.Router()

// GET /api/leaderboard - Get global leaderboard
router.get('/', async (req, res) => {
  try {
    const { city, limit = '100', gameMode, userId } = req.query

    const database = await connectDB()
    const scoresCollection = database.collection('scores')

    // Build query
    let query = {}
    if (city) {
      query.city = city
    }
    if (gameMode) {
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
  try {
    const { city, limit = '50', userId } = req.query

    if (!city) {
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
