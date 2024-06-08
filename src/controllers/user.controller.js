import { User } from '../model/user.model.js'
import { ApiError } from '../utils/ApiError.js'
import { asyncHandler } from '../utils/asynchandler.js'
import { uploadOnCloudinary } from '../utils/cloudinary.js'
import { ApiResponse } from '../utils/ApiResponse.js'
import jwt from 'jsonwebtoken'
import mongoose from 'mongoose'

const generateAccessAndRefreshToken = async (userId) => {
  try {
    const user = await User.findById(userId)

    const accessToken = await user.generateAccesstoken()
    const RefreshToken = await user.generateRefreshtoken()

    user.refreshtoken = RefreshToken
    // validation na chle  iss liye q ki  yaha password or bhut sara required field  passnii kr rhe
    await user.save({ validateBeforeSave: false })

    return { RefreshToken, accessToken }
  } catch (error) {
    throw new ApiError(500, 'Error In Token Generation')
  }
}

export const registerController = asyncHandler(async (req, res) => {
  // get user details from frontend
  // validation - not empty
  // check if user already exists: username, email
  // check for images, check for avatar
  // upload them to cloudinary, avatar
  // create user object - create entry in db
  // remove password and refresh token field from response
  // check for user creation
  // return res
  const { username, email, fullname, password } = req.body
  if (
    [fullname, email, username, password].some((field) => field?.trim() === '')
  ) {
    throw new ApiError(400, 'All fields are required')
  }

  const existingUser = await User.findOne({ $or: [{ username }, { email }] })

  if (existingUser) {
    throw new ApiError(409, 'User Already Exists')
  }

  const avatarLocalPath = req.files?.avatar[0]?.path
  // const coverImageLocalPath = req.files?.coverImage[0]?.path
  let coverImageLocalPath
  if (
    req.files &&
    Array.isArray(req.files.coverImage) &&
    req.files.coverImage.length > 0
  ) {
    coverImageLocalPath = req.files.coverImage[0].path
  }

  if (!avatarLocalPath) {
    throw new ApiError(400, 'Avatar File is Required')
  }
  const avatar = await uploadOnCloudinary(avatarLocalPath)
  // if (!coverImageLocalPath) {
  //   throw new ApiError(400, 'CoverImage File is Required')
  // }
  const coverimage = await uploadOnCloudinary(coverImageLocalPath)
  if (!avatar) {
    throw new ApiError(400, 'Avatar File is Not Upload')
  }

  const user = await User.create({
    fullname,
    avatar: avatar.url,
    coverImage: coverimage?.url || '',
    email,
    password,
    username: username.toLowerCase(),
  })

  // -----------or------------
  const createdUser = await User.findById(user._id).select(
    '-password -refreshtoken',
  )
  if (!createdUser) {
    throw new ApiError(500, 'Something went wrong In Registration Try! Again')
  }
  return res
    .status(201)
    .json(new ApiResponse(200, createdUser, 'User Registred Successfully'))
})

// login controller

export const LoginController = asyncHandler(async (req, res) => {
  // req body->data
  // username or email
  // find user
  // password check
  // access and refersh token
  // send cookie
  const { username, email, password } = req.body
  if (!username && !email) {
    throw new ApiError(400, 'Username or Email is Required')
  }
  if (!password) {
    throw new ApiError(400, 'Invalid  user  credntials')
  }
  // agregation pipeline
  const user = await User.findOne({ $or: [{ username }, { email }] })
  if (!user) {
    throw new ApiError(404, 'User Not Found')
  }
  //   user->>is user ke mothod ko use krna h that why user.isPass....
  const match = await user.isPasswordCorrect(password)
  if (!match) {
    throw new ApiError(401, 'Invalid User Credentails')
  }
  const { RefreshToken, accessToken } = await generateAccessAndRefreshToken(
    user._id,
  )

  const loggedInuser = await User.findById(user._id).select(
    '-password -refreshtoken',
  )

  // cookies
  // httpOnly & secure  ->true krne pe cookie sirf server se modify kr skte h
  const options = {
    httpOnly: true,
    secure: true,
  }

  return res
    .status(200)
    .cookie('accessToken', accessToken, options)
    .cookie('refreshtoken', RefreshToken, options)
    .json(
      new ApiResponse(
        200,
        {
          user: loggedInuser,
          accessToken,
          RefreshToken,
        },
        'User Logged In Successfully',
      ),
    )
})

