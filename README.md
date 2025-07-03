# Railway Seat Reservation System

A professional web-based railway seat reservation system built with React and Node.js, featuring intelligent seat allocation algorithms.

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

- **Smart Allocation**: 80 seats arranged in 12 rows (11 rows × 7 seats + 1 row × 3 seats)
- **Intelligent Algorithm**: Priority-based seat allocation (same row → nearby seats)
- **Real-time Visualization**: Interactive seat map with live status updates
- **Professional UI**: Modern interface with toast notifications
- **Data Persistence**: SQLite database for reliable booking storage
- **Responsive Design**: Optimized for desktop, tablet, and mobile devices

## API Endpoints

- `GET /api/seats` - Retrieve all seat statuses
- `POST /api/book` - Reserve seats (1-7 passengers per transaction)  
- `GET /api/bookings` - Get reservation history
- `POST /api/reset` - Reset system (development/testing)

## Tech Stack

- **Frontend**: React 18, CSS3, React-Toastify
- **Backend**: Node.js, Express.js, SQLite3
- **Database**: SQLite (file-based, production-ready)
- **Deployment**: Ready for cloud platforms (Vercel, Railway, Heroku)
