import jwt from 'jsonwebtoken'

// technician authentication middleware
const authTechnician = async (req,res,next) => {
    try {

        const {ttoken} = req.headers
        if(!ttoken){
            return res.json({success:false,message:'Not Authorized Login Again'})
        }
        const token_decode = jwt.verify(ttoken,process.env.JWT_SECRET)
        
        req.body.tecnId = token_decode.id

        next()

    } catch (err) {
        console.log(err)
        res.json({success:false,message:err.message})
    }
}

export default authTechnician