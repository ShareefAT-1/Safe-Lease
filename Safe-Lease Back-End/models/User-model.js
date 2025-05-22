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
    type: String, // or Number if you prefer
    required: function () {
      return this.role !== 'landlord' && this.role !== 'tenant';
    },
  },

  role: {
    type: String,
    enum: ['admin', 'user', 'landlord', 'tenant'],
    default: 'user',
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model('User', userSchema);
