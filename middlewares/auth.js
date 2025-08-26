import jwt from "jsonwebtoken"
import User from "../models/userModel.js";

export const isAuthenticated =async(req,res,next) =>{
try {
    const {Access_Token} = req.cookies;
if(!Access_Token) return res.json({success:false,message:"Please login first."});
const decoded_token = jwt.verify(Access_Token,process.env.JWT_SECRET);
req.user = await User.findById(decoded_token._id);
if(!req.user){
    return res.json({message:"Invalid. User has no access"});
}
next();
} catch (error) {
    return res.status(500).json({message:"Authentication Failed"})
}
}