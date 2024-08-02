// src/middleware/responseFormatter.js

const responseFormatter = (req, res, next) => {
    res.formatList = (data, count, next, previous) => {
      return res.json({
        count: count,
        next: next || null,
        previous: previous || null,
        results: data
      });
    };
    next();
  };
  
  module.exports = responseFormatter;
  