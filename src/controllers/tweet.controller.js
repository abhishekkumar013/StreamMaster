import mongoose from 'mongoose'
import { Tweet } from '../model/tweet.model.js'
import { User } from '../model/user.model.js'
import { ApiError } from '../utils/ApiError.js'
import { ApiResponse } from '../utils/ApiResponse.js'
import { asyncHandler } from '../utils/asynchandler.js'

export const createTweetController = asyncHandler(async (req, res) => {
  const { content } = req.body
  if (!content || !content.length > 0) {
    throw new ApiError(401, 'Must Write some content')
  }
  const tweet = await Tweet.create({ content, owner: req.user._id })

  if (!tweet) {
    throw new ApiError(401, 'Try Agian to tweet')
  }
  return res.status(200).json(new ApiResponse(200, tweet, 'Tweet Successfully'))
})

export const getUserTweetsConntroller = asyncHandler(async (req, res) => {
  const user = await User.aggregate([
    {
      $match: {
        _id: req.user._id,
      },
    },
    {
      $lookup: {
        from: 'tweets',
        localField: '_id',
        foreignField: 'owner',
        as: 'tweets',
      },
    },
    // {
    //   $unwind: {
    //     path: '$tweets',
    //     preserveNullAndEmptyArrays: true, // Preserve users with no tweets
    //   },
    // },
    {
      $project: {
        _id: 0,
        username: 1,
        'tweets.content': 1,
        'tweets.createdAt': 1,
        'tweets.updatedAt': 1,
      },
    },
  ])
  if (!user || !user.length > 0) {
    throw new ApiError(400, 'No Tweets found')
  }
  return res
    .status(200)
    .json(new ApiResponse(200, user, 'Tweets fetched successfully'))
})
// export const getUserTweetsConntroller = asyncHandler(async (req, res) => {
// //   const userId = mongoose.Types.ObjectId(req.user._id)

//   const userWithTweets = await User.aggregate([
//     {
//       $match: { _id: req.user._id },
//     },
//     {
//       $lookup: {
//         from: 'tweets',
//         localField: '_id',
//         foreignField: 'owner',
//         as: 'tweets',
//       },
//     },
//     {
//       $unwind: {
//         path: '$tweets',
//         preserveNullAndEmptyArrays: true, // Include users with no tweets
//       },
//     },
//     {
//       $lookup: {
//         from: 'users',
//         localField: 'tweets.owner',
//         foreignField: '_id',
//         as: 'tweetOwnerDetails',
//       },
//     },
//     {
//       $unwind: {
//         path: '$tweetOwnerDetails',
//         preserveNullAndEmptyArrays: true,
//       },
//     },
//     {
//       $project: {
//         _id: 0,
//         username: '$tweetOwnerDetails.username',
//         content: '$tweets.content',
//         createdAt: '$tweets.createdAt',
//         updatedAt: '$tweets.updatedAt',
//       },
//     },
//   ])

//   if (!userWithTweets || userWithTweets.length === 0) {
//     throw new ApiError(400, 'No Tweets found')
//   }

//   return res
//     .status(200)
//     .json(new ApiResponse(200, userWithTweets, 'Tweets fetched successfully'))
// })
