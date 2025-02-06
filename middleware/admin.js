const jwt=require("jsonwebtoken");
const {JWT_ADMIN_PASSWORD}=require("../config");
function adminMiddleware(req,res,next){
    const token=req.headers.token;
    const veri=jwt.verify(token,JWT_ADMIN_PASSWORD);
    if(veri){
        req.userId=veri.id;
        next();
    }
    else{
        res.status(404).send("admin not found");
    }
}
module.exports={
    adminMiddleware:adminMiddleware
}