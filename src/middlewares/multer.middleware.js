import multer from 'multer'

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './public/temp')
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname)
  },
})

export const upload = multer({
  storage,
})

// const storage= multer.memoryStorage();
// const  singleupload = multer({storage}).single("file");
// export default singleupload
