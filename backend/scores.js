const express = require('express')
const { connectDB } = require('./lib/mongodb')
const crypto = require('crypto-js')

const router = express.Router()

// Clean up duplicate scores - keep only the best score per user per gameMode
async function cleanupDuplicateScores(scoresCollection) {
  try {
    // Get all scores grouped by userId and gameMode
    const pipeline = [
      {
        $group: {
          _id: { userId: '$userId', gameMode: '$gameMode' },
          scores: { $push: '$$ROOT' },
          count: { $sum: 1 }
        }
      },
      {
        $match: { count: { $gt: 1 } }
      }
    ]
    
    const duplicates = await scoresCollection.aggregate(pipeline).toArray()
    
    for (const group of duplicates) {
      const { userId, gameMode } = group._id
      const scores = group.scores
      
      // Find the best score (highest score, then most recent if tied)
      const bestScore = scores.reduce((best, current) => {
        if (current.score > best.score) return current
        if (current.score === best.score && current.timestamp > best.timestamp) return current
        return best
      })
      
      // Remove all other scores for this user/gameMode
      const idsToRemove = scores
        .filter(score => score._id.toString() !== bestScore._id.toString())
        .map(score => score._id)
      
      if (idsToRemove.length > 0) {
        await scoresCollection.deleteMany({ _id: { $in: idsToRemove } })
        console.log(`[${new Date().toISOString()}] Cleaned up ${idsToRemove.length} duplicate scores for user ${userId} (${gameMode})`)
      }
    }
  } catch (error) {
    console.error('Error cleaning up duplicate scores:', error)
  }
}

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
  console.log(`[${new Date().toISOString()}] POST /api/scores - Score submission request`)
  console.log(`Request body:`, { 
    score: req.body.score, 
    city: req.body.city, 
    gameMode: req.body.gameMode,
    hasInitData: !!req.body.initData
  })
  
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
    if (!score || !city || !gameMode) {
      console.log(`[${new Date().toISOString()}] POST /api/scores - Missing required fields`)
      return res.status(400).json({ error: 'Missing required fields' })
    }

    let user

    // Handle development mode (empty initData) or production mode
    if (!initData || initData.trim() === '') {
      // Development mode - extract user data from request body
      console.log(`[${new Date().toISOString()}] POST /api/scores - Development mode - using request user data`)
      const { userData } = req.body
      
      if (!userData) {
        return res.status(400).json({ error: 'User data required in development mode' })
      }
      
      user = userData
    } else {
      // Production mode - validate Telegram data
      const botToken = process.env.TELEGRAM_BOT_TOKEN
      if (!botToken) {
        return res.status(500).json({ error: 'Bot token not configured' })
      }

      if (!validateTelegramData(initData, botToken)) {
        console.log(`[${new Date().toISOString()}] POST /api/scores - Invalid Telegram data`)
        return res.status(401).json({ error: 'Invalid Telegram data' })
      }

      // Parse user data from initData
      const urlParams = new URLSearchParams(initData)
      const userParam = urlParams.get('user')
      if (!userParam) {
        return res.status(400).json({ error: 'User data not found in initData' })
      }

      try {
        user = JSON.parse(userParam)
      } catch (error) {
        return res.status(400).json({ error: 'Invalid user data format' })
      }

      if (!user.id || !user.first_name) {
        return res.status(400).json({ error: 'Invalid user data' })
      }
    }

    // Create score document
    const scoreDoc = {
      userId: user.id,
      username: user.username,
      firstName: user.first_name,
      lastName: user.last_name,
      photo_url: user.photo_url,
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
    
    // Check if user already has a score for this gameMode
    const existingScore = await scoresCollection.findOne({
      userId: user.id,
      gameMode: gameMode
    })
    
    let result
    if (existingScore) {
      // Update existing score only if new score is better
      if (parseInt(score) > existingScore.score) {
        result = await scoresCollection.updateOne(
          { _id: existingScore._id },
          { $set: scoreDoc }
        )
        console.log(`[${new Date().toISOString()}] POST /api/scores - Score updated for user ${user.id} (${user.first_name}) - new score: ${score}`)
      } else {
        console.log(`[${new Date().toISOString()}] POST /api/scores - Score not updated for user ${user.id} (${user.first_name}) - existing score ${existingScore.score} is better than ${score}`)
        // Return existing score info
        result = { upsertedId: existingScore._id, modifiedCount: 0 }
      }
    } else {
      // Insert new score
      result = await scoresCollection.insertOne(scoreDoc)
      console.log(`[${new Date().toISOString()}] POST /api/scores - New score saved for user ${user.id} (${user.first_name}) - score: ${score}`)
    }
    
    // Clean up duplicate entries - keep only the best score per user per gameMode
    await cleanupDuplicateScores(scoresCollection)
    
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
