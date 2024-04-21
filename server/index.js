const express=require('express');
const app=express();
const { dbConnect } = require("./config/database");
const userRoutes=require('./routes/User');
const profileRoutes=require('./routes/Profile');
const paymentRoutes=require('./routes/Payment');
const courseRotues=require('./routes/Course');
const cookieParser=require("cookie-parser");
const fileUpload=require('express-fileupload');
require('dotenv').config();
const cors=require('cors');
const { cloudinaryConnect } = require('./config/Cloudinary');
console.log("App Started");
const PORT=process.env.PORT || 4000;
//middle wares
app.use(express.json());
app.use(cookieParser());
app.use(
    cors({
        origin:"http://localhost:3000",
        credentials:true
    })
);
app.use(
fileUpload({
    useTempFiles:true,
    tempFileDir:"/tmp",
})
)

cloudinaryConnect();
dbConnect();

//routes
app.use("/api/v1/auth",userRoutes)
app.use("/api/v1/profile",profileRoutes)
app.use("/api/v1/payment",paymentRoutes)
app.use("/api/v1/course",courseRotues)
app.get("/", (req,res)=>{
    return res.status(200).json({
        sucess: true,
        message: "server is live now",
      }); 
})
//activate server
app.listen(PORT,()=>{
    console.log(`app running at port ${PORT}`);
})
