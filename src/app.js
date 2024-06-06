import express from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import dotenv from 'dotenv'

const app = express()

// middleware
app.use(
  cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true,
  }),
)
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(express.static('public'))
app.use(cookieParser())

// import user route
import userRoutes from './routes/user.routes.js'
import tweetRoutes from './routes/tweet.routes.js'
import commentRoutes from './routes/comment.routes.js'
import playlistRoutes from './routes/playlist.routes.js'
import healthChcekRoutes from './routes/healthCheck.routes.js'
import videoRoutes from './routes/video.routes.js'
import likeRoutes from './routes/like.routes.js'
import subscriptionRoutes from './routes/dashboard.routes.js'
import dashboardRoutes from './routes/dashboard.routes.js'

app.use('/api/v1/user', userRoutes)
app.use('/api/v1/tweet', tweetRoutes)
app.use('/api/v1/comment', commentRoutes)
app.use('/api/v1/playlist', playlistRoutes)
app.use('/api/v1/healthcheck', healthChcekRoutes)
app.use('/api/v1/videos', videoRoutes)
app.use('/api/v1/likes', likeRoutes)
app.use('/api/v1/dashboard', dashboardRoutes)
app.use('/api/v1/subscriptions', subscriptionRoutes)

export { app }
