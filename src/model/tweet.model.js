import mongoose from 'mongoose'

const tweetSchemma = new mongoose.Schema({
  content: {
    type: String,
    requireed: true,
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
  },
})

export const Tweet = new mongoose.model('tweet', tweetSchemma)
