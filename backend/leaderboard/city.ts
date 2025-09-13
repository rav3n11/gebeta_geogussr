import { NextApiRequest, NextApiResponse } from 'next'
import { getDatabase } from '../../../lib/mongodb'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { city, limit = '50' } = req.query

    if (!city) {
      return res.status(400).json({ error: 'City parameter is required' })
    }

    const db = await getDatabase()
    const scoresCollection = db.collection('scores')

    // Get city leaderboard
    const cityLeaderboard = await scoresCollection
      .find({ city: city as string })
      .sort({ score: -1, timestamp: -1 })
      .limit(parseInt(limit as string))
      .toArray()

    // Add ranks
    const leaderboardWithRanks = cityLeaderboard.map((entry, index) => ({
      ...entry,
      rank: index + 1
    }))

    // Get user's best score for this city if userId provided
    const { userId } = req.query
    let userBestScore = null
    if (userId) {
      userBestScore = await scoresCollection
        .findOne(
          { city: city as string, userId: parseInt(userId as string) },
          { sort: { score: -1 } }
        )
    }

    res.status(200).json({
      city: city as string,
      leaderboard: leaderboardWithRanks,
      userBestScore,
      total: leaderboardWithRanks.length
    })

  } catch (error) {
    console.error('City leaderboard error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}
