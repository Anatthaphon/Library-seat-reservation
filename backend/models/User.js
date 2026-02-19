const mongoose = require("mongoose");

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

module.exports = mongoose.model("User", userSchema);
