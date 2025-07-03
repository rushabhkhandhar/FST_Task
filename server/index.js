const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, '../client/build')));

// Database setup
const db = new sqlite3.Database('./train_booking.db');

// Initialize database with seat structure
const initializeDatabase = () => {
  db.serialize(() => {
    // Create seats table
    db.run(`CREATE TABLE IF NOT EXISTS seats (
      id INTEGER PRIMARY KEY,
      seat_number INTEGER UNIQUE NOT NULL,
      row_number INTEGER NOT NULL,
      is_booked BOOLEAN DEFAULT FALSE,
      booking_id TEXT DEFAULT NULL,
      booked_at DATETIME DEFAULT NULL
    )`);

    // Create bookings table
    db.run(`CREATE TABLE IF NOT EXISTS bookings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      booking_id TEXT UNIQUE NOT NULL,
      seats_count INTEGER NOT NULL,
      seat_numbers TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    // Initialize seats if not exists
    db.get("SELECT COUNT(*) as count FROM seats", (err, row) => {
      if (err) {
        console.error('Error checking seats count:', err);
        return;
      }
      
      if (row.count === 0) {
        console.log('Initializing seats...');
        
        // Insert 80 seats: 11 rows of 7 seats + 1 row of 3 seats
        const stmt = db.prepare("INSERT INTO seats (seat_number, row_number, is_booked) VALUES (?, ?, ?)");
        
        let seatNumber = 1;
        
        // First 11 rows with 7 seats each (77 seats)
        for (let row = 1; row <= 11; row++) {
          for (let seatInRow = 1; seatInRow <= 7; seatInRow++) {
            stmt.run(seatNumber, row, false);
            seatNumber++;
          }
        }
        
        // Last row with 3 seats (78, 79, 80)
        for (let seatInRow = 1; seatInRow <= 3; seatInRow++) {
          stmt.run(seatNumber, 12, false);
          seatNumber++;
        }
        
        stmt.finalize();
        
        // Book some random seats initially as mentioned in requirements
        setTimeout(() => {
          const randomSeats = [5, 12, 23, 45, 67, 78];
          randomSeats.forEach(seatNum => {
            db.run("UPDATE seats SET is_booked = TRUE, booking_id = ? WHERE seat_number = ?", 
              [`INITIAL_${seatNum}`, seatNum]);
          });
          console.log('Initial seats booked:', randomSeats);
        }, 100);
      }
    });
  });
};

// Seat booking algorithm
const findBestSeats = (requestedSeats, callback) => {
  if (requestedSeats > 7) {
    return callback(new Error('Cannot book more than 7 seats at a time'));
  }

  db.all("SELECT * FROM seats WHERE is_booked = FALSE ORDER BY seat_number", (err, availableSeats) => {
    if (err) {
      return callback(err);
    }

    if (availableSeats.length < requestedSeats) {
      return callback(new Error('Not enough seats available'));
    }

    // Group seats by row
    const seatsByRow = {};
    availableSeats.forEach(seat => {
      if (!seatsByRow[seat.row_number]) {
        seatsByRow[seat.row_number] = [];
      }
      seatsByRow[seat.row_number].push(seat);
    });

    // Strategy 1: Try to find consecutive seats in the same row
    for (const rowNum in seatsByRow) {
      const rowSeats = seatsByRow[rowNum];
      if (rowSeats.length >= requestedSeats) {
        // Check for consecutive seats
        const consecutiveSeats = findConsecutiveSeats(rowSeats, requestedSeats);
        if (consecutiveSeats.length === requestedSeats) {
          return callback(null, consecutiveSeats);
        }
      }
    }

    // Strategy 2: Try to book seats in the same row (not necessarily consecutive)
    for (const rowNum in seatsByRow) {
      const rowSeats = seatsByRow[rowNum];
      if (rowSeats.length >= requestedSeats) {
        return callback(null, rowSeats.slice(0, requestedSeats));
      }
    }

    // Strategy 3: Book nearby seats across rows
    const nearbySeats = findNearbySeats(availableSeats, requestedSeats);
    return callback(null, nearbySeats);
  });
};

const findConsecutiveSeats = (seats, count) => {
  seats.sort((a, b) => a.seat_number - b.seat_number);
  
  for (let i = 0; i <= seats.length - count; i++) {
    let consecutive = [seats[i]];
    
    for (let j = i + 1; j < seats.length && consecutive.length < count; j++) {
      if (seats[j].seat_number === consecutive[consecutive.length - 1].seat_number + 1) {
        consecutive.push(seats[j]);
      } else {
        break;
      }
    }
    
    if (consecutive.length === count) {
      return consecutive;
    }
  }
  
  return [];
};

const findNearbySeats = (seats, count) => {
  seats.sort((a, b) => a.seat_number - b.seat_number);
  return seats.slice(0, count);
};

// Routes

// Get all seats with their status
app.get('/api/seats', (req, res) => {
  db.all("SELECT * FROM seats ORDER BY seat_number", (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(rows);
  });
});

// Book seats
app.post('/api/book', (req, res) => {
  const { seats_count } = req.body;
  
  if (!seats_count || seats_count < 1 || seats_count > 7) {
    return res.status(400).json({ error: 'Seats count must be between 1 and 7' });
  }

  findBestSeats(seats_count, (err, selectedSeats) => {
    if (err) {
      return res.status(400).json({ error: err.message });
    }

    const bookingId = `BOOK_${Date.now()}`;
    const seatNumbers = selectedSeats.map(seat => seat.seat_number);
    const currentTime = new Date().toISOString();

    db.serialize(() => {
      db.run("BEGIN TRANSACTION");

      // Update seats as booked
      const updateStmt = db.prepare("UPDATE seats SET is_booked = TRUE, booking_id = ?, booked_at = ? WHERE seat_number = ?");
      
      selectedSeats.forEach(seat => {
        updateStmt.run(bookingId, currentTime, seat.seat_number);
      });
      
      updateStmt.finalize();

      // Insert booking record
      db.run("INSERT INTO bookings (booking_id, seats_count, seat_numbers, created_at) VALUES (?, ?, ?, ?)",
        [bookingId, seats_count, JSON.stringify(seatNumbers), currentTime], function(err) {
        if (err) {
          db.run("ROLLBACK");
          return res.status(500).json({ error: err.message });
        }

        db.run("COMMIT");
        res.json({
          success: true,
          booking_id: bookingId,
          seat_numbers: seatNumbers,
          message: `Successfully booked ${seats_count} seat(s)`
        });
      });
    });
  });
});

// Get booking history
app.get('/api/bookings', (req, res) => {
  db.all("SELECT * FROM bookings ORDER BY created_at DESC", (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(rows);
  });
});

// Reset all bookings (for testing)
app.post('/api/reset', (req, res) => {
  db.serialize(() => {
    db.run("UPDATE seats SET is_booked = FALSE, booking_id = NULL, booked_at = NULL");
    db.run("DELETE FROM bookings");
    
    // Re-add some initial bookings
    setTimeout(() => {
      const randomSeats = [5, 12, 23, 45, 67, 78];
      randomSeats.forEach(seatNum => {
        db.run("UPDATE seats SET is_booked = TRUE, booking_id = ? WHERE seat_number = ?", 
          [`INITIAL_${seatNum}`, seatNum]);
      });
      res.json({ message: 'Database reset successfully' });
    }, 100);
  });
});

// Serve React app for any other routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/build', 'index.html'));
});

// Initialize database and start server
initializeDatabase();

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = app;
