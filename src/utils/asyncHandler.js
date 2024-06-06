const asyncHandler = (func) => {
  return (req, res, next) => {
    Promise.resolve(func(req, res, next)).catch((err) => next(err))
  }
}
export { asyncHandler }

// const asyncHandler = (func) => {()=>{}}  ->curlie hta denge to next bala same h bs bracket remove kr diye

//  raper function ->isme koi function pass krenge e execute krke bhej dega

// const asyncHandler = (func) => async (req, res, next) => {
//   try {
//     await func(req,res,next)
//   } catch (error) {
//     res.status(err.code || 500).json({
//       success: false,
//       message: err.message,
//     })
//   }
// }
