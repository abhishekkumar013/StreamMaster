import { Video } from '../model/video.model.js'
import { ApiError } from '../utils/ApiError.js'
import { ApiResponse } from '../utils/ApiResponse.js'
import { asyncHandler } from '../utils/asyncHandler.js'
import { uploadOnCloudinary } from '../utils/cloudinary.js'

export const getAllVideoController = asyncHandler(async (req, res) => {
  // const { page = 1, limit = 10, query, sortBy, sortType, userId } = req.query

  try {
    const {
      page = 1,
      limit = 10,
      query = '',
      sortBy = 'createdAt',
      sortType = 'desc',
      userId,
    } = req.query

    // Parse page and limit to integers
    const pageNumber = parseInt(page, 10)
    const limitNumber = parseInt(limit, 10)
    const sortOrder = sortType === 'asc' ? 1 : -1

    // Define the aggregation pipeline directly inside Video.aggregatePaginate
    const options = {
      page: pageNumber,
      limit: limitNumber,
      customLabels: {
        totalDocs: 'totalVideos',
        docs: 'videos',
      },
    }

    const result = await Video.aggregatePaginate(
      [
        {
          $match: {
            ispublic: true,
            ...(query && {
              $or: [
                { title: { $regex: query, $options: 'i' } },
                { description: { $regex: query, $options: 'i' } },
              ],
            }),
            ...(userId && { owner: mongoose.Types.ObjectId(userId) }),
          },
        },
        {
          $project: {
            videofile: 1,
            thumbnail: 1,
            title: 1,
            description: 1,
            duration: 1,
            view: 1,
            ispublic: 1,
            owner: 1,
            createdAt: 1,
            updatedAt: 1,
          },
        },
        {
          $lookup: {
            from: 'users',
            localField: 'owner',
            foreignField: '_id',
            as: 'ownerDetails',
          },
        },
        {
          $unwind: {
            path: '$ownerDetails',
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $sort: { [sortBy]: sortOrder },
        },
      ],
      options,
    )

    // Send the response
    res
      .status(200)
      .json(new ApiResponse(200, result, 'All Video fetched sucessfully '))
  } catch (error) {
    throw new ApiError('Error in getting videos')
  }
})

export const publishVideoController = asyncHandler(async (req, res) => {
  const { title, description } = req.body

  const videoLocalPath = req.files?.videofile[0]?.path
  const thumbnailLocalPath = req.files?.thumbnail[0]?.path

  if (!videoLocalPath) {
    throw new ApiError(400, 'Video Fil is Required')
  }
  if (!thumbnailLocalPath) {
    throw new ApiError(400, 'Thubnail File Required')
  }
  const videofile = await uploadOnCloudinary(videoLocalPath)
  if (!videofile) {
    throw new ApiError(400, 'Video Not Uploaded')
  }
  const thumbnail = await uploadOnCloudinary(thumbnailLocalPath)
  if (!thumbnail) {
    throw new ApiError(400, 'Thumbnail Not Uploaded')
  }

  const video = await Video.create({
    videofile: videofile?.url,
    thumbnail: thumbnail?.url,
    title,
    description,
    duration: videofile?.duration,
    owner: req.user._id,
  })

  if (!video) {
    throw new ApiError(500, 'Something went wrong In Video Upload Try! Again')
  }
  return res
    .status(200)
    .json(new ApiResponse(200, video, 'Video Uploaded Successfully'))
})

export const getVideoByIdController = asyncHandler(async (req, res) => {
  const { videoId } = req.params

  const video = await Video.findById(videoId)

  if (!video) {
    throw new ApiError(400, 'No  Video Found')
  }
  return res
    .status(200)
    .json(new ApiResponse(200, video, 'Video  Fetched Successfully'))
})

export const updateVideoController = asyncHandler(async (req, res) => {
  const { title, description } = req.body
  const { videoId } = req.params

  const existingVideo = await Video.findById(videoId)
  if (!existingVideo) {
    throw new ApiError(400, 'No  Video Found')
  }

  let videoLocalPath
  if (
    req.files &&
    Array.isArray(req.files.videofile) &&
    req.files.videofile.length > 0
  ) {
    videoLocalPath = req.files.videofile[0].path
  }
  let thumbnailLocalPath
  if (
    req.files &&
    Array.isArray(req.files.thumbnail) &&
    req.files.thumbnail.length > 0
  ) {
    thumbnailLocalPath = req.files.thumbnail[0].path
  }

  // Upload the files to Cloudinary
  const videofile = videoLocalPath
    ? await uploadOnCloudinary(videoLocalPath)
    : null

  const thumbnail = thumbnailLocalPath
    ? await uploadOnCloudinary(thumbnailLocalPath)
    : null
  if (title) existingVideo.title = title
  if (description) existingVideo.description = description
  if (videofile) existingVideo.duration = videofile.duration
  if (videofile) existingVideo.videoUrl = videofile.url
  if (thumbnail) existingVideo.thumbnailUrl = thumbnail.url

  await existingVideo.save()

  return res
    .status(200)
    .jsoon(new ApiResponse(200, existingVideo, 'Video Updated successfully'))
})

export const deleteVideoController = asyncHandler(async (req, res) => {
  const { videoId } = req.params

  await Video.findByIdAndDelete(videoId)

  return res
    .status(200)
    .json(new ApiResponse(200, {}, 'Video deleted Successfully'))
})

export const toggleVideoPublishController = asyncHandler(async (req, res) => {
  const { videoId } = req.params

  const video = await Video.findById(videoId)

  if (!video) {
    return res.status(404).json({ message: 'Video not found' })
  }

  // Toggle the publish status
  video.ispublic = !video.ispublic

  // Save the updated video
  await video.save()

  // Return the updated video
  return res
    .status(200)
    .json(new ApiResponse(200, video, 'Publish status toggled successfully'))
})
