import React, { useState, useEffect } from 'react';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './App.css';

function App() {
  const [seats, setSeats] = useState([]);
  const [requestedSeats, setRequestedSeats] = useState(1);
  const [loading, setLoading] = useState(false);
  const [bookings, setBookings] = useState([]);

  // Fetch seats data
  const fetchSeats = async () => {
    try {
      const response = await fetch('/api/seats');
      const data = await response.json();
      setSeats(data);
    } catch (error) {
      console.error('Error fetching seats:', error);
      toast.error('Error loading seats data');
    }
  };

  // Fetch bookings
  const fetchBookings = async () => {
    try {
      const response = await fetch('/api/bookings');
      const data = await response.json();
      setBookings(data.slice(0, 10)); // Show last 10 bookings
    } catch (error) {
      console.error('Error fetching bookings:', error);
    }
  };

  // Book seats
  const bookSeats = async () => {
    if (requestedSeats < 1 || requestedSeats > 7) {
      toast.error('Please enter a number between 1 and 7');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/book', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ seats_count: requestedSeats }),
      });

      const data = await response.json();

      if (data.success) {
        toast.success(`${data.message}! Seat numbers: ${data.seat_numbers.join(', ')}`);
        fetchSeats();
        fetchBookings();
      } else {
        toast.error(data.error);
      }
    } catch (error) {
      toast.error('Error booking seats. Please try again.');
      console.error('Error booking seats:', error);
    }

    setLoading(false);
  };

  // Reset all bookings
  const resetBookings = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/reset', { method: 'POST' });
      const data = await response.json();
      toast.success(data.message);
      fetchSeats();
      fetchBookings();
    } catch (error) {
      toast.error('Error resetting bookings');
      console.error('Error resetting:', error);
    }
    setLoading(false);
  };

  // Render seat grid
  const renderSeatGrid = () => {
    const rows = [];
    let seatIndex = 0;

    // First 11 rows with 7 seats each
    for (let row = 1; row <= 11; row++) {
      const rowSeats = [];
      for (let seatInRow = 1; seatInRow <= 7; seatInRow++) {
        const seat = seats[seatIndex];
        rowSeats.push(
          <div
            key={seat?.seat_number || seatIndex}
            className={`seat ${seat?.is_booked ? 'booked' : 'available'}`}
            title={`Seat ${seat?.seat_number || seatIndex + 1} - ${seat?.is_booked ? 'Booked' : 'Available'}`}
          >
            {seat?.seat_number || seatIndex + 1}
          </div>
        );
        seatIndex++;
      }
      rows.push(
        <div key={`row-${row}`} className="seat-row">
          <div className="row-label">Row {row}</div>
          {rowSeats}
        </div>
      );
    }

    // Last row with 3 seats
    const lastRowSeats = [];
    for (let seatInRow = 1; seatInRow <= 3; seatInRow++) {
      const seat = seats[seatIndex];
      lastRowSeats.push(
        <div
          key={seat?.seat_number || seatIndex}
          className={`seat ${seat?.is_booked ? 'booked' : 'available'}`}
          title={`Seat ${seat?.seat_number || seatIndex + 1} - ${seat?.is_booked ? 'Booked' : 'Available'}`}
        >
          {seat?.seat_number || seatIndex + 1}
        </div>
      );
      seatIndex++;
    }
    rows.push(
      <div key="row-12" className="seat-row last-row">
        <div className="row-label">Row 12</div>
        {lastRowSeats}
        <div className="empty-seats">
          <div className="seat empty"></div>
          <div className="seat empty"></div>
          <div className="seat empty"></div>
          <div className="seat empty"></div>
        </div>
      </div>
    );

    return rows;
  };

  // Calculate statistics
  const totalSeats = 80;
  const bookedSeats = seats.filter(seat => seat.is_booked).length;
  const availableSeats = totalSeats - bookedSeats;

  // Dynamic styling for bookings section
  const getBookingsStyle = () => {
    const bookingCount = bookings.length;
    if (bookingCount === 0) return { minHeight: '200px' };
    if (bookingCount <= 3) return { minHeight: '300px' };
    if (bookingCount <= 6) return { minHeight: '400px' };
    if (bookingCount <= 10) return { minHeight: '500px' };
    return { minHeight: '600px', maxHeight: '80vh' };
  };

  useEffect(() => {
    fetchSeats();
    fetchBookings();
  }, []);

  return (
    <div className="App">
      <header className="App-header">
        <h1>Train Seat Booking System</h1>
        <p>Coach with 80 seats (11 rows of 7 seats + 1 row of 3 seats)</p>
      </header>

      <main className="main-content">
        <div className="booking-section">
          <div className="booking-form">
            <h2>Book Your Seats</h2>
            <div className="form-group">
              <label htmlFor="seatCount">Number of seats (1-7):</label>
              <input
                type="number"
                id="seatCount"
                min="1"
                max="7"
                value={requestedSeats}
                onChange={(e) => setRequestedSeats(parseInt(e.target.value))}
                disabled={loading}
              />
            </div>
            <button 
              onClick={bookSeats} 
              disabled={loading}
              className="book-button"
            >
              {loading ? 'Booking...' : 'Book Seats'}
            </button>
            <button 
              onClick={resetBookings} 
              disabled={loading}
              className="reset-button"
            >
              {loading ? 'Resetting...' : 'Reset All Bookings'}
            </button>
          </div>

          <div className="stats">
            <h3>Seat Statistics</h3>
            <div className="stat-item">
              <span className="stat-label">Total Seats:</span>
              <span className="stat-value">{totalSeats}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Available:</span>
              <span className="stat-value available">{availableSeats}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Booked:</span>
              <span className="stat-value booked">{bookedSeats}</span>
            </div>
          </div>
        </div>

        <div className="seat-map-section">
          <h2>Seat Map</h2>
          <div className="legend">
            <div className="legend-item">
              <div className="seat available"></div>
              <span>Available</span>
            </div>
            <div className="legend-item">
              <div className="seat booked"></div>
              <span>Booked</span>
            </div>
          </div>
          <div className="seat-map">
            {renderSeatGrid()}
          </div>
        </div>

        <div className="bookings-section" style={getBookingsStyle()}>
          <h2>Recent Bookings {bookings.length > 0 && <span className="booking-count">({bookings.length})</span>}</h2>
          <div className="bookings-list">
            {bookings.length === 0 ? (
              <div className="no-bookings">
                <p>No bookings yet</p>
                <p className="booking-hint">Book some seats to see them here!</p>
              </div>
            ) : (
              bookings.map((booking, index) => (
                <div key={booking.id} className={`booking-item ${index === 0 ? 'latest-booking' : ''}`}>
                  <span className="booking-id">{booking.booking_id}</span>
                  <span className="booking-seats">
                    {booking.seats_count} seat(s): {JSON.parse(booking.seat_numbers).join(', ')}
                  </span>
                  <span className="booking-time">
                    {new Date(booking.created_at).toLocaleString()}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </main>
      
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
    </div>
  );
}

export default App;
