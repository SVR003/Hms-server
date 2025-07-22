import technicianModel from '../models/technicianModel.js'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import bookingModel from '../models/bookingModel.js'


const changeAvailability = async (req,res) => {

    try {
        
        const {tecnId} = req.body

        const tecnData = await technicianModel.findById(tecnId)
        await technicianModel.findByIdAndUpdate(tecnId,{available: !tecnData.available })
        res.json({success:true, message: 'Avaialbility Changed'})
        
    } catch (err) {
        console.log(err)
        res.json({success:false,message:err.message})
    }
}

const technicianList = async (req,res) =>{
    try {
        const technicians = await technicianModel.find({}).select(['-password','-email'])

        res.json({success:true,technicians})

    } catch (err) {
        console.log(err)
        res.json({success:false,message:err.message})
    }
}

// API for tecnician login
const loginTechnician = async (req,res) => {

    try {

        const { email, password} = req.body
        const technician = await technicianModel.findOne({email})

        if(!technician){
            return res.json({success:false,message:'Invalid Credentials'})
        }

        const isMatch = await bcrypt.compare(password, technician.password)

        if(isMatch){

            const token = jwt.sign({id:technician._id},process.env.JWT_SECRET)

            res.json({success:true,token})
        }else{
            res.json({success:false,message:'Invalid Credentials'})
        }
        
    } catch (err) {
        console.log(err)
        res.json({success:false,message:err.message})
    }
}

// Api to get techn bookings for tecn panel
const bookingsTechnician = async (req,res) => {

    try {

        const {tecnId} = req.body
        const bookings = await bookingModel.find({tecnId})

        res.json({success:true,bookings})
        
    } catch (err) {
        console.log(err)
        res.json({success:false,message:err.message})
    }
}

// Api to mark booking completed for tecn panel
const bookingComplete = async (req,res) => {

    try {

        const {tecnId, bookingId} = req.body

        const bookingData = await bookingModel.findById(bookingId)

        if(bookingData && bookingData.tecnId === tecnId){
            await bookingModel.findByIdAndUpdate(bookingId, {isCompleted: true})
            return res.json({success:true,message:'Booking Completed'})
        }else{
            return res.json({success:false,message:'Mark Failed'})
        }
        
    } catch (err) {
        console.log(err)
        res.json({success:false,message:err.message})
    }
}

// Api to cancel booking  for tecn panel

const bookingCancel = async (req,res) => {

    try {

        const {tecnId, bookingId} = req.body

        const bookingData = await bookingModel.findById(bookingId)

        if(bookingData && bookingData.tecnId === tecnId){
            await bookingModel.findByIdAndUpdate(bookingId, {cancelled: true})
            return res.json({success:true,message:'Booking Cancelled'})
        }else{
            return res.json({success:false,message:'Cancellation Failed'})
        }
        
    } catch (err) {
        console.log(err)
        res.json({success:false,message:err.message})
    }
}

// Api to get dashboard data  for tecn panel
const technicianDashboard = async (req,res) => {

    try {

        const {tecnId} = req.body

        const bookings = await bookingModel.find({tecnId})

        let earnings = 0

        bookings.map((item) => {
            // 
            if(item.isCompleted ) {   
                earnings += item.amount
            }
        })

        let users = []

        bookings.map((item) => {
            if(!users.includes(item.userId)){
                users.push(item.userId)
            }
        })

        const dashData = {
            earnings,
            bookings: bookings.length,
            users: users.length,
            latestBookings: bookings.reverse().slice(0,5)
        }

        res.json({success:true,dashData})
        
    } catch (err) {
        console.log(err)
        res.json({success:false,message:err.message})
    }
}

// API to get tecn profile for tecn panel
const technicianProfile = async (req,res) => {

    try {

        const {tecnId} = req.body
        const profileData = await technicianModel.findById(tecnId).select('-password')

        res.json({success:true,profileData})
        
    } catch (err) {
        console.log(err)
        res.json({success:false,message:err.message})
    }
}


// API to update profile data from tecn panel
const updateTechnicianProfile = async (req,res) => {

    try {

        const {tecnId, fees, address, available} = req.body

        await technicianModel.findByIdAndUpdate(tecnId,{fees, address, available})

        res.json({success:true, message:'Profile Updated'})
        
    } catch (err) {
        console.log(err)
        res.json({success:false,message:err.message})
    }
}


export {changeAvailability, technicianList, loginTechnician, bookingsTechnician, bookingComplete, bookingCancel, technicianDashboard, technicianProfile, updateTechnicianProfile}