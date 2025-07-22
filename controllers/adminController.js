import validator from "validator"
import bycrypt from 'bcryptjs'
import { v2 as cloudinary } from "cloudinary"
import technicianModel from "../models/technicianModel.js"
import jwt from 'jsonwebtoken'
import bookingModel from "../models/bookingModel.js"
import userModel from "../models/userModel.js"

// API for adding Technician
const addTechnician = async (req,res) => {
    try {

        const { name, email, password, service, skills, experience, about, fees, address } = req.body
        const imageFile = req.file

        // checking for all data to add doctor
        if(!name || !email || !password || !service || !skills || !experience || !about || !fees || !address){
            return res.json({success:false,message:"Missing Details"})
        }

        // validating email format
        if (!validator.isEmail(email)) {
            return res.json({success:false,message:"Please enter a valid email"})
        }

        // validate password is strong or not
        if(password.length < 8){
            return res.json({success:false,message:"Please enter a strong password"})
        }
        
        // hashing tecn password
        const salt = await bycrypt.genSalt(10)
        const hashedPassword = await bycrypt.hash(password, salt)

        // upload image to cloudinary
        const imageUpload = await cloudinary.uploader.upload(imageFile.path, {resource_type:"image"})
        const imageUrl = imageUpload.secure_url

        const technicianData = {
            name,
            email,
            image:imageUrl,
            password:hashedPassword,
            service,
            skills,
            experience,
            about,
            fees,
            address:JSON.parse(address),
            date:Date.now()
        }

        const newTechnician = new technicianModel(technicianData)
        await newTechnician.save()

        res.json({success:true,message:"Technician Added"})

    } catch (err) {
        console.log(err)
        res.json({success:false,message:err.message})
        
    }
}

// Api for admin login
const loginAdmin = async (req,res) => {
    try {

        const {email,password} = req.body

        if(email === process.env.ADMIN_EMAIL && password === process.env.ADMIN_PASSWORD){

            const token = jwt.sign(email+password,process.env.JWT_SECRET)
            res.json({success:true,token})

        }else{
            res.json({success:false,message:"Invalid credentials"})
        }

    } catch (err) {
        console.log(err)
        res.json({success:false,message:err.message})
    }
}

// Api to get all technician list in admin panel
const allTechnicians = async (req,res)=> {
    try {

        const technicians = await technicianModel.find({}).select('-password')
        res.json({success:true,technicians})
        
    } catch (err) {
        console.log(err)
        res.json({success:false,message:err.message})
    }
}

// Api to get all Bookings list
const bookingsAdmin = async (req,res) => {

    try {

        const bookings = await bookingModel.find({})
        res.json({success:true,bookings})
        
    } catch (err) {
        console.log(err)
        res.json({success:false,message:err.message})
    }
}

// API for appointment cancellation
const bookingCancel = async (req,res) => {
    try {

        const { bookingId} = req.body

        const bookingData = await bookingModel.findById(bookingId)


        await bookingModel.findByIdAndUpdate(bookingId, {cancelled:true})

        // releasing slot ------

        const {tecnId, slotDate, slotTime} = bookingData

        const technicianData = await technicianModel.findById(tecnId)

        let slots_booked = technicianData.slots_booked

        slots_booked[slotDate] = slots_booked[slotDate].filter(e => e !== slotTime)

        await technicianModel.findByIdAndUpdate(tecnId, {slots_booked})

        res.json({success:true,message:'Booking Cancelled'})
        
    } catch (err) {
        console.log(err)
        res.json({ success: false, message: err.message })
    }
}

// API to get dashboard data for admin panel
const adminDashboard = async (req,res) =>{

    try {

        const technicians = await technicianModel.find({})
        const users = await userModel.find({})
        const bookings = await bookingModel.find({})

        const dashData = {
            technicians: technicians.length,
            bookings: bookings.length,
            users: users.length,
            latestBookings: bookings.reverse().slice(0,5)
        }

        res.json({success:true,dashData})
        
    } catch (err) {
        console.log(err)
        res.json({ success: false, message: err.message })
    }
}

export {addTechnician,loginAdmin,allTechnicians, bookingsAdmin, bookingCancel, adminDashboard
    
}