const User = require('../models/User-model');

const roleMiddleware = (requiredRole) => {
  return (req, res, next) => {
    User.findById(req.user.id) 
      .then(user => {
        if (!user) {
          return res.status(404).json({ msg: 'User not found' });
        }

        console.log('User role:', user.role);  

        if (user.role !== requiredRole) {
          return res.status(403).json({ msg: 'Access denied, insufficient privileges' });
        }

        next(); 
      })
      .catch(err => {
        console.error(err);
        return res.status(500).json({ msg: 'Server error' });
      });
  };
};

module.exports = roleMiddleware;
