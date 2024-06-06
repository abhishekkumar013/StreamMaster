import { Video } from '../model/video.model.js'
import { ApiError } from '../utils/ApiError.js'
import { asyncHandler } from '../utils/asyncHandler.js'

const isAdmin = asyncHandler(async (req, res, next) => {
  try {
    const { videoId } = req.params

    const video = await Video.findById(videoId)

    if (!video) {
      throw new ApiError(404, 'Video not found')
    }

    if (video.owner.toString() !== req.user._id.toString()) {
      throw new ApiError(403, 'Access denied unAuthorized Access')
    }

    next()
  } catch (err) {
    throw new ApiError(500, 'Server Error In ISAdmin')
  }
})
export default isAdmin
