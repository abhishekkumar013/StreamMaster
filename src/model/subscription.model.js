import mongoose from 'mongoose'

const substricptionSchema = new mongoose.Schema(
  {
    subscriber: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
    },
    channel: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
    },
  },
  { timestamps: true },
)

export const Subscription = mongoose.model('Subscription', substricptionSchema)
