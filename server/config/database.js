const mongoose=require("mongoose");
require('dotenv').config();
exports.dbConnect=()=>{
    mongoose.connect(process.env.DBURL,{
        useNewUrlParser:true,
        useUnifiedTopology: true,
    }).then(()=>{console.log('database connected');})
    .catch ((error) =>{ 
        console.log('database connection error');
        console.log(error);})
}
