const { MongoClient } = require('mongodb')
require('dotenv').config()

async function testMongoDBConnection() {
  const mongoUri = process.env.MONGODB_URI
  
  if (!mongoUri) {
    console.error('❌ MONGODB_URI environment variable is not set')
    return
  }

  console.log('🔍 Testing MongoDB connection...')
  console.log('📍 MongoDB URI (masked):', mongoUri.replace(/\/\/[^:]+:[^@]+@/, '//***:***@'))
  
  let client
  
  try {
    // Try with strict SSL first
    console.log('\n🔒 Trying with strict SSL...')
    client = new MongoClient(mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      ssl: true,
      sslValidate: true,
      tlsAllowInvalidCertificates: false,
      tlsAllowInvalidHostnames: false,
      serverSelectionTimeoutMS: 10000
    })
    
    await client.connect()
    await client.db('admin').command({ ping: 1 })
    console.log('✅ Successfully connected with strict SSL')
    
  } catch (strictError) {
    console.log('❌ Strict SSL failed:', strictError.message)
    
    if (client) {
      await client.close()
    }
    
    try {
      // Try with relaxed SSL
      console.log('\n🔓 Trying with relaxed SSL...')
      client = new MongoClient(mongoUri, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        ssl: true,
        sslValidate: false,
        tlsAllowInvalidCertificates: true,
        tlsAllowInvalidHostnames: true,
        serverSelectionTimeoutMS: 10000
      })
      
      await client.connect()
      await client.db('admin').command({ ping: 1 })
      console.log('✅ Successfully connected with relaxed SSL')
      
    } catch (relaxedError) {
      console.log('❌ Relaxed SSL also failed:', relaxedError.message)
      throw relaxedError
    }
  }
  
  // Test database operations
  try {
    console.log('\n📊 Testing database operations...')
    const db = client.db('gebeta_geogussr')
    const scoresCollection = db.collection('scores')
    
    // Test insert
    const testDoc = {
      userId: 999999,
      username: 'test_user',
      firstName: 'Test',
      lastName: 'User',
      score: 1000,
      city: 'Test City',
      gameMode: 'random',
      timestamp: new Date()
    }
    
    const insertResult = await scoresCollection.insertOne(testDoc)
    console.log('✅ Test document inserted:', insertResult.insertedId)
    
    // Test find
    const findResult = await scoresCollection.findOne({ userId: 999999 })
    console.log('✅ Test document found:', findResult ? 'Yes' : 'No')
    
    // Test delete
    const deleteResult = await scoresCollection.deleteOne({ userId: 999999 })
    console.log('✅ Test document deleted:', deleteResult.deletedCount > 0 ? 'Yes' : 'No')
    
    console.log('\n🎉 All MongoDB operations successful!')
    
  } catch (dbError) {
    console.error('❌ Database operations failed:', dbError.message)
  } finally {
    if (client) {
      await client.close()
      console.log('🔌 MongoDB connection closed')
    }
  }
}

testMongoDBConnection().catch(console.error)
