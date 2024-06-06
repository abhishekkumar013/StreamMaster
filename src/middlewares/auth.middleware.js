import { User } from '../model/user.model.js'
import { ApiError } from '../utils/ApiError.js'
import { asyncHandler } from '../utils/asyncHandler.js'
import Jwt from 'jsonwebtoken'

//  yaha res ka use ni tha iss liye  uske jagah "_" use kr  liye
export const verifyJWT = asyncHandler(async (req, _, next) => {
  try {
    const token =
      req.cookies?.accessToken ||
      req.header('Authorization')?.replace('Bearer ', '')

    if (!token) {
      throw new ApiError(401, 'Unauthorized request')
    }

    const decode = Jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)
    const user = await User.findById(decode?._id).select(
      '-password -refreshtoken',
    )

    if (!user) {
      throw new ApiError(401, 'Invalid Access Token')
    }

    // req.user me user save kr rhe and ab jaha jaha ye middleware use krnege us route me req.usr se user ka data access kr skte h
    req.user = user
    next()
  } catch (error) {
    throw new ApiError(401, error?.message || 'Invalid Access Token')
  }
})
