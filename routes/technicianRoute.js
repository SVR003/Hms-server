import express from 'express'
import { technicianList, loginTechnician, bookingsTechnician, bookingComplete, bookingCancel, technicianDashboard, technicianProfile, updateTechnicianProfile } from '../controllers/technicianController.js'
import authTechnician from '../middlewares/authTechnician.js'

const technicianRouter = express.Router()

technicianRouter.get('/list',technicianList)
technicianRouter.post('/login',loginTechnician)
technicianRouter.get('/bookings',authTechnician,bookingsTechnician)
technicianRouter.post('/complete-booking',authTechnician,bookingComplete)
technicianRouter.post('/cancel-booking',authTechnician,bookingCancel)
technicianRouter.get('/dashboard',authTechnician,technicianDashboard)
technicianRouter.get('/profile',authTechnician,technicianProfile)
technicianRouter.post('/update-profile',authTechnician,updateTechnicianProfile)


export default technicianRouter