const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const { Server } = require("socket.io");

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/seat_reservation', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('MongoDB Connected Successfully'))
.catch(err => console.log('MongoDB Connection Error:', err));

const scheduleRoutes = require('./routes/scheduleRoutes');

app.use('/api/schedules', scheduleRoutes);

const seatMapRoutes = require("./routes/seatMapRoutes");
app.use("/api/seatmap", seatMapRoutes);

app.get('/', (req, res) => {
  res.json({ message: 'Seat Reservation API is running' });
});

// Error Handling Middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

const PORT = process.env.PORT || 3001;
const server = app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

/* socket */
const io = new Server(server, {
  cors:{ origin:"*" }
});

/* IMPORTANT */
app.set("io", io);
