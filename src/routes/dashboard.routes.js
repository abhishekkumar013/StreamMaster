import express from 'express'
import { verifyJWT } from '../middlewares/auth.middleware.js'
import {
  getChannelVideosController,
  getChannelsStatsController,
} from '../controllers/dashboard.controller.js'

const router = express.Router()

router.use(verifyJWT)

router.route('/stats').get(getChannelsStatsController)
router.route('/videos/:channelId').get(getChannelVideosController)

export default router
