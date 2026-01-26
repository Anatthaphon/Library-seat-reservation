# Backend - Planning System

Node.js + Express + MongoDB API Server

---

## Structure

```
backend/
├── models/
│   └── Schedule.js          # Schedule model
├── controllers/
│   └── scheduleController.js # Schedule CRUD operations
├── routes/
│   └── scheduleRoutes.js    # Schedule API routes
├── server.js               # Main server file
├── package.json
├── .env.example
└── README.md
```

---

## Installation

```bash
npm install
```

## Configuration

Create `.env` file:
```env
MONGODB_URI=mongodb://localhost:27017/planning_system
PORT=3001
```

## Run

```bash
# Development
npm run dev

# Production
npm start
```

---

## API Endpoints

Base URL: `http://localhost:3001/api`

### Schedules
- `GET /schedules` - Get all schedules
- `GET /schedules/:id` - Get schedule by ID
- `POST /schedules` - Create schedule
- `PUT /schedules/:id` - Update schedule
- `DELETE /schedules/:id` - Delete schedule
- `GET /schedules/week/:date` - Get schedules by week
- `GET /schedules/range/:startDate/:endDate` - Get by date range
- `GET /schedules/instructor/:instructorId` - Get by instructor

See `/API_DOCUMENTATION.md` in project root for details.

---

## Database

**MongoDB Database:** `planning_system`

**Collections:**
- `schedules` - Event/schedule records

### Schedule Schema
```javascript
{
  title: String (required),
  courseCode: String,
  instructor: ObjectId,
  instructorName: String,
  date: Date (required),
  dayOfWeek: Number (0-6, required),
  timeSlot: {
    startTime: String (required),
    endTime: String (required)
  },
  duration: Number,
  room: String,
  color: String,
  type: String,
  description: String,
  notes: String,
  status: String,
  isRecurring: Boolean,
  recurringPattern: String,
  timestamps: true
}
```

---

## TODO: Future Development

- [ ] User authentication
- [ ] Authorization middleware
- [ ] Seat & Reservation models
- [ ] Rate limiting
- [ ] Request logging
- [ ] API documentation (Swagger)
