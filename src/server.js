const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const session = require('express-session');
const bcrypt = require('bcrypt');
const cors = require('cors');
const User = require('../models/User'); // Adjust the path according to your project structure

require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;


mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
    .then(() => console.log('MongoDB connected'))
    .catch(err => console.error('MongoDB connection error:', err));


// Middlewares
app.use(cors());
app.use(express.json());
app.use(session({
    secret: 'your-secret-key',
    resave: false,
    saveUninitialized: true,
}));

// Registration Endpoint
app.post('/register', async (req, res) => {

    try {
        const { username, password } = req.body;

        // Check if the user already exists
        const existingUser = await User.findOne({ username });
        if (existingUser) {
            return res.status(400).send('Username already exists');
        }

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create a new user
        const user = new User({
            username,
            hashedPassword
        });

        // Save the user to the database
        await user.save();

        res.status(201).send('User registered successfully');
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).send('Error in registering user');
    }
});

// Login Endpoint
app.post('/login', async (req, res) => {
    try {
        const user = await User.findOne({ username: req.body.username });
        if (!user) {
            return res.status(400).send('User not found');
        }
        
        const isMatch = await bcrypt.compare(req.body.password, user.hashedPassword);
        if (!isMatch) {
            return res.status(400).send('Invalid credentials');
        }

        // Note: Be careful about sending the entire user object, it might contain sensitive information
        req.session.user = { id: user._id, username: user.username }; // Example session data
        res.status(200).send({
            "isValid": true,
            "currentUser": { username: user.username, id: user._id } // only non-sensitive data
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).send('Error logging in');
    }
});


// Logout Endpoint
app.post('/logout', (req, res) => {
    if (req.session) {
        req.session.destroy((err) => {
            if (err) {
                console.error('Session destruction error:', err);
                return res.status(500).send('Error logging out');
            }
            res.send('Logged out successfully');
        });
    } else {
        res.send('No active session to logout from');
    }
});

// Endpoint to Check Session
app.get('/session', (req, res) => {
    if (req.session.user) {
        res.send({ loggedIn: true, user: req.session.user });
    } else {
        res.send({ loggedIn: false });
    }
});

// Add to Watchlist Endpoint
app.post('/watchlist', async (req, res) => {
    try {
        const { username, anime } = req.body;
        const user = await User.findOne({ username });

        if (!user) {
            return res.status(404).send('User not found');
        }

        // Check if the anime is already in the watchlist
        if (user.watchList.some(item => item.title === anime.title)) {
            return res.status(400).send('Anime already in watchlist');
        }

        user.watchList.push(anime);
        await user.save();

        res.status(200).send('Anime added to watchlist');
    } catch (error) {
        console.error('Error updating watchlist:', error);
        res.status(500).send('Error updating watchlist');
    }
});


// Get Watchlist Endpoint
app.get('/watchlist', async (req, res) => {
    try {
        const { username } = req.query; // assuming username is passed as a query parameter
        const user = await User.findOne({ username });

        if (!user) {
            return res.status(404).send('User not found');
        }

        res.status(200).json(user.watchList);
    } catch (error) {
        console.error('Error retrieving watchlist:', error);
        res.status(500).send('Error retrieving watchlist');
    }
});
// Remove from Watchlist
app.post('/watchlist/remove', async (req, res) => {
    try {
        const { username, animeTitle } = req.body;
        const user = await User.findOne({ username });

        if (!user) {
            return res.status(404).send('User not found');
        }

        user.watchList = user.watchList.filter(item => item.title !== animeTitle);
        await user.save();

        res.status(200).send('Anime removed from watchlist');
    } catch (error) {
        console.error('Error removing from watchlist:', error);
        res.status(500).send('Error removing from watchlist');
    }
});


// Add Friend Endpoint
app.post('/friends', async (req, res) => {
    // ... Logic to add a friend
});

// Get Friends List Endpoint
app.get('/friends', async (req, res) => {
    // ... Logic to retrieve friends list
});


app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});