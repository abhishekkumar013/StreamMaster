import mongoose from 'mongoose'
import { Playlist } from '../model/playlist.model.js'
import { ApiError } from '../utils/ApiError.js'
import { ApiResponse } from '../utils/ApiResponse.js'
import { asyncHandler } from '../utils/asyncHandler.js'

export const createPlaylistController = asyncHandler(async (req, res) => {
  const { name, description } = req.body
  if (!name || !description) {
    throw new ApiError(404, 'All Fields Required')
  }
  const playlist = await Playlist.create({
    name,
    description,
    owner: req.user._id,
  })
  if (!playlist) {
    throw new ApiError(400, 'Try agian to create playlist')
  }
  return res
    .status(200)
    .json(new ApiResponse(200, playlist, 'Playlist created sucessfully'))
})

export const getUserPlaylistsController = asyncHandler(async (req, res) => {
  const { userId } = req.params

  const playlist = await Playlist.aggregate([
    {
      $match: { owner: new mongoose.Types.ObjectId(userId) },
    },
    {
      $lookup: {
        from: 'videos',
        localField: 'videos',
        foreignField: '_id',
        as: 'videos',
      },
    },
    {
      $project: {
        name: 1,
        description: 1,
        videos: 1,
        owner: 1,
      },
    },
  ])

  if (!playlist || playlist.length === 0) {
    throw new ApiError(404, 'No Playlist Found')
  }
  return res
    .status(200)
    .json(new ApiResponse(200, playlist, 'Playlist fetched successfully'))
})

export const getPlaylistByIdController = asyncHandler(async (req, res) => {
  const { playlistId } = req.params
  if (!playlistId) {
    throw new ApiError(404, 'Playlist id is Required')
  }
  const playlist = await Playlist.findById(playlistId)

  if (!playlist) {
    throw new ApiError(404, 'No Playlist Found')
  }
  return res
    .status(200)
    .json(new ApiResponse(200, playlist, 'Playlist fetched successfully'))
})

export const addVideoToPlaylistController = asyncHandler(async (req, res) => {
  const { playlistId, videoId } = req.params

  if (!playlistId || !videoId) {
    throw new ApiError(400, 'playlistId & videoId Required')
  }

  const playlist = await Playlist.findByIdAndUpdate(
    playlistId,
    { $push: { videos: videoId } },
    { new: true },
  )
  if (!playlist) {
    throw new ApiError(400, 'No  Playlist Found')
  }
  return res
    .status(200)
    .json(new ApiResponse(200, playlist, 'Video Succesfully Added to Playlist'))
})
export const removeVideoToPlaylistController = asyncHandler(
  async (req, res) => {
    const { playlistId, videoId } = req.params

    if (!playlistId || !videoId) {
      throw new ApiError(400, 'playlistId & videoId Required')
    }

    const playlist = await Playlist.findByIdAndUpdate(
      playlistId,
      { $pull: { videos: videoId } },
      { new: true },
    )
    if (!playlist) {
      throw new ApiError(400, 'No  Playlist Found')
    }
    return res
      .status(200)
      .json(
        new ApiResponse(200, playlist, 'Video Succesfully Added to Playlist'),
      )
  },
)

export const deletePlaylistController = asyncHandler(async (req, res) => {
  const { playlistId } = req.params

  if (!playlistId) {
    throw new ApiError(400, 'playlistId  Required')
  }
  await Playlist.findByIdAndDelete(playlistId)

  return res
    .status(200)
    .json(new ApiResponse(200, {}, 'Playlist  deleted successfully'))
})

export const updatePlaylistController = asyncHandler(async (req, res) => {
  const { playlistId } = req.params
  const { name, description } = req.body
  if (!playlistId) {
    throw new ApiError(400, 'playlistId  Required')
  }

  if ([name, description].some((field) => field?.trim() === '')) {
    throw new ApiError(400, 'All fields are required')
  }
  const existingPlaylist = await Playlist.findById(playlistId)
  if (!existingPlaylist) {
    throw new ApiError(400, 'No Playlisst Found')
  }
  const playlist = await Playlist.findByIdAndUpdate(
    playlistId,
    { name, description },
    { new: true },
  )

  if (!playlist) {
    throw new ApiError(400, 'Error in Updating Playlist')
  }
  return res
    .status(200)
    .json(new ApiResponse(200, playlist, 'Playlist Updated Successfully'))
})
