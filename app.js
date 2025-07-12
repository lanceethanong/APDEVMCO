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
    eq: (a, b) => a === b,
    statusClass: function (status) {
      switch (status) {
        case 'Cancelled': return 'red';
        case 'Completed': return 'green';
        case 'In Progress': return 'yellow';
        case 'Scheduled': return 'blue';
        default: return '';
      }
    }
  }
});
app.engine('hbs', hbs.engine);
app.set('view engine', 'hbs');

//route for home page
app.get('/', (req, res) => {
  res.render('handlebars/home', {
    title: 'Home Page',
    layout: 'homeLayout',
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

//route for register
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
    const existingUsername = await User.findOne({ username });
    if (existingUsername) {
      return res.render('handlebars/register', {
        layout: 'login-signupLayout',
        title: 'Register',
        page: 'register',
        registerError: 'Username already taken.'
      });
    }
    if (password.length < 8) {
  return res.render('handlebars/register', {
    layout: 'login-signupLayout',
    title: 'Register',
    page: 'register',
    registerError: 'Password must be at least 8 characters long.'
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
      ? `/dashboard/technician?username=${encodeURIComponent(username)}}`
      : `/dashboard/student?username=${encodeURIComponent(username)}}`;

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

//route for dashboard student
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

//route for dashboard technician
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


app.get('/dashboard/:role/lab/:labNumber', (req, res) => {
  const { role, labNumber } = req.params;
  const username = req.query.username || 'Guest';

  res.render('handlebars/dashboard', {
    title: `${role} Dashboard`,
    layout: 'dashboard-Layout',
    username,
    role: role === 'technician' ? 'Lab Technician' : 'Student',
    rooms: [], // labs will be fetched dynamically in frontend
    selectedLabNumber: labNumber
  });
});

//route for tech help
app.get('/dashboard/technician/help', (req, res) => {
  const { username } = req.query;

  res.render('handlebars/help', {
    layout: 'homeLayout',
    title: 'Help & Support',
    username,
    role: 'Lab Technician'
  });
});

//route for student help
app.get('/dashboard/student/help', (req, res) => {
  const { username } = req.query;

  res.render('handlebars/help', {
    layout: 'homeLayout',
    title: 'Help & Support',
    username,
    role: 'Student'
  });
});


// In your app.js, update the profile routes to ensure username is passed:

// Technician profile route
app.get(['/dashboard/technician/profile', '/dashboard/Lab%20Technician/profile'], async (req, res) => {
  const username = req.query.username;
  //debugging
  /*
  console.log('Technician profile - username from query:', username);
  */
  
  try {
    const user = await User.findOne({ username, role: 'Lab Technician' });
    if (!user) {
      return res.status(404).send('Technician not found');
    }
    
    res.render('handlebars/profile', {
      title: 'Technician Profile',
      layout: 'profile-Layout',
      username: user.username, // Use from user object
      role: user.role,
      description: user.description || ''
    });
  } catch (error) {
    console.error('Technician profile error:', error);
    res.status(500).send('Server error');
  }
});

// Student profile route
app.get('/dashboard/student/profile', async (req, res) => {
  const username = req.query.username;

  try {
    const student = await User.findOne({ username, role: 'Student' });
    if (!student) {
      return res.status(404).send('Student not found');
    }

    const getShowDelete = (resv) => {
      if (!resv || !resv.time_start || !resv.date) return false;
      const [sh, sm] = resv.time_start.split(':').map(Number);
      const start = new Date(resv.date);
      start.setHours(sh, sm, 0, 0);
      const now = new Date();
      return start - now <= 10 * 60 * 1000;
    };

    const now = new Date();
    const getStatus = (resv) => {
      const [sh, sm] = resv.time_start.split(':').map(Number);
      const [eh, em] = resv.time_end.split(':').map(Number);
      const start = new Date(resv.date);
      const end = new Date(resv.date);
      start.setHours(sh, sm);
      end.setHours(eh, em);
      if (resv.status === 'Cancelled') return 'Cancelled';
      if (now < start) return 'Scheduled';
      if (now >= start && now <= end) return 'In Progress';
      return 'Completed';
    };

    // Fetch student and tech reservations
    const [studentSeats, techSeats] = await Promise.all([
      SeatList.find().populate({
        path: 'reservation',
        populate: [
          { path: 'user', select: 'username' },
          { path: 'lab', select: 'class number' }
        ]
      }).lean(),
      TechSeatList.find().populate({
        path: 'reservation',
        populate: [
          { path: 'student', select: 'username' },
          { path: 'lab', select: 'class number' }
        ]
      }).lean()
    ]);

    const allReservations = [];

    // Regular reservations
    for (const seat of studentSeats) {
      const r = seat.reservation;
      if (!r || !r.user || r.user.username !== username) continue;

      allReservations.push({
        row: seat.row,
        column: seat.column,
        lab: `Lab ${r.lab.number} (${r.lab.class})`,
        time_start: r.time_start,
        time_end: r.time_end,
        date: r.date.toISOString().split('T')[0],
        createdAt: r.createdAt.toLocaleString(),
        status: getStatus(r),
        showDelete: getShowDelete(r)
      });
    }

    // Tech-made reservations
    for (const seat of techSeats) {
      const r = seat.reservation;
      if (!r || !r.student || r.student.username !== username) continue;

      allReservations.push({
        row: seat.row,
        column: seat.column,
        lab: `Lab ${r.lab.number} (${r.lab.class})`,
        time_start: r.time_start,
        time_end: r.time_end,
        date: r.date.toISOString().split('T')[0],
        createdAt: r.createdAt.toLocaleString(),
        status: getStatus(r),
        showDelete: getShowDelete(r)
      });
    }

    // Sort and separate
    allReservations.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    const pastReservations = allReservations.filter(r => ['Completed', 'Cancelled'].includes(r.status));
    const upcomingReservations = allReservations.filter(r => !['Completed', 'Cancelled'].includes(r.status));

    res.render('handlebars/profile', {
      title: 'Student Profile',
      layout: 'profile-Layout',
      username,
      role: student.role,
      description: student.description || '',
      upcomingReservations,
      pastReservations
    });
  } catch (error) {
    console.error('Student profile error:', error);
    res.status(500).send('Server error');
  }
});

app.get('/dashboard/technician/reservation-list', async (req, res) => {
  const { username } = req.query;

  try {
    const technician = await User.findOne({ username, role: 'Lab Technician' });
    if (!technician) {
      return res.status(403).send('Unauthorized access');
    }

    
    const getShowDelete = (resv) => {
      if (!resv || !resv.time_start || !resv.date) return false;

      const [sh, sm] = resv.time_start.split(':').map(Number);
      const start = new Date(resv.date);
      start.setHours(sh, sm, 0, 0);

      const now = new Date();
      const diffMs = start - now;

      return diffMs <= 10 * 60 * 1000; // 10 minutes
    };

    const [studentSeats, techSeats] = await Promise.all([
      SeatList.find().populate({
        path: 'reservation',
        populate: [
          { path: 'user', select: 'username' },
          { path: 'lab', select: 'class number' }
        ]
      }).lean(),
      TechSeatList.find().populate({
        path: 'reservation',
        populate: [
          { path: 'student', select: 'username' },
          { path: 'lab', select: 'class number' }
        ]
      }).lean()
    ]);

    const isPast = new Date(r.date) < new Date();
    const now = new Date();

    const getStatus = (resv) => {
      const [sh, sm] = resv.time_start.split(':').map(Number);
      const [eh, em] = resv.time_end.split(':').map(Number);
      const start = new Date(resv.date);
      const end = new Date(resv.date);
      start.setHours(sh, sm);
      end.setHours(eh, em);

      if (resv.status === 'Cancelled') return 'Cancelled';
      if (now < start) return 'Scheduled';
      if (now >= start && now <= end) return 'In Progress';
      return 'Completed';
    };

    const combined = [];

    for (const seat of studentSeats) {
      const r = seat.reservation;
      if (!r || !r.user || !r.lab) continue;

      combined.push({
        _id: r._id,
        row: seat.row,
        column: seat.column,
        student: r.user.username,
        lab: `Lab ${r.lab.number} (${r.lab.class})`,
        time_start: r.time_start,
        time_end: r.time_end,
        date: r.date.toISOString().split('T')[0],
        createdAt: r.createdAt.toLocaleString(),
        status: getStatus(r),
        showDelete: getShowDelete(r),
        type: 'student',
        isPast
      });
    }

    for (const seat of techSeats) {
      const r = seat.reservation;
      if (!r || !r.student || !r.lab) continue;

      combined.push({
        _id: r._id,
        row: seat.row,
        column: seat.column,
        student: r.student.username,
        lab: `Lab ${r.lab.number} (${r.lab.class})`,
        time_start: r.time_start,
        time_end: r.time_end,
        date: r.date.toISOString().split('T')[0],
        createdAt: r.createdAt.toLocaleString(),
        status: getStatus(r),
        showDelete: getShowDelete(r),
        type: 'technician',
        isPast
      });
    }

    combined.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    res.render('handlebars/reservation', {
      title: 'All Reservations',
      layout: 'dashboard-Layout',
      username,
      role: 'Lab Technician',
      reservations: combined
    });

  } catch (err) {
    console.error('Failed to load reservation list:', err);
    res.status(500).send('Server error loading reservation list.');
  }
});

// View profile route (read-only)
app.get('/dashboard/view-profile/:username', async (req, res) => {
  const { username } = req.params;
  const currentUsername = req.query.username;
  const decodedUsername = decodeURIComponent(username);

  try {
    // Get both users' data
    const [currentUser, viewedUser] = await Promise.all([
      User.findOne({ username: currentUsername }),
      User.findOne({ username: decodedUsername })
    ]);

    if (!currentUser || !viewedUser) {
      return res.status(404).send('User not found');
    }

    // Redirect to regular profile if viewing own profile
    if (currentUser.username === viewedUser.username) {
      return res.redirect(`/dashboard/${currentUser.role.toLowerCase()}/profile?username=${encodeURIComponent(currentUsername)}`);
    }

    // Fetch reservations if viewing a student profile as a technician
    let upcomingReservations = [];
    let pastReservations = [];
    
    if (currentUser.role === 'Lab Technician' && viewedUser.role === 'Student') {
      const getStatus = (resv) => {
        if (!resv || !resv.time_start || !resv.date) return 'Unknown';
        const [sh, sm] = resv.time_start.split(':').map(Number);
        const [eh, em] = resv.time_end.split(':').map(Number);
        const start = new Date(resv.date);
        const end = new Date(resv.date);
        start.setHours(sh, sm);
        end.setHours(eh, em);
        const now = new Date();
        
        if (resv.status === 'Cancelled') return 'Cancelled';
        if (now < start) return 'Scheduled';
        if (now >= start && now <= end) return 'In Progress';
        return 'Completed';
      };

      const [studentSeats, techSeats] = await Promise.all([
        SeatList.find().populate({
          path: 'reservation',
          populate: [
            { path: 'user', select: 'username' },
            { path: 'lab', select: 'class number' }
          ]
        }).lean(),
        TechSeatList.find().populate({
          path: 'reservation',
          populate: [
            { path: 'student', select: 'username' },
            { path: 'lab', select: 'class number' }
          ]
        }).lean()
      ]);

      const allReservations = [];

      // Regular reservations
      for (const seat of studentSeats) {
        const r = seat.reservation;
        if (!r || !r.user || r.user.username !== viewedUser.username) continue;

        allReservations.push({
          _id: r._id,
          row: seat.row,
          column: seat.column,
          lab: `Lab ${r.lab.number} (${r.lab.class})`,
          time_start: r.time_start,
          time_end: r.time_end,
          date: r.date.toISOString().split('T')[0],
          status: getStatus(r),
          type: 'student'
        });
      }

      // Tech-made reservations
      for (const seat of techSeats) {
        const r = seat.reservation;
        if (!r || !r.student || r.student.username !== viewedUser.username) continue;

        allReservations.push({
          _id: r._id,
          row: seat.row,
          column: seat.column,
          lab: `Lab ${r.lab.number} (${r.lab.class})`,
          time_start: r.time_start,
          time_end: r.time_end,
          date: r.date.toISOString().split('T')[0],
          status: getStatus(r),
          type: 'technician'
        });
      }

      // Sort and separate
      allReservations.sort((a, b) => new Date(b.date) - new Date(a.date));
      pastReservations = allReservations.filter(r => ['Completed', 'Cancelled'].includes(r.status));
      upcomingReservations = allReservations.filter(r => !['Completed', 'Cancelled'].includes(r.status));
    }

    res.render('handlebars/viewprofile', {
      title: `${viewedUser.username}'s Profile`,
      layout: 'dashboard-Layout',
      username: currentUser.username, // Current user's username for the header
      role: currentUser.role,        // Current user's role for the header
      currentUser: {
        username: currentUser.username,
        role: currentUser.role
      },
      viewedUser: {
        username: viewedUser.username,
        role: viewedUser.role,
        description: viewedUser.description || ''
      },
      upcomingReservations,
      pastReservations
    });

  } catch (error) {
    console.error('View profile error:', error);
    res.status(500).send('Server error');
  }
});
// REST API Routes


// Add this to your API routes in app.js
app.delete('/api/users/:username', async (req, res) => {
  try {
    const { username } = req.params;
    const decodedUsername = decodeURIComponent(username);

    const user = await User.findOne({ username: decodedUsername });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Rest of your delete logic...
    await User.deleteOne({ username: decodedUsername });
    res.json({ success: true, message: 'Account deleted successfully' });
  } catch (error) {
    console.error('Delete account error:', error);
    res.status(500).json({ error: 'Failed to delete account' });
  }
});

// Update the password change endpoint
app.post('/api/users/:username/change-password', async (req, res) => {
  try {
    const { username } = req.params;
    const decodedUsername = decodeURIComponent(username);
    const { currentPassword, newPassword } = req.body;

    const user = await User.findOne({ username: decodedUsername });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (user.password !== currentPassword) {
      return res.status(401).json({ error: 'Current password is incorrect' });
    }

    user.password = newPassword;
    await user.save();

    res.json({ success: true, message: 'Password updated successfully' });
  } catch (error) {
    console.error('Password change error:', error);
    res.status(500).json({ error: 'Failed to change password' });
  }
});

// Update the profile update endpoint
app.put('/api/users/:username', async (req, res) => {
  try {
    const { username } = req.params;
    const decodedUsername = decodeURIComponent(username);
    const { description } = req.body;

    const user = await User.findOneAndUpdate(
      { username: decodedUsername },
      { description },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ success: true, user });
  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

//search api
app.get('/api/users/search/:query', async (req, res) => {
  try {
    const { query } = req.params;
    const decodedQuery = decodeURIComponent(query);
    
    // Search by username or email (case insensitive)
    const users = await User.find({
      $or: [
        { username: { $regex: decodedQuery, $options: 'i' } },
        { email: { $regex: decodedQuery, $options: 'i' } }
      ]
    }).select('-password');

    res.json(users);
  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({ error: 'Failed to perform search' });
  }
});

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