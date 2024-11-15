const jwt = require('jsonwebtoken');
const { expressjwt: expressjwt } = require("express-jwt");

require('dotenv').config();

const JWT_SECRET = process.env.JWT_SECRET;

// Middleware to verify JWT token
const verifyToken = expressjwt({
  secret: JWT_SECRET,
  algorithms: ['HS256'],
  credentialsRequired: true, // Ensures token is required for all routes
});

// Middleware to check if the user has the correct role (admin or employee)
const authorizeRole = (role) => {
  return (req, res, next) => {
    if (req.user.role !== role) {
      return res.status(403).send('Forbidden: Insufficient privileges');
    }
    next();
  };
};

// Middleware to get user data from the token (e.g., userId, role)
const getUserFromToken = (req, res, next) => {
  const token = req.headers.authorization && req.headers.authorization.split(' ')[1];
  if (token) {
    jwt.verify(token, JWT_SECRET, (err, decoded) => {
      if (err) {
        return res.status(401).send('Unauthorized');
      }
      req.user = decoded; // Attach user data (userId, role) to the request
      next();
    });
  } else {
    return res.status(401).send('Unauthorized');
  }
};

module.exports = { verifyToken, authorizeRole, getUserFromToken };
