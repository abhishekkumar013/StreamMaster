import express from 'express'
import {
  LoginController,
  fortgetPaswwordController,
  getCurrentUser,
  getUserChannelProfile,
  getwatchedHistory,
  logoutUser,
  refreshAccessTokenController,
  registerController,
  updateAccountDetails,
  updateCoverImage,
  updateUserAvatar,
} from '../controllers/user.controller.js'
import { upload } from '../middlewares/multer.middleware.js'
import { verifyJWT } from '../middlewares/auth.middleware.js'

const router = express.Router()

router.route('/register').post(
  upload.fields([
    {
      name: 'avatar',
      maxCount: 1,
    },
    {
      name: 'coverImage',
      maxCount: 1,
    },
  ]),
  registerController,
)

router.route('/login').post(LoginController)

router.route('/logout').post(verifyJWT, logoutUser)

router.route('/refresh_token').post(refreshAccessTokenController)

router.route('/forget-password').post(verifyJWT, fortgetPaswwordController)

router.route('/current-user').get(verifyJWT, getCurrentUser)

router.route('/update-account').patch(verifyJWT, updateAccountDetails)

router
  .route('/update-avatar')
  .patch(verifyJWT, upload.single('avatar'), updateUserAvatar)

router
  .route('/update-coverimage')
  .patch(verifyJWT, upload.single('coverImage'), updateCoverImage)

router.route('/get-profile/:username').get(verifyJWT, getUserChannelProfile)

router.route('/get-watchhistory').get(verifyJWT, getwatchedHistory)

export default router
