const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true
  },
  hashedPassword: {
    type: String,
    required: true
  },
  watchList: [{
    title: String,
    episodes: Number
    
  }]
});

// Export the model
module.exports = mongoose.model('User', userSchema);
