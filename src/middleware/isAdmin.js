// src/middleware/isAdmin.js

const isAdmin = (req, res, next) => {
    if (req.user && req.user.isStaff) {
      next();
    } else {
      res.status(401).json({
        message: 'Access Denied! Not staff!'
      });
    }
  };
  
  module.exports = isAdmin;
  