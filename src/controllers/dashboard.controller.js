import { Subscription } from '../model/subscription.model.js'
import { Video } from '../model/video.model.js'
import { ApiError } from '../utils/ApiError.js'
import { ApiResponse } from '../utils/ApiResponse.js'
import { asyncHandler } from '../utils/asyncHandler.js'

export const getChannelsStatsController = asyncHandler(async (req, res) => {
  // TODO: Get the channel stats like total video views, total subscribers, total videos, total likes etc.
  const userId = req.user._id // Assuming user ID is available in req.user

  try {
    // Aggregation pipeline for total video views and total videos
    const videoStats = await Video.aggregate([
      { $match: { owner: userId } },
      {
        $group: {
          _id: null,
          totalViews: { $sum: '$view' },
          totalVideos: { $sum: 1 },
        },
      },
    ])
    const { totalViews = 0, totalVideos = 0 } =
      videoStats.length > 0 ? videoStats[0] : {}

    // Aggregation pipeline for total subscribers
    const subscriberStats = await Subscription.aggregate([
      { $match: { channel: userId } },
      {
        $group: {
          _id: null,
          totalSubscribers: { $sum: 1 },
        },
      },
    ])
    const { totalSubscribers = 0 } =
      subscriberStats.length > 0 ? subscriberStats[0] : {}

    // Aggregation pipeline for total likes
    const likeStats = await Video.aggregate([
      { $match: { owner: userId } },
      {
        $lookup: {
          from: 'likes',
          localField: '_id',
          foreignField: 'video',
          as: 'videoLikes',
        },
      },
      { $unwind: '$videoLikes' },
      {
        $group: {
          _id: null,
          totalLikes: { $sum: 1 },
        },
      },
    ])
    const { totalLikes = 0 } = likeStats.length > 0 ? likeStats[0] : {}

    return res.status(200).json(
      new ApiResponse(
        200,
        {
          totalViews,
          totalSubscribers,
          totalVideos,
          totalLikes,
        },
        'Channel stats fetched successfully',
      ),
    )
  } catch (error) {
    console.error('Error fetching channel stats:', error.message)
    throw new ApiError(500, 'Internal server Error')
  }
})

export const getChannelVideosController = asyncHandler(async (req, res) => {
  // TODO: Get all the videos uploaded by the channel
  const { channelId } = req.params

  const videos = await Video.aggregate([
    {
      $match: { owner: channelId },
    },
    {
      $project: {
        videoFile: 1,
        thumbnail: 1,
        title: 1,
        description: 1,
        duration: 1,
        view: 1,
      },
    },
  ])

  if (!videos || videos.length === 0) {
    throw new ApiError(400, 'No Video Found')
  }

  return res
    .status(200)
    .json(new ApiResponse(200, { videos }, 'All Video Fetched Successfully'))
})
