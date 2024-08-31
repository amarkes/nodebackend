// src/middleware/responseFormatter.js

const responseFormatter = (req, res, next) => {
    res.formatList = (data, count, current, total, hasNextPage) => {
      return res.json({
        count: count,
        current: current || null,
        totalPage: total || null,
        hasNextPage,
        results: data
      });
    };
    next();
  };
  
  module.exports = responseFormatter;
  