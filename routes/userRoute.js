import express from 'express'
import { registerUser, loginUser, getProfile, updateProfile, bookService, listBooking, cancelBooking, addReview, getTechnicianReviews } from '../controllers/userController.js'
import authUser from '../middlewares/authUser.js'
import upload from '../middlewares/multer.js'

const userRouter = express.Router()

userRouter.post('/register',registerUser)
userRouter.post('/login',loginUser)

userRouter.get('/get-profile',authUser,getProfile)
userRouter.post('/update-profile',upload.single('image'),authUser,updateProfile)
userRouter.post('/book-service',authUser,bookService)
userRouter.get('/bookings',authUser,listBooking)
userRouter.post('/cancel-booking',authUser,cancelBooking)


userRouter.post('/add-review', authUser, addReview)
userRouter.get('/reviews/:tecnId', getTechnicianReviews)



export default userRouter