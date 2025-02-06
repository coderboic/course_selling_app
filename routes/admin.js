const { Router }=require("express");
const adminRouter=Router();
const { adminModel,courseModel}=require("../mongo");
const jwt=require("jsonwebtoken");
const { JWT_ADMIN_PASSWORD }=require("../config");
const { adminMiddleware }=require("../middleware/admin");
const bcrypt=require("bcrypt");
const { z }=require("zod");
const adminsignupSchema=z.object({
    username:z.string().min(3),
    password:z.string().min(8),
    firstName:z.string().min(4),
    LastName:z.string().min(4)
})
const adminsigninSchema=z.object({
    username:z.string().min(3),
    password:z.string().min(8),
})
adminRouter.post("/signup",async function(req,res){
    try{
        adminsignupSchema.safeParse(req.body);
    }catch(e){
        return res.status(400).json({
            message:"invalid inputs",
            errors:e.errors
        });
    }
    const {username,password,firstName,LastName}=req.body;
    const saltRounds=10;
    const hashedPassword=await bcrypt.hash(password,saltRounds);
    await adminModel.create({
        username:username,
        password:hashedPassword,
        firstName:firstName,
        LastName:LastName
    })
    res.send("successfully signed up the admin");
})
adminRouter.post("/signin",async function(req,res){
    try{
        adminsigninSchema.safeParse(req.body);
    }catch(e){
        res.status(400).json({
            message:"incorrect details",
            errors:e.errors
        })
    }
    const {username,password}=req.body;
    const admin_up=await adminModel.findOne({
        username:username
    })
    if(!admin_up){
        return res.status(401).json({message:"Invalid credentials"});
    }
    if(admin_up){
        const isValid=await bcrypt.compare(password,admin_up.password);
        if(!isValid){
            return res.status(401).json({
                message:"invalid credentials"
            })
        }
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