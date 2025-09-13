const express = require('express')
const { connectDB } = require('./lib/mongodb')
const crypto = require('crypto-js')

const router = express.Router()

// Telegram Web App validation
function validateTelegramData(initData, botToken) {
  try {
    const urlParams = new URLSearchParams(initData)
    const hash = urlParams.get('hash')
    urlParams.delete('hash')
    
    // Sort parameters alphabetically
    const dataCheckString = Array.from(urlParams.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([key, value]) => `${key}=${value}`)
      .join('\n')
    
    // Create secret key
    const secretKey = crypto.HmacSHA256(botToken, 'WebAppData')
    
    // Calculate hash
    const calculatedHash = crypto.HmacSHA256(dataCheckString, secretKey).toString()
    
    return calculatedHash === hash
  } catch (error) {
    console.error('Telegram validation error:', error)
    return false
  }
}

// POST /api/scores - Submit a score
router.post('/', async (req, res) => {
  try {
    const { 
      score, 
      city, 
      gameMode, 
      distance, 
      roundScore,
      initData 
    } = req.body

    // Validate required fields
    if (!score || !city || !gameMode || !initData) {
      return res.status(400).json({ error: 'Missing required fields' })
    }

    // Validate Telegram data
    const botToken = process.env.TELEGRAM_BOT_TOKEN
    if (!botToken) {
      return res.status(500).json({ error: 'Bot token not configured' })
    }

    if (!validateTelegramData(initData, botToken)) {
      return res.status(401).json({ error: 'Invalid Telegram data' })
    }

    // Parse user data from initData
    const urlParams = new URLSearchParams(initData)
    const userParam = urlParams.get('user')
    if (!userParam) {
      return res.status(400).json({ error: 'User data not found' })
    }

    const user = JSON.parse(userParam)
    if (!user.id || !user.first_name) {
      return res.status(400).json({ error: 'Invalid user data' })
    }

    // Create score document
    const scoreDoc = {
      userId: user.id,
      username: user.username,
      firstName: user.first_name,
      lastName: user.last_name,
      score: parseInt(score),
      city,
      gameMode,
      timestamp: new Date(),
      distance: distance ? parseFloat(distance) : undefined,
      roundScore: roundScore ? parseInt(roundScore) : undefined
    }

    // Save to database
    const database = await connectDB()
    const scoresCollection = database.collection('scores')
    
    const result = await scoresCollection.insertOne(scoreDoc)
    
    // Get updated leaderboards
    const globalLeaderboard = await scoresCollection
      .find({})
      .sort({ score: -1, timestamp: -1 })
      .limit(100)
      .toArray()

    const cityLeaderboard = await scoresCollection
      .find({ city })
      .sort({ score: -1, timestamp: -1 })
      .limit(50)
      .toArray()

    // Add ranks
    const globalWithRanks = globalLeaderboard.map((entry, index) => ({
      ...entry,
      rank: index + 1
    }))

    const cityWithRanks = cityLeaderboard.map((entry, index) => ({
      ...entry,
      rank: index + 1
    }))

    res.status(200).json({
      success: true,
      scoreId: result.insertedId,
      globalLeaderboard: globalWithRanks,
      cityLeaderboard: cityWithRanks
    })

  } catch (error) {
    console.error('Score submission error:', error)
    
    // Return error response instead of 500
    res.status(400).json({ 
      success: false,
      error: 'Unable to save score. Please try again later.',
      details: 'Database temporarily unavailable'
    })
  }
})

module.exports = router
