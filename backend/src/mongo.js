import mongoose from 'mongoose'
import dotenv from 'dotenv'
dotenv.config({
  path: new URL('../.env', import.meta.url).pathname
})

const url = process.env.MONGODB_URI;
mongoose.set('strictQuery',false)

mongoose.connect(url)
  .then(() => console.log('🗄️  Connected to MongoDB'))
  .catch(err => console.error('❌ MongoDB connection error:', err))

