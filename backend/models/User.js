const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const userSchema = new mongoose.Schema({

  studentId:{
    type:String,
    required:true,
    unique:true,
    trim:true
  },

  email:{
    type:String,
    required:true,
    unique:true,
    lowercase:true,
    trim:true,
    match:[/^\S+@\S+\.\S+$/,"Invalid email"]
  },

  password:{
    type:String,
    required:true,
    minlength:6
  },

  name:{
    type:String,
    required:true,
    trim:true
  },

  surname:{
    type:String,
    required:true,
    trim:true
  },

  telephone:{
    type:String,
    trim:true
  },

  role:{
    type:String,
    enum:["user","admin"],
    default:"user"
  }

},{
  timestamps:true
});

userSchema.index({studentId:1});
userSchema.index({email:1});

userSchema.pre("save", async function(next){

  if(!this.isModified("password")) return next();

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password,salt);

  next();

});

userSchema.methods.comparePassword = async function(password){

  return bcrypt.compare(password,this.password);

};

userSchema.virtual("fullName").get(function(){
  return `${this.name} ${this.surname}`;
});

module.exports = mongoose.model("User", userSchema);