import { ApiResponse } from '../utils/ApiResponse.js'
import { asyncHandler } from '../utils/asyncHandler.js'

export const healthCheckCController = asyncHandler(async (req, res) => {
  return res.status(200).json(new ApiResponse(200, {}, 'OK'))
})
