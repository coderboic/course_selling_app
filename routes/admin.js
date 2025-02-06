const { Router }=require("express");
const adminRouter=Router();
const { adminModel,courseModel}=require("../mongo");
const jwt=require("jsonwebtoken");
const { JWT_ADMIN_PASSWORD }=require("../config");
const { adminMiddleware }=require("../middleware/admin");

adminRouter.post("/signup",async function(req,res){
    const {username,password,firstName,LastName}=req.body;
    await adminModel.create({
        username:username,
        password:password,
        firstName:firstName,
        LastName:LastName
    })
    res.send("successfully signed up the admin");
})
adminRouter.post("/signin",async function(req,res){
    const {username,password}=req.body;
    const admin_up=await adminModel.findOne({
        username:username,
        password:password
    })
    if(admin_up){
        const token=jwt.sign({
            id:admin_up._id
        },JWT_ADMIN_PASSWORD);
        res.json({
            token,
            message:"signed in successfully"
        });
    }
    else{
        res.status(404).send("admin not found");
    }
})
adminRouter.post("/course",adminMiddleware,async function(req,res){
    const adminId=req.userId;
    const {title,description,price,published}=req.body;
    const course=courseModel.create({
        title:title,
        description:description,
        price:price,
        published:published,
        creatorId:adminId
    })
    res.json({
        courseId:course._id,
        message:"added the course successfully"
    })
})
adminRouter.put("/course",adminMiddleware,async function(req,res){
    const adminId=req.userId;
    const {title,description,price,published,courseId}=req.body;
    const course=await courseModel.updateOne({
        _id:courseId,
        creatorId:adminId
    },{
        title:title,
        description:description,
        price:price,
        published:published
    });
    res.json({
        message:"course updated",
        courseId:course._id
    })
})
adminRouter.get("/course/bulk",adminMiddleware,async function(req,res){
    const adminId=req.userId;
    const courses=await courseModel.find({
        creatorId:adminId
    })
    res.json({
        message:"courses by the admin",
        courses
    })
})
module.exports=({
    adminRouter:adminRouter
})