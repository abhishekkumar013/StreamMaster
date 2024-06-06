import { v2 as cloudinary } from 'cloudinary'
import { error } from 'console'
import fs from 'fs' //Node js file system defult given not need to install

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

export const uploadOnCloudinary = async (localFilePath) => {
  try {
    if (!localFilePath) {
      return null
    }
    // upload file on cloudinary
    const response = await cloudinary.uploader.upload(localFilePath, {
      resource_type: 'auto',
    })

    fs.unlinkSync(localFilePath)
    // file has been upload successfully
    // console.log(response.url)
    return response
    // or return response.url
  } catch (error) {
    fs.unlinkSync(localFilePath) // remove locally saved file if not uploaded in clodinary
    return null
  }
}

// cloudinary.uploader.upload(
//   'https://upload.wikimedia.org/wikipedia/commons/a/ae/Olympic_flag.jpg',
//   { public_id: 'olympic_flag' },
//   function (error, result) {
//     console.log(result)
//   },
// )
