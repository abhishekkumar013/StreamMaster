import express from 'express'
import { verifyJWT } from '../middlewares/auth.middleware.js'
import {
  createTweetController,
  getUserTweetsConntroller,
} from '../controllers/tweet.controller.js'

const router = express.Router()

router.use(verifyJWT) // Apply verifyJWT middleware to all routes in this file

router.route('/').post(createTweetController)
router.route('/get-tweets').get(getUserTweetsConntroller)

export default router
