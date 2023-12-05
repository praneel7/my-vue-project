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
            res.status(400).send('User not found');
        }
        
        const isMatch = await bcrypt.compare(req.body.password, user.hashedPassword);
        if (!isMatch) {
            res.status(400).send('Invalid credentials');
        }

        res.status(200).send({
            "isValid": true,
            "currentUser": user
        });
    } catch (error) {
        res.status(500).send('Error logging in');
    }
});

// Logout Endpoint
app.post('/logout', (req, res) => {
    req.session.destroy();
    res.send('Logged out successfully');
});

// Endpoint to Check Session
app.get('/session', (req, res) => {
    if (req.session.user) {
        res.send({ loggedIn: true, user: req.session.user });
    } else {
        res.send({ loggedIn: false });
    }
});

// Add Watchlist Endpoint
app.post('/watchlist', async (req, res) => {
    // ... Logic to add to watchlist
});

// Get Watchlist Endpoint
app.get('/watchlist', async (req, res) => {
    // ... Logic to retrieve user's watchlist
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