const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
  const token = req.header('Authorization') && req.header('Authorization').replace('Bearer ', '');

  if (!token) {
    return res.status(401).json({ msg: 'No token, authorization denied' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    // console.log("Decoded token:", decoded); // For debugging: 'hi' changed to 'Decoded token:'

    // req.user will now have { id: <user_id>, role: <user_role> }
    req.user = decoded;
    next();
  } catch (err) {
    console.error('Token validation error:', err); // More descriptive error log
    return res.status(401).json({ msg: 'Token is not valid' });
  }
};

module.exports = authMiddleware;