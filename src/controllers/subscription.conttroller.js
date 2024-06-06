import { Subscription } from '../model/subscription.model'
import { ApiError } from '../utils/ApiError.js'
import { ApiResponse } from '../utils/ApiResponse.js'
import { asyncHandler } from '../utils/asyncHandler.js'

export const toggleSubscriptionController = asyncHandler(async (req, res) => {
  const { channelId } = req.params

  try {
    const existingsubscription = await Subscription.findOne({
      subscriber: req.user._id,
      channel: channelId,
    })

    if (existingsubscription) {
      await Subscription.findOneAndDelete({
        subscriber: req.user._id,
        channel: chann,
      })

      return res.status(200).send(200, {}, 'UnSubscribed')
    } else {
      await Subscription.create({
        subscriber: req.user._id,
        channel: chann,
      })
      return res.status(201).json(new ApiResponse(200, {}, 'Subscribed'))
    }
  } catch (error) {
    throw new ApiError(500, 'Server error')
  }
})

// controller to return subscriber list of a channel
export const getUserChannelSubscribersController = asyncHandler(
  async (req, res) => {
    const { subscriberId } = req.params
    const subscriber = await Subscription.aggregate([
      {
        $match: { channel: subscriberId },
      },
      {
        $lookup: {
          from: 'users',
          localField: 'subscriber',
          foreignField: '_id',
          as: 'subscriberDetails',
        },
      },
      {
        $unwind: '$subscriberDetails',
      },
      {
        $project: {
          _id: 0,
          'subscriberDetails.username': 1,
          'subscriberDetails.email': 1,
          'subscriberDetails.fullname': 1,
          'subscriberDetails.avatar': 1,
        },
      },
    ])

    if (!subscriber || subscriber.length === 0) {
      throw new ApiError(400, 'No subscriber found')
    }

    return res
      .status(200)
      .json(new ApiResponse(200, { subscriber }, 'subscriber List foud'))
  },
)
// controller to return channel list to which user has subscribed
export const getSubscribedChannelsController = asyncHandler(
  async (req, res) => {
    const { subscriberId } = req.params
    const channel = await Subscription.aggregate([
      {
        $match: { channel: req.user._id },
      },
      {
        $lookup: {
          from: 'user',
          localField: 'channel',
          foreignField: '_id',
          as: 'channeldetails',
        },
      },
      {
        $unwind: '$channeldetails',
      },
      {
        $project: {
          'channeldetails.username': 1,
          'channeldetails.email': 1,
          'channeldetails.fullname': 1,
          'channeldetails.avatar': 1,
        },
      },
    ])

    if (!channel || channel.length === 0) {
      throw new ApiError(400, 'No channel found')
    }
    return res
      .status(200)
      .json(new ApiResponse(200, { channel }, 'channel List foud'))
  },
)
