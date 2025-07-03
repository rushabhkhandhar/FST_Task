# Train Seat Booking System

A web-based train seat booking system built with React and Node.js.

## Quick Start

1. **Clone the repository:**
```bash
git clone https://github.com/rushabhkhandhar/FST_Task.git
cd FST_Task
```

2. **Install dependencies:**
```bash
# Install server dependencies
cd server
npm install

# Install client dependencies  
cd ../client
npm install
```

3. **Development mode:**
```bash
# Terminal 1: Start backend server
cd server
npm run dev

# Terminal 2: Start frontend
cd client  
npm start
```

4. **Production build:**
```bash
cd client
npm run build

cd ../server
npm start
```

## Features

- 80 seats arranged in 12 rows (11 rows of 7 seats + 1 row of 3 seats)
- Smart seat allocation algorithm
- Real-time seat map visualization
- Modern UI with toast notifications
- SQLite database

## API Endpoints

- `GET /api/seats` - Get all seats
- `POST /api/book` - Book seats (1-7 at a time)  
- `GET /api/bookings` - Get booking history
- `POST /api/reset` - Reset all bookings

## Tech Stack

- **Frontend**: React, CSS3, React-Toastify
- **Backend**: Node.js, Express, SQLite3
- **Database**: SQLite (file-based)