export const logoutUser = asyncHandler(async (req, res) => {
  await User.findByIdAndUpdate(
    req.user._id,
    {
      // $set: { refreshtoken: undefined },
      $set: { refreshToken: 1 }, // this removes the field from document
    },
    { new: true },
  )

  const options = {
    httpOnly: true,
    secure: true,
  }
  return res
    .status(200)
    .clearCookie('accessToken', options)
    .clearCookie('refreshtoken', options)
    .json(new ApiResponse(200, {}, 'User Logout Successfully'))
})

export const refreshAccessTokenController = asyncHandler(async (req, res) => {
  try {
    const incoingRefreshToken =
      req.cookies.refreshtoken || req.body.refreshtoken

    if (!incoingRefreshToken) {
      throw new ApiError(401, 'UnAuthorized Token')
    }
    const decodeToken = jwt.verify(
      incoingRefreshToken,
      process.env.REFRESH_TOKEN_SECRET,
    )
    const user = await User.findById(decodeToken?._id)

    if (!user) {
      throw new ApiError(401, 'Invalid Refresh Token')
    }
    if (incoingRefreshToken !== user?.refreshtoken) {
      throw new ApiError(401, 'Refresh Token Is Expired Or Used')
    }

    const options = {
      httpOnly: true,
      secure: true,
    }
    const {
      accessToken,
      newrefreshToken,
    } = await generateAccessAndRefreshToken(user._id)
    return res
      .status(200)
      .cookie('accessToken', accessToken, options)
      .cookie('refreshToken', newrefreshToken, options)
      .json(
        new ApiResponse(
          200,
          { accessToken, refreshtoken: newrefreshToken },
          'Access Token Refreshed',
        ),
      )
  } catch (error) {
    throw new ApiError(401, error?.message || 'UnAuthorized Token')
  }
})

export const fortgetPaswwordController = asyncHandler(async (req, res) => {
  const { password, newPassword } = req.body

  // if (!email) {
  //   throw new ApiError(404, 'Email Required')
  // }

  if (!password || !newPassword) {
    throw new ApiError(404, 'Old & New Password Required')
  }

  const user = await User.findById(req.user?._id)

  if (!user) {
    throw new ApiError(404, 'user Not Registered')
  }

  const match = await user?.isPasswordCorrect(password)

  if (!match) {
    throw new ApiError(401, 'Invalid Cradentails')
  }
  user.password = newPassword
  await user.save({ validateBeforeSave: false })
  return res
    .status(200)
    .json(new ApiResponse(200, {}, 'Password Updated Successfully'))
})

export const getCurrentUser = asyncHandler(async (req, res) => {
  return res
    .status(200)
    .json(new ApiResponse(200, req.user, 'Current User Fetched'))
})

export const updateAccountDetails = asyncHandler(async (req, res) => {
  const { fullname, email } = req.body

  if (!fullname || !email) {
    throw new ApiError(400, 'All Fields required')
  }
  const user = await User.findByIdAndUpdate(
    req.user?._id,
    {
      $set: { fullname, email },
    },
    { new: true },
  ).select('-password')

   // Create the update object dynamically
  /*
  const updateData = {}
  if (fullname) updateData.fullname = fullname
  if (email) updateData.email = email

  // Find and update the user
  const user = await User.findByIdAndUpdate(
    req.user?._id,
    { $set: updateData },
    { new: true }
  ).select('-password') */

  return res
    .status(200)
    .json(new ApiResponse(200, user, 'Updated Successfully'))
})

export const updateUserAvatar = asyncHandler(async (req, res) => {
  const avatarLocalPath = req.file?.path
  if (!avatarLocalPath) {
    throw new ApiError(400, 'Avatar File is  missing')
  }
  const avatar = await uploadOnCloudinary(avatarLocalPath)

  if (!avatar || !avatar?.url) {
    throw new ApiError(400, 'Error while uploading Avatar')
  }
  const user = await User.findByIdAndUpdate(
    req.user?._id,
    { $set: { avatar: avatar?.url } },
    { new: true },
  ).select('-password')
  return res
    .status(200)
    .json(new ApiResponse(200, user, 'Avatar Uploaded Successfully'))
})

