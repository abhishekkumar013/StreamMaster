import express from 'express'
import { verifyJWT } from '../middlewares/auth.middleware.js'
import {
  addVideoToPlaylistController,
  createPlaylistController,
  deletePlaylistController,
  getPlaylistByIdController,
  getUserPlaylistsController,
  removeVideoToPlaylistController,
  updatePlaylistController,
} from '../controllers/playlist.controller.js'

const router = express.Router()

router.use(verifyJWT)

router.route('/').post(createPlaylistController)
router.route('/user/:userId').get(getUserPlaylistsController)

router
  .route('/:playlistId')
  .get(getPlaylistByIdController)
  .delete(deletePlaylistController)
  .patch(updatePlaylistController)

router.route('/add/:playlistId/:videoId').post(addVideoToPlaylistController)
router
  .route('/remove/:playlistId/:videoId')
  .post(removeVideoToPlaylistController)

export default router
