require('dotenv').config()
const bcrypt=require("bcrypt");
const express=require("express");
const {AdminModel,AdminCourse,UserModel,UsersCourses}=require("./mongo");
const jwt=require("jsonwebtoken");
const mongoose=require("mongoose");
const JWT_SECRET="sudouser";
const {z}=require("zod");
const app=express();
app.use(express.json());
const {userRouter}=require("./routes/user");
const {adminRouter}=require("./routes/admin");
const {courseRouter}=require("./routes/course");

app.use("/api/v1/user",userRouter);
app.use("/api/v1/admin",adminRouter);
app.use("/api/v1/course",courseRouter);

async function main(){
    await mongoose.connect(process.env.MONGO_URL);
    app.listen(3000);
    console.log("listening on port 3000");
}
main();