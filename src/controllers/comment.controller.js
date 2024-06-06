import mongoose from 'mongoose'
import { Comment } from '../model/comment.model.js'
import { ApiError } from '../utils/ApiError.js'
import { asyncHandler } from '../utils/asynchandler.js'
import { Video } from '../model/video.model.js'
import { ApiResponse } from '../utils/ApiResponse.js'

export const getVideoCommentsController = asyncHandler(async (req, res) => {
  const { videoId } = req.params
  const { page = 1, limit = 10 } = req.query

  // Validate videoId
  if (!videoId) {
    throw new ApiError(400, 'Provide Video Id')
  }

  // Convert page and limit to numbers
  const pageNumber = parseInt(page, 10)
  const limitNumber = parseInt(limit, 10)

  if (
    isNaN(pageNumber) ||
    isNaN(limitNumber) ||
    pageNumber <= 0 ||
    limitNumber <= 0
  ) {
    throw new ApiError(400, 'Invalid pagination parameters')
  }

  // Use aggregation pipeline for comments
  const options = {
    page: pageNumber,
    limit: limitNumber,
    customLabels: {
      docs: 'comments',
      totalDocs: 'totalComments',
      totalPages: 'totalPages',
      page: 'currentPage',
    },
  }

  const aggregationPipeline = [
    {
      $match: { video: mongoose.Types.ObjectId(videoId) },
    },
    {
      $lookup: {
        from: 'users',
        localField: 'owner',
        foreignField: '_id',
        as: 'owner',
      },
    },
    {
      $unwind: '$owner',
    },
    {
      $project: {
        content: 1,
        owner: {
          _id: 1,
          username: 1,
        },
        createdAt: 1,
        updatedAt: 1,
      },
    },
  ]

  const {
    comments,
    totalComments,
    totalPages,
    currentPage,
  } = await Comment.aggregatePaginate(aggregationPipeline, options)

  // Prepare the response data
  const response = {
    comments,
    totalComments,
    totalPages,
    currentPage,
  }

  // Send the response
  res
    .status(200)
    .json(new ApiResponse(200, response, 'Comments retrieved successfully'))
})
export const addCommentController = asyncHandler(async (req, res) => {
  const { content } = req.body
  const { videoId } = req.params

  if (!content) {
    throw new ApiError(400, 'Must Write some comments')
  }
  if (!videoId) {
    throw new ApiError(400, 'Provide Video Id')
  }
  //   const video = await Video.findById(videoId)
  //   if (!video) {
  //     throw new ApiError(400, 'No Video With this Id')
  //   }
  const comment = await Comment.create({
    content,
    owner: req.user._id,
    video: new mongoose.Types.ObjectId(videoId),
  })
  if (!comment) {
    throw new ApiError(400, 'Error in Adding Comments')
  }
  return res
    .status(200)
    .json(new ApiResponse(200, comment, 'Comment Added Successfully'))
})
export const updateCommentController = asyncHandler(async (req, res) => {
  const { content } = req.body
  const { commentId } = req.params

  if (!content) {
    throw new ApiError(400, 'Must Write some comments')
  }
  if (!commentId) {
    throw new ApiError(400, 'Provide Video Id')
  }
  const commente = await Comment.findById(commentId)
  if (!commente) {
    throw new ApiError(400, 'No Video With this Id')
  }
  const comment = await Comment.findByIdAndUpdate(
    commentId,
    { content },
    { new: true },
  )
  if (!comment) {
    throw new ApiError(400, 'Error in Editing Comments')
  }
  return res
    .status(200)
    .json(new ApiResponse(200, comment, 'Comment Edited Successfully'))
})

export const deleteCommentController = asyncHandler(async (req, res) => {
  const { commentId } = req.params
  if (!commentId) {
    throw new ApiError(400, 'Comment Id Required')
  }
  const comment = await Comment.findById(commentId)
  if (!comment) {
    throw new ApiError(400, 'No Comment Founds')
  }
  await Comment.findByIdAndDelete(commentId)

  return res
    .status(200)
    .json(new ApiResponse(200, {}, 'Comment deleted sucessfully'))
})
