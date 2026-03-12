const mongoose = require("mongoose");

const SeatMapItemSchema = new mongoose.Schema({

  mapId:{
    type:String,
    default:"main",
    index:true
  },

  type:{
    type:String,
    required:true,
    enum:["seat","label","block","computer"],
    index:true
  },

  zone:{
    type:String,
    default:null
  },

  size:{
    type:String,
    default:"normal"
  },

  pos:{
    left:{
      type:Number,
      required:true,
      min:0
    },
    top:{
      type:Number,
      required:true,
      min:0
    }
  },

  meta:{
    name:{
      type:String,
      trim:true
    },

    seatNumber:{
      type:String,
      trim:true,
      required:function(){
        return this.type === "seat" || this.type === "computer";
      }
    }
  },

  isActive:{
    type:Boolean,
    default:true
  }

},{timestamps:true});

SeatMapItemSchema.index({mapId:1,zone:1});
SeatMapItemSchema.index({mapId:1,isActive:1});
SeatMapItemSchema.index(
  {mapId:1,"meta.seatNumber":1},
  {unique:true,sparse:true}
);

module.exports = mongoose.model("SeatMapItem",SeatMapItemSchema);