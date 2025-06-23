import { Link, BrowserRouter, Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';

// Home Page Component
function Home() {
    return (
        <div className="ticketing-home-container">
            <header className="ticketing-home-header">
                <h1>Welcome to Ticketing App</h1>
                <p>Your one-stop destination for booking movie tickets</p>
            </header>

            <section className="ticketing-featured-movies">
                <h2>Featured Movies</h2>
                <div className="ticketing-movie-grid">
                    <div className="ticketing-movie-card">
                        <img src="./avengers.jpg" alt="Avengers Endgame" width={175} />
                        <h3>Avengers Endgame</h3>
                    </div>
                </div>
            </section>
        </div>
    );
}

// Movies Page Component
function Movies() {
    const navigate = useNavigate();

    const handleMovieClick = () => {
        const selectedLocation = document.getElementById('lc').value;
        navigate(`/Theatres?location=${selectedLocation}&movie=Avengers Endgame`);
    };

    return (
        <div className="ticketing-home-container">
            <section className="ticketing-featured-movies">
                <h2>Featured Movies</h2>
                <div className="ticketing-movie-grid">
                    <div className="ticketing-movie-card" onClick={handleMovieClick} style={{ cursor: 'pointer' }}>
                        <img src="./avengers.jpg" alt="Avengers Endgame" width={175} />
                        <h3>Avengers Endgame</h3>
                    </div>
                </div>
            </section>
        </div>
    );
}

// Theatres Page Component with Time Slots
function Theatres() {
    const location = useLocation();
    const navigate = useNavigate();
    const params = new URLSearchParams(location.search);
    const selectedLocation = params.get('location');
    const selectedMovie = params.get('movie');

    const theatreData = {
        Hyderabad: ["INOX GVK One", "PVR Panjagutta", "Asian M Cube Mall"],
        Hanamkonda: ["INOX Warangal Central", "Asian Hanamkonda"],
        Warangal: ["Asian Multiplex Warangal", "INOX Warangal Mall"],
        Karimnagar: ["INOX Karimnagar Mall", "Asian Karimnagar"]
    };

    const theatres = theatreData[selectedLocation] || [];

    const handleTimeSlotClick = (theatre, timeSlot) => {
        if (window.confirm(`Do you want to book seats for ${selectedMovie} at ${theatre} for ${timeSlot}?`)) {
            navigate(`/SeatLayout?location=${selectedLocation}&movie=${selectedMovie}&theatre=${theatre}&time=${encodeURIComponent(timeSlot)}`);
        }
    };

    return (
        <div className="ticketing-theatres-container">
            <h2>{selectedMovie} - Theatres in {selectedLocation}</h2>
            <img src="./avengers.jpg" alt={selectedMovie} width={300} className="ticketing-movie-image" />
            {theatres.length > 0 ? (
                <ul className="theatre-list">
                    {theatres.map((theatre, index) => (
                        <li key={index} className="theatre-item">
                            <div>{theatre}</div>
                            <div className="time-slot-section">
                                <button className="time-slot-button" onClick={() => handleTimeSlotClick(theatre, '3:00 PM')}>3:00 PM</button>
                                <button className="time-slot-button" onClick={() => handleTimeSlotClick(theatre, '7:30 PM')}>7:30 PM</button>
                            </div>
                        </li>
                    ))}
                </ul>
            ) : (
                <p>No theatres found for this location.</p>
            )}
        </div>
    );
}

// Seat Layout Component
function SeatLayout() {
    const location = useLocation();
    const params = new URLSearchParams(location.search);
    const selectedLocation = params.get('location');
    const selectedMovie = params.get('movie');
    const selectedTheatre = params.get('theatre');
    const selectedTime = params.get('time');
    const navigate = useNavigate();

    const [selectedSeats, setSelectedSeats] = useState([]);
    const [user, setUser] = useState({});

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            setUser(JSON.parse(storedUser));
        }
    }, []);

    const rows = ['A', 'B', 'C', 'D', 'E', 'F'];

    const toggleSeat = (seat) => {
        setSelectedSeats(prev =>
            prev.includes(seat) ? prev.filter(s => s !== seat) : [...prev, seat]
        );
    };

   
    const confirmBooking = async () => {
        if (selectedSeats.length === 0) {
            alert('Please select at least one seat.');
            return;
        }

        if (window.confirm(`Confirm booking for ${selectedSeats.join(', ')}?`)) {
            const bookingData = {
                user_id: user.id, //  Ensure the ID is present in localStorage user
                name: user.name,
                email: user.email,
                phone: user.phone,
                location: selectedLocation,
                movie: selectedMovie,
                theatre: selectedTheatre,
                time: selectedTime,
                seats: selectedSeats
            };

            try {
                const response = await fetch('http://localhost:4000/bookings', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(bookingData)
                });

                const result = await response.text();
                alert(result);
                navigate('/MyBookings');
            } catch (error) {
                console.error('Booking failed', error);
                alert('Booking failed. Please try again.');
            }
        }
    };

    return (
        <div className="ticketing-seatlayout-container">
            <h2>Seat Selection for {selectedMovie} at {selectedTheatre} ({selectedTime})</h2>
            <div className="seat-layout">
                {rows.map(row => (
                    <div key={row} className="seat-row">
                        {Array.from({ length: 10 }, (_, i) => {
                            const seat = `${row}${i + 1}`;
                            return (
                                <button
                                    key={seat}
                                    onClick={() => toggleSeat(seat)}
                                    className={selectedSeats.includes(seat) ? 'seat selected' : 'seat'}
                                >
                                    {seat}
                                </button>
                            );
                        })}
                    </div>
                ))}
            </div>
            <button onClick={confirmBooking} className="confirm-booking-button">Confirm Booking</button>
        </div>
    );
}


