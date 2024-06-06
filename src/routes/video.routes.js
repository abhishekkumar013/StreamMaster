import express from 'express'
import {
  deleteVideoController,
  getAllVideoController,
  getVideoByIdController,
  publishVideoController,
  toggleVideoPublishController,
  updateVideoController,
} from '../controllers/video.controller.js'
import { verifyJWT } from '../middlewares/auth.middleware.js'
import { upload } from '../middlewares/multer.middleware.js'
import isAdmin from '../middlewares/isAmin.middleware.js'

const router = express.Router()

router.route('/get-all-video').get(getAllVideoController)
router.route('/upload-video').post(
  verifyJWT,
  upload.fields([
    { name: 'videofile', maxCount: 1 },
    { name: 'thumbnail', maxCount: 1 },
  ]),
  publishVideoController,
)

router
  .route('/v/:videoId')
  .get(getVideoByIdController)
  .patch(verifyJWT, isAdmin, updateVideoController)
  .delete(verifyJWT, isAdmin, deleteVideoController)

router
  .route('/toggle-publish/:videoId')
  .patch(verifyJWT, isAdmin, toggleVideoPublishController)

export default router
