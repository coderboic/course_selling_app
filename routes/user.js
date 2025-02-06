const {Router}=require("express");
const userRouter=Router();
const bcrypt=require("bcrypt");
const {userModel,courseModel, purchaseModel}=require("../mongo");
const jwt=require("jsonwebtoken");
const {JWT_USER_PASSWORD}=require("../config");
const { userMiddleware}=require("../middleware/user");
const { z }=require("zod"); 
const signupSchema=z.object({
    username:z.string().min(3),
    password:z.string().min(8),
    firstName:z.string().min(4),
    LastName:z.string().min(4),
});
const signinSchema=z.object({
    username:z.string().min(3),
    password:z.string().min(8),
})
userRouter.post("/signup",async function(req,res){
    const valid=signupSchema.safeParse(req.body);
    if(!valid.success){
        return res.status(400).json({
            message:"validation failed",
            errors:valid.error.errors,
        })
    }
    const {username,password,firstName,LastName}=req.body;
    const hashedPassword=await bcrypt.hash(password,10);
    const course=await userModel.create({
        username,
        password:hashedPassword,
        firstName,
        LastName,
    })
    res.json({
        message:"successfully signed up the user",
    })
})
userRouter.post("/signin",async function(req,res){
    const valid=signinSchema.safeParse(req.body);
    if(!valid.success){
        return res.status(400).json({
            message:"invalid input",
            errors:valid.error.errors
        })
    }
    const { username,password }=req.body;
    const user=await userModel.findOne({
        username
    })
    if (!user) {
        return res.status(401).json({
            message: "Invalid credentials"
        });
    }
    const veri=await bcrypt.compare(password,user.password);
    if(!veri){
        return res.status(403).json({
            message:"incorrect credentials"
        })
    }
    const toke=jwt.sign({
        id:user._id
    },JWT_USER_PASSWORD);
    res.json({
        message:"successfully singed in ",
        token:toke
    })
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