const {Router}=require("express");
const courseRouter=Router();
const {userMiddleware}=require("../middleware/user");
const {purchaseModel,courseModel}=require("../mongo");
const user = require("./user");

courseRouter.post("/purchase",userMiddleware,async function(req,res){
    const userId=req.userId;
    const courseId=req.body.courseId;

    await purchaseModel.create({
        userId,
        courseId
    })
    res.json({
        message:"You have successfully purchased the course"
    })
})
courseRouter.get("/preview",async function(req,res){
    const courses=await courseModel.find({});
    res.json({
        courses
    })
})
module.exports={
    courseRouter:courseRouter
}