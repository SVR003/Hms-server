import validator from 'validator'
import bcrypt from 'bcrypt'
import userModel from '../models/userModel.js'
import jwt from 'jsonwebtoken'
import {v2 as cloudinary} from 'cloudinary' 
import technicianModel from '../models/technicianModel.js'
import bookingModel from '../models/bookingModel.js'


// API to register user
const registerUser = async (req, res) => {

    try {
        const { name, email, password } = req.body

        if (!name || !password || !email) {
            return res.json({ success: false, message: "Missing Details!" })
        }

        if (!validator.isEmail(email)) {
            return res.json({ success: false, message: "Enter a valid email!" })
        }

        if (password.length < 8) {
            return res.json({ success: false, message: "Enter a strong password!" })
        }

        // Hashing US-P
        const salt = await bcrypt.genSalt(10)
        const hashedPassword = await bcrypt.hash(password, salt)

        const userData = {
            name,
            email,
            password: hashedPassword
        }

        const newUser = new userModel(userData)
        const user = await newUser.save()

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET)

        res.json({ success: true, token })


    } catch (err) {
        console.log(err)
        res.json({ success: false, message: err.message })
    }

}

// API for user login
const loginUser = async (req, res) => {
    try {

        const { email, password } = req.body
        const user = await userModel.findOne({ email })

        if (!user) {
            return res.json({ success: false, message: "User does not exist" })
        }

        const isMatch = await bcrypt.compare(password, user.password)

        if (isMatch) {
            const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET)
            res.json({ success: true, token })
        } else {
            res.json({ success: false, message: "Invalid Credentials!" })
        }

    } catch (err) {
        console.log(err)
        res.json({ success: false, message: err.message })
    }
}

// API to get user profile data
const getProfile = async (req, res) => {

    try {

        const { userId } = req.body
        const userData = await userModel.findById(userId).select('-password')

        res.json({ success: true, userData })

    } catch (err) {
        console.log(err)
        res.json({ success: false, message: err.message })
    }
}

// API to update user profile
const updateProfile = async (req, res) => {

    try {

        const { userId, name, phone, address, dob, gender } = req.body
        const imageFile = req.file

        if (!name || !phone || !dob || !gender) {
            return res.json({ success: false, message: "Data Missing" })
        }

        await userModel.findByIdAndUpdate(userId, { name, phone, address: JSON.parse(address), dob, gender })

        if(imageFile){

            // Upload im to cl
            const imageUpload = await cloudinary.uploader.upload(imageFile.path,{resource_type:'image'})
            const imageURl = imageUpload.secure_url

            await userModel.findByIdAndUpdate(userId,{image:imageURl})
        }

        res.json({success:true,message:"Profile Updated"})

    } catch (err) {
        console.log(err)
        res.json({ success: false, message: err.message })
    }
}

// API for booking service

const bookService = async (req,res) =>{

    try {

        const {userId, tecnId, slotDate, slotTime } = req.body

        const tecnData = await technicianModel.findById(tecnId).select('-password')

        if(!tecnData.available){
            return res.json({success:false,message:'Technician not Available!'})
        }

        let slots_booked = tecnData.slots_booked

        // check slots availability
        if(slots_booked[slotDate]){
            if(slots_booked[slotDate].includes(slotTime)){
                return res.json({success:false,message:'Slot not Available!'})
            }else {
                slots_booked[slotDate].push(slotTime)
            }
        }else{
            slots_booked[slotDate] = []
            slots_booked[slotDate].push(slotTime)
        }

        const userData = await userModel.findById(userId).select('-password')

        delete tecnData.slots_booked

        const bookingData = {
            userId,
            tecnId,
            userData,
            tecnData,
            amount:tecnData.fees,
            slotTime,
            slotDate,
            date: Date.now()
        }

        const newBooking = new bookingModel(bookingData)
        await newBooking.save()

        // save new slots data in tecnData
        await technicianModel.findByIdAndUpdate(tecnId,{slots_booked})

        res.json({success:true,message:'Booked Service'})
        
    } catch (err) {
        console.log(err)
        res.json({ success: false, message: err.message })
    }
}

// API to get bookings
const listBooking = async (req,res) => {
    try {

        const {userId} = req.body
        const bookings = await bookingModel.find({userId})

        res.json({success:true,bookings})
        
    } catch (err) {
        console.log(err)
        res.json({ success: false, message: err.message })
    }
}

// API to cancel user booking
const cancelBooking = async (req,res) => {
    try {

        const {userId, bookingId} = req.body

        const bookingData = await bookingModel.findById(bookingId)

        // verify booking user
        if(bookingData.userId !== userId){
            return res.json({success:false,message:'Unauthorized action'})
        }

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





// API to add a review for a technician
const addReview = async (req, res) => {
    try {
        const { userId, tecnId, rating, comment } = req.body;

        

        if (!userId || !tecnId || !rating || !comment) {
            return res.json({ success: false, message: "All fields are required!" });
        }
        

        const technician = await technicianModel.findById(tecnId);
        if (!technician) {
            return res.json({ success: false, message: "Technician not found!" });
        }

        const review = {
            userId,
            rating,
            comment,
            date: new Date()
        };

        technician.reviews.push(review);
        await technician.save();

        res.json({ success: true, message: "Review added successfully!" });

    } catch (err) {
        console.log(err);
        res.json({ success: false, message: err.message });
    }
}

// API to get reviews of a technician
const getTechnicianReviews = async (req, res) => {
    try {
        const { tecnId } = req.params;  
        console.log("Received tecnId:", tecnId);  

        if (!tecnId) {
            console.log("Technician ID is missing");  
            return res.status(400).json({ success: false, message: "Technician ID is required!" });
        }

        // Find technician by ID
        const technician = await technicianModel.findById(tecnId).select("reviews");

        if (!technician) {
            console.log("Technician not found for ID:", tecnId);  
            return res.status(404).json({ success: false, message: "Technician not found!" });
        }

        console.log("Technician reviews:", technician.reviews);  
        res.json({ success: true, reviews: technician.reviews });

    } catch (err) {
        console.error("Error in getTechnicianReviews:", err);  
        res.status(500).json({ success: false, message: "Server error" });
    }
}



export { registerUser, loginUser, getProfile, updateProfile, bookService, listBooking, cancelBooking, addReview, getTechnicianReviews }