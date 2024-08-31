// src/app.js

require('dotenv').config();
const express = require('express');
const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('./src/swagger');
const { sequelize } = require('./models');
const responseFormatter = require('./src/middleware/responseFormatter');
const errorHandler = require('./src/middleware/errorHandler');

// const authUserRoutes = require('./src/authUserRoutes');
// const protectedRoutes = require('./src/protectedRoutes');
const authRoutes = require('./src/routes/authRoutes');
const userRoutes = require('./src/routes/userRoutes');

const app = express();

app.use(express.json());
app.use(responseFormatter); // Usar o middleware
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.use('/api', authRoutes);
app.use('/api', userRoutes);

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