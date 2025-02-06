const {Router}=require("express");
const userRouter=Router();
const {userModel,courseModel, purchaseModel}=require("../mongo");
const jwt=require("jsonwebtoken");
const {JWT_USER_PASSWORD}=require("../config");
const { userMiddleware}=require("../middleware/user");
userRouter.post("/signup",async function(req,res){
    const {username,password,firstName,lastName}=req.body;
    const course=await userModel.create({
        username,
        password,
        firstName,
        lastName
    })
    res.json({
        message:"successfully signed up the user",
    })
})
userRouter.post("/signin",async function(req,res){
    const {username,password}=req.body;
    const course=userModel.findOne({
        username:username,
        password:password
    })
    if(course){
        const toke=jwt.sign({
            id:course._id
        },JWT_USER_PASSWORD);
        res.json({
            message:"successfully singed in ",
            token:toke
        })
    }
    else{
        res.status(404).send("user not found");
    }
})
userRouter.get("/purchases",userMiddleware,async function(req,res){
    const userId=req.userId;
    const purchases=await purchaseModel.find({
        userId
    })
    let purchasedCourseIds=[];
    for(let i=0;i<purchases.length;++i){
        purchasedCourseIds.push(purchases[i].courseId);
    }
    const coursesData=await courseModel.find({
        _id:{ $in:purchasedCourseIds}
    })
    res.json({
        purchases,
        coursesData
    })
})
module.exports={
    userRouter:userRouter
}