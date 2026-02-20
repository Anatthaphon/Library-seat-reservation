const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET;

/* ===============================
   VERIFY TOKEN
================================ */
exports.verifyToken = (req,res,next)=>{
  try{
    const authHeader = req.headers.authorization;

    if(!authHeader || !authHeader.startsWith("Bearer ")){
      return res.status(401).json({message:"No token provided"});
    }

    const token = authHeader.split(" ")[1];

    const decoded = jwt.verify(token, JWT_SECRET);

    req.user = decoded; // { id, role }

    next();

  }catch(err){
    return res.status(401).json({message:"Invalid or expired token"});
  }
};


/* ===============================
   ROLE CHECK
================================ */
exports.requireRole = (...roles)=>{
  return (req,res,next)=>{
    if(!req.user){
      return res.status(401).json({message:"Unauthorized"});
    }

    if(!roles.includes(req.user.role)){
      return res.status(403).json({message:"Forbidden"});
    }

    next();
  };
};
