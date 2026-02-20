const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET;

/* REGISTER */
exports.register = async (req,res)=>{
  try{
    const { studentId,email,password,name,surname,telephone } = req.body;

    /* ===== VALIDATION ===== */
    if(!studentId || !email || !password || !name || !surname){
      return res.status(400).json({message:"Missing required fields"});
    }

    if(password.length < 6){
      return res.status(400).json({message:"Password must be at least 6 characters"});
    }

    if(!email.includes("@")){
      return res.status(400).json({message:"Invalid email format"});
    }

    /* ===== CHECK DUPLICATE ===== */
    const exist = await User.findOne({
      $or:[{email},{studentId}]
    });

    if(exist){
      return res.status(400).json({message:"User already exists"});
    }

    /* ===== HASH PASSWORD ===== */
    const hash = await bcrypt.hash(password,10);

    /* ===== CREATE USER ===== */
    const user = await User.create({
      studentId,
      email,
      password:hash,
      name,
      surname,
      telephone
    });

    /* ===== RESPONSE ===== */
    res.json({
      message:"Register success",
      user:{
        id:user._id,
        name:user.name
      }
    });

  }catch(err){
    console.error("REGISTER ERROR:",err);
    res.status(500).json({error:err.message});
  }
};



/* LOGIN */
exports.login = async (req,res)=>{
  try{
    let { email,password } = req.body;

    if(!email || !password){
      return res.status(400).json({message:"Missing email or password"});
    }

    email = email.trim().toLowerCase();

    const user = await User.findOne({email});
    if(!user) return res.status(400).json({message:"User not found"});

    const match = await bcrypt.compare(password,user.password);
    if(!match) return res.status(400).json({message:"Wrong password"});

    const token = jwt.sign(
      { id:user._id, role:user.role },
      JWT_SECRET,
      { expiresIn:"7d", issuer:"library-app" }
    );

    res.json({
    token,
    user:{
        id:user._id,
        studentId:user.studentId,
        name:user.name,
        surname:user.surname,
        role:user.role
    }
    });


  }catch(err){
    console.error("LOGIN ERROR:",err);
    res.status(500).json({error:err.message});
  }
};

