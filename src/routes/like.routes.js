import express from 'express'
import { verifyJWT } from '../middlewares/auth.middleware.js'
import {
  getCommentLikeCountController,
  getTweetLikeCountController,
  getUserVideoLikeController,
  getVideoLikeCountController,
  toggleCommentLikeControler,
  toggleTweetLikeControler,
  toggleVideoLikeControler,
} from '../controllers/like.controller.js'

const router = express.Router()

router.use(verifyJWT)

router.route('/toggle/v/:videoId').post(toggleVideoLikeControler)

router.route('/toggle/v/:commentId').post(toggleCommentLikeControler)

router.route('/toggle/v/:tweetId').post(toggleTweetLikeControler)

router.route('/videos').get(getUserVideoLikeController)

router.route('/video/likes/:videoId').get(getVideoLikeCountController)
router.route('tweet/likes/:tweetId').get(getTweetLikeCountController)
router.route('/comment/likes/:commentId').get(getCommentLikeCountController)

export default router
