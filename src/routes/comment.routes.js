import express from 'express'
import { verifyJWT } from '../middlewares/auth.middleware.js'
import {
  addCommentController,
  deleteCommentController,
  getVideoCommentsController,
  updateCommentController,
} from '../controllers/comment.controller.js'

const router = express.Router()

router.use(verifyJWT)
router
  .route('/:videoId')
  .post(addCommentController)
  .get(getVideoCommentsController)

// router.route('/:videoId').get(getVideoCommentsController)

router
  .route('/c/:commentId')
  .patch(updateCommentController)
  .delete(deleteCommentController)
  
// router.route('/c/:commentId').delete(deleteCommentController)

export default router
