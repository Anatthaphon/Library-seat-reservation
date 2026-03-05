const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const { Server } = require("socket.io");
const seatmapHistoryRoutes = require("./routes/seatmapHistoryAPI");

dotenv.config();

const app = express();

// middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/api/seatmap/history", seatmapHistoryRoutes);

// mongo
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/seat_reservation')
.then(() => console.log('MongoDB Connected Successfully'))
.catch(err => console.log('MongoDB Connection Error:', err));

app.get('/', (req,res)=>{
  res.json({message:"Seat Reservation API running"});
});

// start server
const PORT = process.env.PORT || 3001;
const server = app.listen(PORT, ()=>{
  console.log(`Server running on port ${PORT}`);
});

// socket
const io = new Server(server,{
  cors:{origin:"*"}
});

app.set("io",io);


// ===== routes ต้องอยู่หลัง set io =====

const scheduleRoutes = require('./routes/scheduleRoutes');
app.use('/api/schedules', scheduleRoutes);

const seatMapRoutes = require("./routes/seatMapRoutes");
app.use("/api/seatmap", seatMapRoutes);


// error handler
app.use((err,req,res,next)=>{
  console.error("SERVER ERROR:",err);
  res.status(500).json({error:err.message});
});

const authRoutes = require("./routes/authRoutes");
app.use("/api/auth", authRoutes);
