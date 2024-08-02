// src/app.js

const express = require('express');
const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('./swagger');
const { sequelize } = require('../models');
const responseFormatter = require('./middleware/responseFormatter');
const errorHandler = require('./middleware/errorHandler');

const authUserRoutes = require('./authUserRoutes');
const protectedRoutes = require('./protectedRoutes');

const app = express();

app.use(express.json());
app.use(responseFormatter); // Usar o middleware
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.use('/api', authUserRoutes);
app.use('/api', protectedRoutes);

// Middleware de tratamento de erros deve ser o último middleware a ser usado
app.use(errorHandler);

const PORT = process.env.PORT || 3000;

sequelize.sync().then(() => {
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
}).catch(err => {
  console.error('Unable to connect to the database:', err);
});
