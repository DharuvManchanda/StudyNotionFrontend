const jwt = require("jsonwebtoken");
const User = require("../models/User");
require("dotenv").config();
exports.auth =async (req, res, next) => {
    try {
        console.log("cookie",req.cookies.token);
        console.log("body",req.body.token);
        console.log("header",req.header("Authorization"));
        let token = req.body.token || req.cookies.token || req.header("Authorization").replace("Bearer ","");
        // if(req.headers.authorization &&
        //     req.headers.authorization.startsWith("Bearer")
        //     ){
        //       try{
        //         token=req.headers.authorization.split(" ")[1];
        //       }catch{
        //         return res.status(401).json({
        //             success: false,
        //             message: "parasing error missing"
        //         })
        //       }
        //     }
        // const token = req.cookie.token 
        if (!token || token===undefined) {
            return res.status(401).json({
                success: false,
                message: "token missing"
            })
        }
        // verify the token 
        try {
            const decode = await jwt.verify(token, process.env.JWT_SECRET);
            console.log(decode);
            req.user = decode;
        }
        catch (e) {
            return res.status(401).json({
                success: false,
                message: "token is invalid"
            })
        }
        next();
    }
    catch (err) {
        console.log(err)
        return res.status(401).json({
            success: false,
            message: "Something went wrong while verifying token"
        })
    }
}
exports.isStudent = async (req, res, next) => {
    const userDetails = await User.findOne({ email: req.user.email });
    try {
		if (userDetails.accountType !== "Student") {
            return res.status(401).json({
                success: false,
                message: "This is a protect route for students you can not access it"
            })
        }
        next();
    }
    catch (err) {
        return res.status(500).json({
            success: false,
            message: "User Role is not Matching"
        })
    }
}
exports.isAdmin = async (req, res, next) => {
    try {
        const userDetails = await User.findOne({ email: req.user.email });

		if (userDetails.accountType !== "Admin") {            return res.status(401).json({
                success: false,
                message: "This is a protect route for Admins,you can not access it"
            })
        }
        next();
    }
    catch (err) {
        return res.status(500).json({
            success: false,
            message: "User Role is not Matching"
        })
    }
}
//isInstructor
exports.isInstructor = async (req, res, next) => {
    try{
		const userDetails = await User.findOne({ email: req.user.email });
		console.log(userDetails);

		console.log(userDetails.accountType);

		if (userDetails.accountType !== "Instructor") {               return res.status(401).json({
                   success:false,
                   message:'This is a protected route for Instructor only',
               });
           }
           next();
    }
    catch(error) {
       return res.status(500).json({
           success:false,
           message:'User role cannot be verified, please try again'
       })
    }
   }