import { NextApiRequest, NextApiResponse } from 'next'
import { getDatabase } from '../../../lib/mongodb'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { city, limit = '100', gameMode } = req.query

    const db = await getDatabase()
    const scoresCollection = db.collection('scores')

    // Build query
    let query: any = {}
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
      .limit(parseInt(limit as string))
      .toArray()

    // Add ranks
    const leaderboardWithRanks = leaderboard.map((entry, index) => ({
      ...entry,
      rank: index + 1
    }))

    // Get user's best score if userId provided
    const { userId } = req.query
    let userBestScore = null
    if (userId) {
      const userQuery = { ...query, userId: parseInt(userId as string) }
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
}
