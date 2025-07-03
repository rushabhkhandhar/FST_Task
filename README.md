# Train Seat Booking System

A web-based train seat booking system built with React and Node.js.

## Features

- 80 seats arranged in 12 rows (11 rows of 7 seats + 1 row of 3 seats)
- Smart seat allocation algorithm that prioritizes:
  1. Consecutive seats in the same row
  2. Seats in the same row (if consecutive not available)
  3. Nearby seats across rows
- Real-time seat map visualization
- Booking history tracking
- Responsive design for mobile and desktop
- RESTful API with SQLite database

## Tech Stack

**Frontend:**
- React 18
- CSS3 with modern styling (glass morphism effect)
- Responsive grid layout

**Backend:**
- Node.js
- Express.js
- SQLite3 database
- CORS enabled

## Database Structure

### Seats Table
```sql
CREATE TABLE seats (
  id INTEGER PRIMARY KEY,
  seat_number INTEGER UNIQUE NOT NULL,
  row_number INTEGER NOT NULL,
  is_booked BOOLEAN DEFAULT FALSE,
  booking_id TEXT DEFAULT NULL,
  booked_at DATETIME DEFAULT NULL
);
```

### Bookings Table
```sql
CREATE TABLE bookings (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  booking_id TEXT UNIQUE NOT NULL,
  seats_count INTEGER NOT NULL,
  seat_numbers TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

## API Endpoints

- `GET /api/seats` - Get all seats with their status
- `POST /api/book` - Book seats (1-7 seats at a time)
- `GET /api/bookings` - Get booking history
- `POST /api/reset` - Reset all bookings (for testing)

## Installation and Setup

1. Clone the repository
```bash
git clone <repository-url>
cd train-seat-booking-system
```

2. Install dependencies
```bash
npm run install-all
```

3. Start the development server
```bash
npm run dev
```

This will start:
- Backend server on http://localhost:5000
- Frontend React app on http://localhost:3000

## Production Build

1. Build the React app
```bash
npm run build
```

2. Start the production server
```bash
npm start
```

The production server will serve both the API and the built React app on port 5000.

## Deployment

This application is designed to be easily deployed on platforms like:
- Heroku
- Railway
- Render
- Vercel (with serverless functions)
- DigitalOcean App Platform

The build process creates a production-ready bundle that can be served statically with the Express server handling API routes.

## Seat Booking Algorithm

The booking algorithm follows these priorities:

1. **Same Row Consecutive**: Try to find consecutive seats in the same row
2. **Same Row**: If consecutive seats aren't available, book any available seats in the same row
3. **Nearby Seats**: If a single row can't accommodate the request, book the nearest available seats

This ensures the best possible user experience while maintaining efficient seat utilization.

## Features Implemented

✅ 80 seats in train coach (11 rows of 7 + 1 row of 3)
✅ Book 1-7 seats at a time
✅ Priority booking in same row
✅ Nearby seat allocation when row booking not possible
✅ Visual seat map with real-time updates
✅ Booking history and statistics
✅ Database persistence
✅ RESTful API
✅ Responsive design
✅ Modern UI with glass morphism effects

## License

MIT License