export const updateCoverImage = asyncHandler(async (req, res) => {
  const coverImageLocalPath = req.file?.path
  if (!coverImageLocalPath) {
    throw new ApiError(400, 'Cover Image File is  missing')
  }
  const coverImage = await uploadOnCloudinary(coverImageLocalPath)

  if (!coverImage || !coverImage?.url) {
    throw new ApiError(400, 'Error while uploading coverImage')
  }
  const user = await User.findByIdAndUpdate(
    req.user?._id,
    { $set: { coverImage: coverImage?.url } },
    { new: true },
  ).select('-password')
  return res
    .status(200)
    .json(new ApiResponse(200, user, 'coverImage Uploaded Successfully'))
})

// get user profie -(aggregtion pipeline  used)
export const getUserChannelProfile = asyncHandler(async (req, res) => {
  const { username } = req.params
  if (!username?.trim()) {
    throw new ApiError(400, 'username is missing')
  }
  // aggregation
  const channel = await User.aggregate([
    {
      $match: {
        username: username?.toLowerCase(),
      },
    },
    // The first $lookup joins the User collection with the subscriptions collection to find all subscribers of the user (foreignField: 'channel').
    {
      $lookup: {
        from: 'subscriptions', // Subscription model se dekhna h
        localField: '_id', // _id ke basic pe user model ka id
        foreignField: 'channel', // channel ke basic pe krenge to subscribetr count milega us channnel ka (user aaayega)
        as: 'subscribers', // subscribers naam se save kr lenge
      },
    },
    // The second $lookup joins the User collection with the subscriptions collection to find all channels the user has subscribed to (foreignField: 'subscriber').
    {
      $lookup: {
        from: 'subscriptions',
        localField: '_id',
        foreignField: 'subscriber', // user kitne channel ko  subscribe kiya h
        as: 'subscribedTo',
      },
    },
    {
      $addFields: {
        // kitna susriber h
        subscribersCount: {
          // field h iss liye doller($) use kr rhe`
          $size: '$subscribers',
        },
        // kitna ko subscribe kiye h
        channesSubscribdToCount: {
          $size: '$subscribedTo',
        },
        isSubscribed: {
          $cond: {
            // current login user subscribers ke list  me hai ya nii
            if: { $in: [req.user?._id, '$subscribers.subscriber'] },
            then: true,
            else: false,
          },
        },
      },
    },
    {
      $project: {
        fullname: 1,
        usernname: 1,
        subscribersCount: 1,
        channesSubscribdToCount: 1,
        isSubscribed: 1,
        avatar: 1,
        coverImage: 1,
        email: 1,
      },
    },
  ])

  if (!channel?.length) {
    throw new ApiError(404, 'channel does not exists')
  }
  return res
    .status(200)
    .json(new ApiResponse(200, channel[0], 'user channel fetched successfully'))
})

// watch history
export const getwatchedHistory = asyncHandler(async (req, res) => {
  const user = await User.aggregate([
    {
      $match: {
        // req.user._id  --> string return krta h jbki aggregation me direct mongodb ka id pass krna hota h
        _id: new mongoose.Types.ObjectId(req.user._id),
      },
    },
    {
      $lookup: {
        from: 'videos',
        localField: 'watchhistory',
        foreignField: '_id',
        as: 'watchHistory',
        // sub-pipeline
        pipeline: [
          {
            $lookup: {
              from: 'users',
              localField: 'owner',
              foreignField: '_id',
              as: 'owner',
              pipeline: [
                {
                  $project: {
                    fullname: 1,
                    username: 1,
                    avatar: 1,
                  },
                },
              ],
            },
          },
          {
            $addFields: {
              owner: {
                $first: '$owner',
              },
            },
          },
        ],
      },
    },
  ])

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        user[0].watchhistory,
        'watch history data fetched sucessfully',
      ),
    )
})
