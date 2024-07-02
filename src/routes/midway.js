const jwt = require('jsonwebtoken');
const user = require('./authenticate');

let checkToken = (req, res, next) => {
  let token = req.headers['x-access-token'] || req.headers['authorization'];
  console.log('Token:', token);  // Debugging line
  if (token) {
    jwt.verify(token, 'prnv', (err, decoded) => {
      if (err) {
        console.error("Token verification error:", err);
        return res.status(401).json({
          error: {
            status: 401,
            message: 'Unauthorized: Invalid token'
          }
        });
      } else {
        console.log('Decoded:', decoded);  // Debugging line
        if (user.user) {
          if (user.user.username === decoded.username && user.user.password === decoded.password) {
            req.decoded = decoded;
            console.log("Token successfully checked");
            next();
          } else {
            return res.status(401).json({
              error: {
                status: 401,
                message: 'Unauthorized: User credentials do not match'
              }
            });
          }
        } else {
          return res.status(401).json({
            error: {
              status: 401,
              message: 'Unauthorized: User not found'
            }
          });
        }
      }
    });
  } else {
    console.error("No token provided");
    return res.status(401).json({
      error: {
        status: 401,
        message: 'Unauthorized: No token provided'
      }
    });
  }
};

module.exports = {
  checkToken: checkToken
};
