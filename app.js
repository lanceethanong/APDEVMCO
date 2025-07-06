const express = require('express'); 
const exphbs = require('express-handlebars'); 
const path = require('path'); 
const mongoose = require('mongoose');

const app = express(); 
const port = 3000; 
const connectDB = require('./model/db');
// Middleware
app.use(express.urlencoded({ extended: true })); 
app.use(express.json()); // Added for API routes
app.use(express.static(path.join(__dirname, 'public'))); 

// Import models
const User = require('./model/user');
const Lab = require('./model/lab');
const Reservation = require('./model/reservation');
const TechReservation = require('./model/tech_reservation');
const SeatList = require('./model/seat_list');
const TechSeatList = require('./model/tech_seat_list');

const hbs = exphbs.create({
  extname: '.hbs',
  layoutsDir: path.join(__dirname, 'views/layouts'),
  partialsDir: path.join(__dirname, 'views/partials'),
  helpers: {
    eq: (a, b) => a === b
  }
});

app.engine('hbs', hbs.engine);
app.set('view engine', 'hbs');

//route for home page
app.get('/', (req, res) => {
  res.render('handlebars/home', {
    title: 'Home Page',
    layout: 'homeLayout',
    user: { username: 'Richard' }
  });
});

//route for login
app.get('/login', (req, res) => {
  res.render('handlebars/login', {
    title: 'Login',
    layout: 'login-signupLayout',
    page: 'login'
  });
});


app.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });

    if (!user || user.password !== password) {
      return res.status(401).render('handlebars/login', {
        layout: 'login-signupLayout',
        title: 'Login',
        page: 'login',
        loginError: 'Invalid email or password.'
      });
    }

    const role = user.role;
    const username = user.username;
    // Match exact role strings
    let redirectURL;
    if (role === 'Lab Technician') {
      redirectURL = `/dashboard/technician?username=${encodeURIComponent(username)}`;
    } 
    else if (role === 'Student') {
      redirectURL = `/dashboard/student?username=${encodeURIComponent(username)}`;
    } 
    return res.redirect(redirectURL);

  } catch (err) {
    console.error('Login failed:', err);
    return res.status(500).render('handlebars/login', {
      layout: 'login-signupLayout',
      title: 'Login',
      page: 'login',
      loginError: 'Server error. Please try again.'
    });
  }
});

app.get('/register', (req, res) => {
  res.render('handlebars/register', {
    title: 'Register',
    layout: 'login-signupLayout',
    page: 'register'
  });
});

app.post('/register', async (req, res) => {
  const { username, email, password, confirmPassword, role } = req.body;

  // Ensure passwords match
  if (password !== confirmPassword) {
    return res.render('handlebars/register', {
      layout: 'login-signupLayout',
      title: 'Register',
      page: 'register',
      registerError: 'Passwords do not match.'
    });
  }

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.render('handlebars/register', {
        layout: 'login-signupLayout',
        title: 'Register',
        page: 'register',
        registerError: 'Email already in use.'
      });
    }

    // Normalize role input
    const normalizedRole = role === 'lab_technician' ? 'Lab Technician' : 'Student';

    const newUser = new User({
      username,
      email,
      password,
      role: normalizedRole,
      description: '',
      picture: 'picture.jpg',
      remember: false
    });

    await newUser.save();
    console.log('New user registered:', newUser);

    // Redirect based on role
    const redirectURL = normalizedRole === 'Lab Technician'
      ? `/dashboard/technician?username=${encodeURIComponent(username)}&role=${encodeURIComponent(normalizedRole)}`
      : `/dashboard/student?username=${encodeURIComponent(username)}&role=${encodeURIComponent(normalizedRole)}`;

    res.redirect(redirectURL);

  } catch (err) {
    console.error('Registration error:', err);
    res.status(500).render('handlebars/register', {
      layout: 'login-signupLayout',
      title: 'Register',
      page: 'register',
      registerError: 'Something went wrong. Please try again.'
    });
  }
});

