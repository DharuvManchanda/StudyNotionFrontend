//send otp code
const Profile = require("../models/Profile");
const User = require("../models/User");
const OTP = require("../models/otp");
const OTPMaker = require("otp-generator");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const mailSender = require("../utils/mailSender")
const { passwordUpdated } = require("../mail/templates/passwordUpdate")
exports.sendotp = async (req, res) => {
  try {
    const { email } = req.body;
    const checkUserPresent = await User.findOne({ email });
    if (checkUserPresent) {
      return res.status(401).json({
        success: false,
        message: "User Already Registered",
      });
    }
    //generate otp
    var otp = OTPMaker.generate(6, {
      upperCaseAlphabets: false,
      lowerCaseAlphabets: false,
      specialChars: false,
    });
    console.log("OTP generated: ", otp);
    const result = await OTP.findOne({ otp: otp });
    while (result) {
      otp = OTPMaker(6, {
        upperCaseAlphabets: false,
        lowerCaseAlphabets: false,
        specialChars: false,
      });
      result = await OTP.findOne({ otp: otp });
    }
    //create entry for otp
    const otpPayload = { email, otp };
    const otpBody = await OTP.create(otpPayload);
    console.log(otpBody);
    res.status(200).json({
      success: true,
      message: "OTP Sent Successfully",
      data:otp
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.signup = async (req, res) => {
  try {
    // get data
    const {
      firstName,
      lastName,
      email,
      password,
      confirmPassword,
      accountType,
      contactNumber,
      otp,
    } = req.body;
    // check if user already exist
    if (
      !firstName ||
      !lastName ||
      !email ||
      !password ||
      !confirmPassword ||
      !otp
    ) {
      return res.status(403).json({
        success: false,
        message: "All fields are required",
      });
    }
    if (password !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "password and confirm passowrd value does not match",
      });
    }
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "User Already Exists",
      });
    }
    //otp recent
    const recentOtp = await OTP.find({ email }).sort({ createdAt: -1 }).limit(1);
    console.log(recentOtp);
    //validateOtp
    if (recentOtp.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Otp Not Found",
      });
    } else if (otp !== recentOtp[0].otp) {
      return res.status(400).json({
        success: false,
        message: "Invalid Otp ",
      });
    }
    console.log('ap now working');

    // Secured password
    const hashedPassword = await bcrypt.hash(password, 10);
    let approved = "";
    approved === "Instructor" ? (approved = false) : (approved = true);
    console.log('approved now working');

    //profile
    const profileDetails = await Profile.create({
      gender: null,
      dateOfBirth: null,
      about: null,
      contactNumber: null,
    });
    console.log('entery now working');

    // Create Entry for User
    let user = await User.create({
      firstName,
      lastName,
      email,
      password: hashedPassword,
      accountType:accountType,
      approved:approved,
      contactNumber,
      additionalDetails: profileDetails._id,
      image: `https://api.dicebear.com/5.x/initials/svg?seed=${firstName} ${lastName}`,
    });
    console.log('till now working');
    return res.status(200).json({
      success: true,
      message: "User Created Successfully",
      data: user,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      success: false,
      message: "User cannot be register,Please try again later",
    });
  }
};
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Please fill all the details carefully",
      });
    }
    // check for register user
    let user = await User.findOne({ email }).populate('additionalDetails');
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User does not exist",
      });
    }
    // Verify password & generate a JWT token

    const payload = {
      email: user.email,
      id: user._id,
      accountType: user.accountType,
    };

    if (await bcrypt.compare(password, user.password)) {
      // password match
      let token = jwt.sign(payload, process.env.JWT_SECRET, {
        expiresIn: "5h",
      });

      user = user.toObject();
      user.token = token;
      user.password = undefined;
      console.log('till not working');

      const options = {
        expires: new Date(Date.now() + 5 * 60 * 60 * 1000),
        httpOnly: true,
      };
      res.json({
        success: true,
        token,
        user,
        message: "User logged in successfully",
      });
      //     res.cookie("token",token,options).status(200).json({
      //     success : true,
      //     token,
      //     user,
      //     message:"User logged in successfully"
      // });
    } else {
      // password not match
      return res.status(403).json({
        success: false,
        message: "Password does not match",
      });
    }
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      success: false,
      message: "Login failure try again later",
    });
  }
};
exports.changePassword = async (req, res) => {
  try {
    // Get user data from req.user
    const userDetails = await User.findById(req.user.id)

    // Get old password, new password, and confirm new password from req.body
    const { oldPassword, newPassword } = req.body

    // Validate old password
    const isPasswordMatch = await bcrypt.compare(
      oldPassword,
      userDetails.password
    )
    if (!isPasswordMatch) {
      // If old password does not match, return a 401 (Unauthorized) error
      return res
        .status(401)
        .json({ success: false, message: "The password is incorrect" })
    }

    // Update password
    const encryptedPassword = await bcrypt.hash(newPassword, 10)
    const updatedUserDetails = await User.findByIdAndUpdate(
      req.user.id,
      { password: encryptedPassword },
      { new: true }
    )

    // Send notification email
    try {
      const emailResponse = await mailSender(
        updatedUserDetails.email,
        "Password for your account has been updated",
        passwordUpdated(
          updatedUserDetails.email,
          `Password updated successfully for ${updatedUserDetails.firstName} ${updatedUserDetails.lastName}`
        )
      )
      console.log("Email sent successfully:", emailResponse.response)
    } catch (error) {
      // If there's an error sending the email, log the error and return a 500 (Internal Server Error) error
      console.error("Error occurred while sending email:", error)
      return res.status(500).json({
        success: false,
        message: "Error occurred while sending email",
        error: error.message,
      })
    }

    // Return success response
    return res
      .status(200)
      .json({ success: true, message: "Password updated successfully" })
  } catch (error) {
    // If there's an error updating the password, log the error and return a 500 (Internal Server Error) error
    console.error("Error occurred while updating password:", error)
    return res.status(500).json({
      success: false,
      message: "Error occurred while updating password",
      error: error.message,
    })
  }
}
