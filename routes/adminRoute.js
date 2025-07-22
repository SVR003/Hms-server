import express from 'express'
import { addTechnician, allTechnicians, loginAdmin, bookingsAdmin, bookingCancel, adminDashboard } from "../controllers/adminController.js"
import upload from "../middlewares/multer.js"
import authAdmin from '../middlewares/authAdmin.js'
import { changeAvailability } from '../controllers/technicianController.js'

const adminRouter = express.Router()

adminRouter.post('/add-technician',authAdmin,upload.single('image'),addTechnician)
adminRouter.post('/login',loginAdmin)
adminRouter.post('/all-technicians',authAdmin,allTechnicians)
adminRouter.post('/change-availability',authAdmin,changeAvailability)
adminRouter.get('/bookings',authAdmin,bookingsAdmin)
adminRouter.post('/cancel-booking',authAdmin,bookingCancel)
adminRouter.get('/dashboard',authAdmin,adminDashboard)

export default adminRouter