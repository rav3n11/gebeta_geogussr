const { MongoClient } = require('mongodb')

let client = null
let db = null

const connectDB = async () => {
  // Return existing connection if available
  if (db) {
    return db
  }

  const mongoUri = process.env.MONGODB_URI
  
  if (!mongoUri) {
    throw new Error('MONGODB_URI environment variable is not set')
  }

  console.log('Attempting to connect to MongoDB...')
  console.log('MongoDB URI (masked):', mongoUri.replace(/\/\/[^:]+:[^@]+@/, '//***:***@'))

  try {
    // Try with minimal options first (let MongoDB driver handle TLS automatically)
    client = new MongoClient(mongoUri, {
      retryWrites: true,
      w: 'majority',
      serverSelectionTimeoutMS: 10000,
      connectTimeoutMS: 10000,
      socketTimeoutMS: 10000,
      maxPoolSize: 5,
      minPoolSize: 1
    })
    
    await client.connect()
    await client.db('admin').command({ ping: 1 })
    console.log('Successfully connected to MongoDB')
    
    db = client.db('gebeta_geogussr')
    return db
    
  } catch (error) {
    console.error('MongoDB connection failed:', error.message)
    
    // Clean up failed connection
    if (client) {
      try {
        await client.close()
      } catch (closeError) {
        console.error('Error closing failed connection:', closeError.message)
      }
      client = null
    }
    
    throw error
  }
}

const closeDB = async () => {
  if (client) {
    try {
      await client.close()
      console.log('MongoDB connection closed')
    } catch (error) {
      console.error('Error closing MongoDB connection:', error.message)
    }
    client = null
    db = null
  }
}

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('Received SIGINT, closing MongoDB connection...')
  await closeDB()
  process.exit(0)
})

process.on('SIGTERM', async () => {
  console.log('Received SIGTERM, closing MongoDB connection...')
  await closeDB()
  process.exit(0)
})

module.exports = {
  connectDB,
  closeDB
}
