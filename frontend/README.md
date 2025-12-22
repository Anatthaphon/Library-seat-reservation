# Frontend - Planning System

React SPA for Planning/Schedule Management

---

## Structure

```
frontend/src/
├── components/
│   ├── Navbar.js            # Navigation bar
│   ├── WeeklyCalendar.js    # Calendar grid display
│   ├── EventPopup.js        # Event creation/edit popup
│   └── EventTypeSelector.js # Event type selection
├── pages/
│   └── Planning.js         # Main planning page
├── services/
│   └── api.js             # API service layer
├── styles/
│   ├── App.css
│   ├── Navbar.css
│   ├── Planning.css
│   ├── WeeklyCalendar.css
│   └── EventPopup.css
├── App.js                 # Main app component
└── index.js              # Entry point
```

---

## Installation

```bash
npm install
```

## Configuration

API URL is auto-configured:
- Development: `http://localhost:3001/api`
- Production: Set `REACT_APP_API_URL` environment variable

## Run

```bash
# Development
npm start

# Build for production
npm run build

# Test
npm test
```

---

## Features

### Planning Page
- Weekly calendar view (Monday - Sunday)
- Time slots: 9:00 - 19:00
- Create/Edit/Delete events
- 3 Event popup types
- Smart date filtering
- Business rule validation

### Event Popups
1. **Event 7**: Time selection (1-3 hr radio)
2. **Event 8**: Full form with dropdown (1-3 hr)
3. **Event 9**: Full form, fixed 3 hours

### Business Rules
- ✅ Book 3 days ahead (excluding Sundays)
- ❌ Sunday booking disabled
- ⏱️ Max 3 hours per event

---

## Dependencies

### Core
- react: ^18.2.0
- react-dom: ^18.2.0
- react-router-dom: ^6.20.0

### HTTP & Utilities
- axios: ^1.6.2
- date-fns: ^2.30.0

### Dev
- react-scripts: 5.0.1

---

## Components

### Navbar
Navigation bar with app title and menu

### WeeklyCalendar
- Displays 7-day grid (Mon-Sun)
- Shows time slots
- Renders events
- Handles date filtering
- Manages disabled states

### EventPopup
- 3 types of popups
- Form validation
- Time selection
- Event creation/editing

### Planning Page
- Main container
- State management
- API calls
- Event handlers

---

## Styling

Custom CSS files for each component:
- Professional color scheme
- Responsive layout
- Clean modern UI
- Disabled state visuals

---

## TODO: Future Development

- [ ] Authentication pages
- [ ] User profile page
- [ ] Seat reservation page
- [ ] Dark mode
- [ ] Mobile optimization
- [ ] Offline support (PWA)