// My Account Page
function Myacc() {
    const [user, setUser] = useState({});

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            setUser(JSON.parse(storedUser));
        }
    }, []);

    return (
        <div className="my-account-container">
            <div className="my-account-title">My Account</div>
            <div className="account-detail">Name: {user.name}</div>
            <div className="account-detail">Email: {user.email}</div>
            <div className="account-detail">Mobile Number: {user.phone}</div>
            <div className="account-detail">Address: {user.location}</div>
        </div>
    );
}

// My Bookings Page
function MyBookings() {
    const [user, setUser] = useState({});
    const [bookings, setBookings] = useState([]);

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            const parsedUser = JSON.parse(storedUser);
            setUser(parsedUser);
            fetchBookings(parsedUser.id);
        }
    }, []);

    const fetchBookings = async (userId) => {
        try {
            const response = await fetch(`http://localhost:4000/mybookings/${userId}`);
            const result = await response.json();
            setBookings(result);
        } catch (error) {
            console.error("Error fetching bookings:", error);
        }
    };

    return (
        <div >
            

            <h3>Your Bookings:</h3>
            {bookings.length > 0 ? (
                <ol>
                    {bookings.map((booking, index) => (
                        <li >
                            <div>Movie Name: {booking.movie}</div>
                            <div>Theatre: {booking.theatre}</div>
                            <div>Seat Numbers: {booking.seat_number}</div>
                            <div>Time: {booking.time}</div>
                            <hr />
                        </li>
                    ))}
                </ol>
            ) : (
                <p>No bookings found.</p>
            )}
        </div>
    );
}
// Login Component
function Login() {
    const [email, setEmail] = useState("");
    const [password, setPass] = useState("");
    const [msg, setMessage] = useState('');
    const navigate = useNavigate();

    const getDetails = async (event) => {
        event.preventDefault();
        const sdata = { email, password };

        try {
            const response = await fetch("http://localhost:4000/login", {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(sdata)
            });

            const result = await response.json();

            if (result.message === "Login successful!") {
                setMessage("Login Successful! Redirecting...");
                localStorage.setItem('user', JSON.stringify(result.user));
                setTimeout(() => {
                    navigate('/Movies');
                }, 2000);
            } else {
                setMessage(result.message);
            }
        } catch (error) {
            console.error("Error:", error);
            setMessage("Something went wrong. Please try again later.");
        }
    }

    return (
        <div className='register-container'>
            <h2>Login</h2>
            <form className='register-form' onSubmit={getDetails}>
                Email: <input type='email' required onChange={(e) => setEmail(e.target.value)} /><br />
                Password: <input type='password' required onChange={(e) => setPass(e.target.value)} /><br />
                <input type='submit' value='Login' />
            </form>
            {msg && <div className="success-message">{msg}</div>}
        </div>
    );
}

