import dotenv from 'dotenv'
import { app } from './app.js'
import connectDB from './db/index.js'

// config
dotenv.config({
  path: './.env',
})

//  shift this part to other main file where this fole also import
// db connect
connectDB()
  .then(() => {
    app.listen(process.env.PORT || 4040, () => {
      console.log(`Server start at port ${process.env.PORT}`)
    })
  })
  .catch((err) => {
    console.log('MONGO ERROR', err)
  })
