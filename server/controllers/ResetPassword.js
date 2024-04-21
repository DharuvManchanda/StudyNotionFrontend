const User = require("../models/User");
const { mailSender } = require("../utils/mailSender");
const bcrypt = require("bcrypt");
const crypto = require("crypto");

exports.resetPasswordToken = async (req, res) => {
  //token generation
  try {
    const email = req.body.email;
    const user = await User.findOne({ email: email });
    if (!user) {
      return res.status(500).json({
        success: false,
        message: "Email not registerd",
      });
    }
    const token = crypto.randomBytes(20).toString("hex");
    console.log("3");

    const updateDetails = await User.findOneAndUpdate(
      { email: email },
      {
        token: token,
        resetPasswordExpires: Date.now() + 3600000,
      },
      { new: true }
    );
    console.log("details-", updateDetails);
    const url = `http://localhost:3000/update-password/${token}`;
    console.log("1");
    await mailSender(
      email,
      "Password Reset LInk",
      `Password Resest Link: ${url}`
    );
    console.log("2");
    return res.json({
      success: true,
      message:
        "Email sent successfully, please check email and change password",
    });
  } catch (error) {
    console.log(error);
    return res.status(400).json({
      success: false,
      message: error.message,
      token: token,
    });
  }
};

exports.resetPassword = async (req, res) => {
  try {
    const { password, confirmPassword, token } = req.body;
    if (password !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "password and confirm passowrd value does not match",
      });
    }
    const userDetails = await User.findOne({ token: token });
    if (!userDetails) {
      return res.status(400).json({
        success: false,
        message: "Token is invalid",
      });
    }
    if (!(userDetails.resetPasswordExpires > Date.now())) {
      return res.status(400).json({
        success: false,
        message: "Token is expired,regenerate your token",
      });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    await User.findOneAndUpdate(
      { token: token },
      { password: hashedPassword },
      { new: true },
    );
    return res.status(200).json({
      success: true,
      message: "password reset successfully",
    });
  } catch (error) {
    console.log(error);
    return res.status(400).json({
      success: false,
      message: "Something went wrong, Please try again later",
    });
  }
};
