import { Comment } from '../model/comment.model.js'
import { Like } from '../model/like.model.js'
import { Tweet } from '../model/tweet.model.js'
import { User } from '../model/user.model.js'
import { Video } from '../model/video.model.js'
import { ApiError } from '../utils/ApiError.js'
import { ApiResponse } from '../utils/ApiResponse.js'
import { asyncHandler } from '../utils/asyncHandler.js'

export const toggleVideoLikeControler = asyncHandler(async (req, res) => {
  const { videoId } = req.params
  const userId = req.user._id
  try {
    const existingLike = await Like.findOne({ video: videoId, owner: userId })

    if (existingLike) {
      await Like.findOneAndDelete({ video: videoId, owner: userId })
      return res.status(200).json(new ApiResponse(200, {}, 'Video UnLiked'))
    } else {
      await Like.create({
        video: videoId,
        owner: userId,
      })
      return res.status(200).json(new ApiResponse(201, {}, 'Video Liked'))
    }
  } catch (err) {
    throw new ApiError(500, 'Innternal server Error')
  }
})

export const toggleCommentLikeControler = asyncHandler(async (req, res) => {
  const { commentId } = req.params
  const userId = req.user._id
  try {
    const existingLike = await Comment.findOne({
      comment: commentId,
      owner: userId,
    })

    if (existingLike) {
      await Comment.findOneAndDelete({ comment: commentId, owner: userId })
      return res.status(200).json(new ApiResponse(200, {}, 'commnet unLiked'))
    } else {
      await Comment.create({
        comment: commentId,
        owner: userId,
      })
      return res.status(200).json(new ApiResponse(201, {}, 'comment Liked'))
    }
  } catch (err) {
    throw new ApiError(500, 'Innternal server Error')
  }
})

export const toggleTweetLikeControler = asyncHandler(async (req, res) => {
  const { tweetId } = req.params
  const userId = req.user._id
  try {
    const existingLike = await Tweet.findOne({
      tweet: tweetId,
      owner: userId,
    })

    if (existingLike) {
      await Tweet.findOneAndDelete({ tweet: tweetId, owner: userId })
      return res.status(200).json(new ApiResponse(200, {}, 'tweet unLiked'))
    } else {
      await Tweet.create({
        tweet: tweetIdtweetId,
        owner: userId,
      })
      return res.status(200).json(new ApiResponse(201, {}, 'tweet Liked'))
    }
  } catch (err) {
    throw new ApiError(500, 'Innternal server Error')
  }
})

export const getUserVideoLikeController = asyncHandler(async (req, res) => {
  // const {  } = req.params

  const Likedvideo = await Like.aggregate([
    {
      $match: { owner: req.user._id },
    },
    {
      $lookup: {
        from: 'videos',
        localField: 'video',
        foreignField: '_id',
        as: 'videoDetails',
      },
    },
    {
      $unwind: '$videoDetails',
    },
    {
      $project: {
        videoId: '$videoDetails._id',
        title: '$videoDetails.title',
        description: '$videoDetails.description',
      },
    },
  ])

  if (!Likedvideo || Likedvideo.length == 0) {
    throw new ApiError(400, 'No Liked Video')
  }

  return res
    .status(200)
    .json(
      new ApiResponse(200, Likedvideo, 'All Liked Video fetched successfully'),
    )
})

export const getVideoLikeCountController = asyncHandler(async (req, res) => {
  const { videoId } = req.params

  try {
    // Aggregate to count likes for the specified video
    const likeCount = await Like.aggregate([
      { $match: { video: mongoose.Types.ObjectId(videoId) } },
      { $group: { _id: '$video', totalLikes: { $sum: 1 } } },
    ])

    // If there are likes for the video, return the count
    if (likeCount.length > 0) {
      res.status(200).json({ videoId, likeCount: likeCount[0].totalLikes })
    } else {
      res.status(200).json({ videoId, likeCount: 0 })
    }
  } catch (err) {
    res.status(500).json(new ApiError(500, 'Internal server error'))
  }
})
export const getTweetLikeCountController = asyncHandler(async (req, res) => {
  const { tweetId } = req.params

  try {
    // Aggregate to count likes for the specified video
    const likeCount = await Like.aggregate([
      { $match: { tweet: mongoose.Types.ObjectId(tweetId) } },
      { $group: { _id: '$tweet', totalLikes: { $sum: 1 } } },
    ])

    // If there are likes for the video, return the count
    if (likeCount.length > 0) {
      res.status(200).json(new ApiResponse(200, {}, 'No liked on video'))
    } else {
      res
        .status(200)
        .json(
          new ApiResponse(
            200,
            { likeCount: likeCount[0].totalLikes },
            'All Liked fetched',
          ),
        )
    }
  } catch (err) {
    res.status(500).json(new ApiError(500, 'Internal server error'))
  }
})

export const getCommentLikeCountController = asyncHandler(async (req, res) => {
  const { commnetId } = req.params

  try {
    // Aggregate to count likes for the specified video
    const likeCount = await Like.aggregate([
      { $match: { comment: mongoose.Types.ObjectId(commnetId) } },
      { $group: { _id: '$tweet', totalLikes: { $sum: 1 } } },
    ])

    // If there are likes for the video, return the count
    if (likeCount.length > 0) {
      res.status(200).json(new ApiResponse(200, {}, 'No liked on video'))
    } else {
      res
        .status(200)
        .json(
          new ApiResponse(
            200,
            { likeCount: likeCount[0].totalLikes },
            'All Liked fetched',
          ),
        )
    }
  } catch (err) {
    res.status(500).json(new ApiError(500, 'Internal server error'))
  }
})
