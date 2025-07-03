# Train Seat Booking System - Database Structure

## Database Design

This application uses SQLite as the database for simplicity and portability. The database consists of two main tables that handle seat management and booking tracking.

## Tables

### 1. Seats Table

The `seats` table stores information about each individual seat in the train coach.

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

**Columns:**
- `id`: Primary key (auto-increment)
- `seat_number`: Unique seat number (1-80)
- `row_number`: Row number (1-12)
- `is_booked`: Boolean flag indicating if seat is booked
- `booking_id`: Reference to the booking that reserved this seat
- `booked_at`: Timestamp when the seat was booked

**Seat Layout:**
- Rows 1-11: 7 seats each (seats 1-77)
- Row 12: 3 seats (seats 78-80)
- Total: 80 seats

### 2. Bookings Table

The `bookings` table stores information about each booking transaction.

```sql
CREATE TABLE bookings (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  booking_id TEXT UNIQUE NOT NULL,
  seats_count INTEGER NOT NULL,
  seat_numbers TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

**Columns:**
- `id`: Primary key (auto-increment)
- `booking_id`: Unique booking identifier (format: BOOK_timestamp)
- `seats_count`: Number of seats booked in this transaction
- `seat_numbers`: JSON string containing array of booked seat numbers
- `created_at`: Timestamp when booking was created

## Data Relationships

- One booking can have multiple seats (1 to 7 seats)
- Each seat can only belong to one booking at a time
- The `booking_id` in the seats table references the `booking_id` in the bookings table

## Indexing Strategy

The database uses the following indexes for optimal performance:

1. **Primary Keys**: Automatic indexes on `id` columns
2. **Unique Constraints**: Automatic indexes on `seat_number` and `booking_id`
3. **Query Optimization**: The seat_number and row_number columns are frequently queried together

## Sample Data

### Initial Seat Data
```sql
-- Seats 1-77 (Rows 1-11, 7 seats each)
INSERT INTO seats (seat_number, row_number, is_booked) VALUES 
(1, 1, FALSE), (2, 1, FALSE), ..., (77, 11, FALSE);

-- Seats 78-80 (Row 12, 3 seats)
INSERT INTO seats (seat_number, row_number, is_booked) VALUES 
(78, 12, FALSE), (79, 12, FALSE), (80, 12, FALSE);
```

### Sample Booking
```sql
-- Booking record
INSERT INTO bookings (booking_id, seats_count, seat_numbers, created_at) 
VALUES ('BOOK_1704188400000', 3, '[15, 16, 17]', '2024-01-02 10:00:00');

-- Update seats as booked
UPDATE seats SET 
  is_booked = TRUE, 
  booking_id = 'BOOK_1704188400000', 
  booked_at = '2024-01-02 10:00:00' 
WHERE seat_number IN (15, 16, 17);
```

## Database Operations

### Common Queries

1. **Get all available seats:**
```sql
SELECT * FROM seats WHERE is_booked = FALSE ORDER BY seat_number;
```

2. **Get seats in a specific row:**
```sql
SELECT * FROM seats WHERE row_number = ? ORDER BY seat_number;
```

3. **Find consecutive available seats:**
```sql
SELECT seat_number FROM seats 
WHERE is_booked = FALSE AND row_number = ?
ORDER BY seat_number;
```

4. **Get booking history:**
```sql
SELECT * FROM bookings ORDER BY created_at DESC LIMIT 10;
```

### Transaction Management

The application uses database transactions for booking operations to ensure data consistency:

1. Begin transaction
2. Update seats table (mark as booked)
3. Insert booking record
4. Commit transaction (or rollback on error)

## Performance Considerations

1. **Small Dataset**: With only 80 seats, performance is not a concern
2. **Concurrent Access**: SQLite handles concurrent reads well, writes are serialized
3. **Memory Usage**: Database fits entirely in memory for fast access
4. **Backup**: SQLite file can be easily backed up and restored

## Scalability Notes

For larger scale implementations, consider:

1. **PostgreSQL/MySQL**: For better concurrent write performance
2. **Connection Pooling**: For handling multiple simultaneous bookings
3. **Caching**: Redis for frequently accessed seat status
4. **Partitioning**: Separate tables for different coaches/trains
5. **Audit Tables**: Track all seat status changes for analytics

## Database File Location

The SQLite database file `train_booking.db` is created in the server directory when the application first runs. The database is automatically initialized with the proper schema and sample data.
