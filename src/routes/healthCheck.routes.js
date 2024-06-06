import { Router } from 'express'
import { healthCheckCController } from '../controllers/healthcheck.controller.js'

const router = Router()

router.route('/').get(healthCheckCController)

export default router
