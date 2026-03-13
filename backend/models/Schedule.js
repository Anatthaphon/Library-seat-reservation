const mongoose = require("mongoose");

const scheduleSchema = new mongoose.Schema({

  userId:{
    type:mongoose.Schema.Types.ObjectId,
    ref:"User",
    required:true
  },

  title:{
    type:String,
    required:true,
    trim:true
  },

  date:{
    type:Date,
    required:true
  },

  dayOfWeek:{
    type:Number,
    required:true
  },

  timeSlot:{
    startTime:{
      type:String,
      required:true
    },
    endTime:{
      type:String,
      required:true
    }
  },

  duration:{
    type:Number,
    default:1
  },

  seatItemId:{
    type:mongoose.Schema.Types.ObjectId,
    ref:"SeatmapItem",
    required:function(){
      return this.type === "reservation";
    }
  },

  seatName:{
  type:String
},

  planId:{
    type:mongoose.Schema.Types.ObjectId,
    ref:"Schedule",
    default:null
  
  },

  color:{
    type:String,
    default:"#3b82f6"
  },

  type:{
    type:String,
    enum:["plan","reservation"],
    default:"plan"
  },

  notes:{
    type:String,
    trim:true
  },

  status:{
    type:String,
    enum:[
      "planned",
      "reserved",
      "checkedin",
      "completed",
      "cancelled"
    ],
    default:"planned"
  }

},{
  timestamps:true
});

scheduleSchema.index({ userId:1, date:1 });
scheduleSchema.index({ date:1, dayOfWeek:1 });

scheduleSchema.index(
{
  seatItemId:1,
  date:1,
  "timeSlot.startTime":1
},
{
  unique:true,
  partialFilterExpression:{ type:"reservation" }
}
);

module.exports = mongoose.model("Schedule",scheduleSchema);