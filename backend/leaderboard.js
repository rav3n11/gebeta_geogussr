const express = require('express')
const { MongoClient } = require('mongodb')

const router = express.Router()

// MongoDB connection
let db
let client
const connectDB = async () => {
  if (db) return db
  try {
    const mongoUri = process.env.MONGODB_URI
    if (!mongoUri) {
      throw new Error('MONGODB_URI environment variable is not set')
    }

    console.log('Attempting to connect to MongoDB...')
    
    // Try with different SSL/TLS configurations
    const options = {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      retryWrites: true,
      w: 'majority',
      serverSelectionTimeoutMS: 30000,
      connectTimeoutMS: 30000,
      socketTimeoutMS: 30000,
      maxPoolSize: 10,
      minPoolSize: 1
    }

    // Try with modern TLS options
    try {
      client = new MongoClient(mongoUri, {
        ...options,
        tls: true,
        tlsAllowInvalidCertificates: false,
        tlsAllowInvalidHostnames: false
      })
      
      await client.connect()
      await client.db('admin').command({ ping: 1 })
      console.log('Successfully connected to MongoDB with TLS')
    } catch (tlsError) {
      console.log('TLS connection failed, trying with relaxed TLS settings...', tlsError.message)
      
      // Close the failed client
      if (client) {
        await client.close()
      }
      
      // Try with relaxed TLS settings
      client = new MongoClient(mongoUri, {
        ...options,
        tls: true,
        tlsAllowInvalidCertificates: true,
        tlsAllowInvalidHostnames: true
      })
      
      await client.connect()
      await client.db('admin').command({ ping: 1 })
      console.log('Successfully connected to MongoDB with relaxed TLS')
    }
    
    db = client.db('gebeta_geogussr')
    return db
  } catch (error) {
    console.error('MongoDB connection error:', error)
    if (client) {
      await client.close()
    }
    throw error
  }
}

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
    res.status(500).json({ error: 'Internal server error' })
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
    res.status(500).json({ error: 'Internal server error' })
  }
})

module.exports = router