// Register Component
function Register() {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [phone, setPhone] = useState("");
    const [location, setLocation] = useState("");
    const [password, setPass] = useState("");
    const [msg, setMessage] = useState('');
    const navigate = useNavigate();

    const getDetails = async (event) => {
        event.preventDefault();
        const sdata = { name, email, phone, password, location };

        try {
            const response = await fetch("http://localhost:4000/register", {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(sdata)
            });

            const result = await response.text();
            setMessage(result);

            if (response.ok) {
                alert('Registration successful! Redirecting to login page...');
                navigate('/Login');
            } else {
                alert('Registration failed. Please try again.');
            }
        } catch (error) {
            console.error("Error:", error);
            alert('An error occurred. Please try again.');
        }
    }

    return (
        <div className='register-container'>
            <h2>Register</h2>
            <form className='register-form' onSubmit={getDetails}>
                Name <input type='text' required onChange={(e) => setName(e.target.value)} /><br />
                Email <input type="email" required onChange={(e) => setEmail(e.target.value)} /><br />
                Mobile number <input type="text" required onChange={(e) => setPhone(e.target.value)} /><br />
                Set password <input type='password' required onChange={(e) => setPass(e.target.value)} /><br />
                Address <input type="text" required onChange={(e) => setLocation(e.target.value)} /><br />
                <input type="submit" value='Register' />
            </form>
            {msg && <div className="success-message">{msg}</div>}
        </div>
    )
}

function Navbar() {
    const handleLocationChange = (e) => {
        localStorage.setItem('selectedLocation', e.target.value);
    }

    return (
        <div>
            <div className='home'>
                <div><img src='./logo22.png' alt='logo' width={100} /></div>

                <Link to="/" className="nav-button">Home</Link>
                <Link to="/Myacc" className="nav-button">My Account</Link>
                <Link to="/Movies" className="nav-button">Movies</Link>
                <Link to="/MyBookings" className="nav-button">My Bookings</Link>
                <Link to="/Login" className="nav-button">Login</Link>
                <Link to="/Register" className="nav-button">Register</Link>

                <form>
                    <label htmlFor="location">Choose your location:</label>
                    <select name="lc" id="lc" onChange={handleLocationChange}>
                        <option value="Hyderabad">Hyderabad</option>
                        <option value="Hanamkonda">Hanamkonda</option>
                        <option value="Warangal">Warangal</option>
                        <option value="Karimnagar">Karimnagar</option>
                    </select>
                </form>
            </div>

            <Routes>
                <Route path='/' element={<Home />} />
                <Route path='/Myacc' element={<Myacc />} />
                <Route path='/Movies' element={<Movies />} />
                <Route path='/MyBookings' element={<MyBookings />} />
                <Route path='/Login' element={<Login />} />
                <Route path='/Register' element={<Register />} />
                <Route path='/Theatres' element={<Theatres />} />
                <Route path='/SeatLayout' element={<SeatLayout />} />
            </Routes>
        </div>
    )
}

// Navigation Bar and Routing
function NaviBar() {
    return (
        <BrowserRouter>
            <Navbar />
        </BrowserRouter>
    );
}

export default NaviBar;
