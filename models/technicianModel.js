import mongoose from "mongoose";

const technicianSchema = new mongoose.Schema({
    name : {type:String, required:true},
    email : {type:String, required:true, unique:true},
    password : {type:String, required:true},
    image : {type:String, required:true},
    service : {type:String, required:true},
    skills : {type:String, required:true},
    experience : {type:String, required:true},
    about : {type:String, required:true},
    available : {type:Boolean, default:true},
    fees : {type:Number, required:true},
    address : {type:Object, required:true},
    date : {type:Number, required:true},
    slots_booked : {type:Object, default:{}},
    reviews: [
        {
            userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
            rating: { type: Number, required: true },
            comment: { type: String, required: true },
            date: { type: Date, default: Date.now }
        }
    ]
},{minimize:false})

const technicianModel = mongoose.models.technician || mongoose.model('technician', technicianSchema)

export default technicianModel