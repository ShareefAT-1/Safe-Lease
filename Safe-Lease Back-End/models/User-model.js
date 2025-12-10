const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },

  email: {
    type: String,
    required: true,
    unique: true,
  },

  password: {
    type: String,
    required: true,
  },

  phone: {
    type: String,
    required: function () {
      return this.role !== 'landlord' && this.role !== 'tenant';
    },
  },

  role: {
    type: String,
    enum: ['admin', 'user', 'landlord', 'tenant'],
    default: 'user',
  },

  profilePic: {
    type: String,
    default: 'https://preview.redd.it/cool-pfp-type-fanart-i-made-v0-000ob270kp7e1.png?width=640&crop=smart&auto=webp&s=0e399d56fac07442153386515fbb7a9bffff4c8c', // Optional: you can add a default avatar URL here if needed
  },
  
  bio: {
    type: String,
    default: "",
  },

}, {
  timestamps: true,
});

module.exports = mongoose.model('User', userSchema);