app.get('/dashboard/student', (req, res) => {
  const username = req.query.username || 'Student';
  const role = req.query.role || 'Student';

  res.render('handlebars/dashboard', {
    title: 'Student Dashboard',
    layout: 'dashboard-Layout',
    username,
    role,
    rooms: [],
  });
});

app.get('/dashboard/technician', (req, res) => {
  const username = req.query.username || 'Lab Technician';
  const role = req.query.role || 'Lab Technician';

  res.render('handlebars/dashboard', {
    title: 'Technician Dashboard',
    layout: 'dashboard-Layout',
    username,
    role,
    rooms: [],
  });
});


app.get('/dashboard/help', (req, res) => {
  const { username, role } = req.query;

  res.render('handlebars/help', {
    layout: 'homeLayout', // Or whatever layout you're using that includes header/footer
    title: 'Help & Support',
    username,
    role
  });
});

// Profile routes
app.get('/dashboard/student/profile', (req, res) => {
  res.sendFile(path.join(__dirname, 'views/html/profile.html'));
});

app.get('/dashboard/technician/profile', (req, res) => {
  res.sendFile(path.join(__dirname, 'views/html/profile-technician.html'));
});



// REST API Routes

// Labs API
app.get('/api/labs', async (req, res) => {
  try {
    const labs = await Lab.find();
    res.json(labs);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/labs/:id', async (req, res) => {
  try {
    const lab = await Lab.findById(req.params.id);
    if (!lab) {
      return res.status(404).json({ error: 'Lab not found' });
    }
    res.json(lab);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/labs', async (req, res) => {
  try {
    const lab = new Lab(req.body);
    await lab.save();
    res.status(201).json(lab);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Users API
app.get('/api/users', async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/users/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/users', async (req, res) => {
  try {
    const user = new User(req.body);
    await user.save();
    const userResponse = user.toObject();
    delete userResponse.password;
    res.status(201).json(userResponse);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Student Reservations API
app.get('/api/reservations', async (req, res) => {
  try {
    const reservations = await Reservation.find()
      .populate('user', 'firstName lastName email')
      .populate('lab', 'class number');
    res.json(reservations);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/reservations/:id', async (req, res) => {
  try {
    const reservation = await Reservation.findById(req.params.id)
      .populate('user', 'firstName lastName email')
      .populate('lab', 'class number');
    if (!reservation) {
      return res.status(404).json({ error: 'Reservation not found' });
    }
    res.json(reservation);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/reservations', async (req, res) => {
  const session = await mongoose.startSession();
  
  try {
    await session.withTransaction(async () => {
      const { time_start, time_end, user, lab, date, anonymity, seats } = req.body;
      
      // Create reservation
      const reservation = new Reservation({
        time_start,
        time_end,
        user,
        lab,
        date,
        anonymity
      });
      
      await reservation.save({ session });
      
      // Create seat assignments
      if (seats && seats.length > 0) {
        const seatDocs = seats.map(seat => ({
          reservation: reservation._id,
          row: seat.row,
          column: seat.column
        }));
        
        await SeatList.insertMany(seatDocs, { session });
      }
      
      res.status(201).json(reservation);
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  } finally {
    await session.endSession();
  }
});

app.put('/api/reservations/:id', async (req, res) => {
  try {
    const reservation = await Reservation.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('user', 'firstName lastName email')
     .populate('lab', 'class number');
    
    if (!reservation) {
      return res.status(404).json({ error: 'Reservation not found' });
    }
    
    res.json(reservation);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.delete('/api/reservations/:id', async (req, res) => {
  const session = await mongoose.startSession();
  
  try {
    await session.withTransaction(async () => {
      const reservation = await Reservation.findByIdAndDelete(req.params.id, { session });
      if (!reservation) {
        return res.status(404).json({ error: 'Reservation not found' });
      }
      
      // Delete associated seat assignments
      await SeatList.deleteMany({ reservation: req.params.id }, { session });
      
      res.json({ message: 'Reservation deleted successfully' });
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  } finally {
    await session.endSession();
  }
});

// Technician Reservations API
app.get('/api/tech-reservations', async (req, res) => {
  try {
    const reservations = await TechReservation.find()
      .populate('technician', 'username email')
      .populate('student', 'username email')
      .populate('lab', 'class number');
    res.json(reservations);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/tech-reservations', async (req, res) => {
  const session = await mongoose.startSession();
  
  try {
    await session.withTransaction(async () => {
      const { time_start, time_end, technician, lab, date, student, seats } = req.body;
      
      // Create tech reservation
      const techReservation = new TechReservation({
        time_start,
        time_end,
        technician,
        lab,
        date,
        student
      });
      
      await techReservation.save({ session });
      
      // Create seat assignments
      if (seats && seats.length > 0) {
        const seatDocs = seats.map(seat => ({
          reservation: techReservation._id,
          row: seat.row,
          column: seat.column
        }));
        
        await TechSeatList.insertMany(seatDocs, { session });
      }
      
      res.status(201).json(techReservation);
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  } finally {
    await session.endSession();
  }
});

// Seat Lists API
app.get('/api/seat-lists', async (req, res) => {
  try {
    const seatLists = await SeatList.find()
      .populate({
        path: 'reservation',
        populate: [
          { path: 'user', select: 'firstName lastName email' },
          { path: 'lab', select: 'class number' }
        ]
      });
    res.json(seatLists);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/seat-lists/reservation/:reservationId', async (req, res) => {
  try {
    const seats = await SeatList.find({ reservation: req.params.reservationId });
    res.json(seats);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/tech-seat-lists', async (req, res) => {
  try {
    const seatLists = await TechSeatList.find()
      .populate({
        path: 'reservation',
        populate: [
          { path: 'technician', select: 'firstName lastName email' },
          { path: 'student', select: 'firstName lastName email' },
          { path: 'lab', select: 'class number' }
        ]
      });
    res.json(seatLists);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/tech-seat-lists/reservation/:reservationId', async (req, res) => {
  try {
    const seats = await TechSeatList.find({ reservation: req.params.reservationId });
    res.json(seats);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get available seats for a lab at a specific time
app.get('/api/labs/:labId/available-seats', async (req, res) => {
  try {
    const { date, time_start, time_end } = req.query;
    
    // Get all reservations for this lab on this date and time
    const reservations = await Reservation.find({
      lab: req.params.labId,
      date: new Date(date),
      $or: [
        { time_start: { $lt: time_end }, time_end: { $gt: time_start } }
      ]
    });
    
    const techReservations = await TechReservation.find({
      lab: req.params.labId,
      date: new Date(date),
      $or: [
        { time_start: { $lt: time_end }, time_end: { $gt: time_start } }
      ]
    });
    
    // Get occupied seats
    const occupiedSeats = [];
    
    for (const reservation of reservations) {
      const seats = await SeatList.find({ reservation: reservation._id });
      occupiedSeats.push(...seats.map(seat => ({ row: seat.row, column: seat.column })));
    }
    
    for (const techReservation of techReservations) {
      const seats = await TechSeatList.find({ reservation: techReservation._id });
      occupiedSeats.push(...seats.map(seat => ({ row: seat.row, column: seat.column })));
    }
    
    // Assuming 7 rows and 5 columns (35 seats total)
    const totalSeats = [];
    for (let row = 1; row <= 7; row++) {
      for (let col = 1; col <= 5; col++) {
        totalSeats.push({ row, column: col });
      }
    }
    
    const availableSeats = totalSeats.filter(seat => 
      !occupiedSeats.some(occupied => 
        occupied.row === seat.row && occupied.column === seat.column
      )
    );
    
    res.json({ availableSeats, occupiedSeats });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get user's reservations
app.get('/api/users/:userId/reservations', async (req, res) => {
  try {
    const reservations = await Reservation.find({ user: req.params.userId })
      .populate('lab', 'class number')
      .sort({ date: -1, time_start: 1 });
    
    res.json(reservations);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Start server with database connection
connectDB().then(() => {
  app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
  }).on('error', err => console.log('Server startup failed:', err));
});