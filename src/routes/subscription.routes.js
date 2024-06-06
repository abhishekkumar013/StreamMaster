import express from 'express'
import { verifyJWT } from '../middlewares/auth.middleware.js'
import {
  getSubscribedChannelsController,
  getUserChannelSubscribersController,
  toggleSubscriptionController,
} from '../controllers/subscription.conttroller.js'

const router = express.Router()

router.use(verifyJWT)

router
  .route('/c/:channelId')
  .get(getSubscribedChannelsController)
  .post(toggleSubscriptionController)

router.route('/u/:subscriberId').get(getUserChannelSubscribersController)

export default router
