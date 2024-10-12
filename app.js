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
const discountRoutes = require('./src/routes/discountRoutes');
const { defaultErrorHandler } = require('./src/middleware/responseUtils');

const app = express();

const options = {
  customJs: '/custom.js', // Caminho para o JS customizado
};

app.use(express.json());
app.use(responseFormatter); // Usar o middleware
const isDev = process.env.NODE_ENV === 'development';

const swaggerOptions = isDev ? {} : options;

app.use('/api-reference', swaggerUi.serve, swaggerUi.setup(swaggerDocument, swaggerOptions));


app.get('/custom.js', (req, res) => {
  res.setHeader('Content-Type', 'application/javascript');
  res.send(`
    const token = '${process.env.TOKEN}'; // Seu token JWT do ambiente de desenvolvimento

      const interval = setInterval(() => {
        // Verifique se Swagger UI foi carregado
        const authButton = document.querySelector('.auth-wrapper .authorize');
        if (authButton) {
          clearInterval(interval);
          authButton.click(); // Abre o modal de autorização

          setTimeout(() => {
            const authInput = document.querySelector('#auth-bearer-value'); // O campo do token
            const authorizeButton = document.querySelector('.auth-btn-wrapper .authorize'); // Botão 'Authorize'
            const authorizeButton2 = document.querySelector('.auth-btn-wrapper .btn-done'); // Botão 'Authorize'

            if (authInput && authorizeButton) {
              authInput.setAttribute('value', token); // Define o valor do token usando setAttribute

              // Dispara o evento de 'input' para simular a interação real
              const inputEvent = new Event('input', { bubbles: true });
              authInput.dispatchEvent(inputEvent);

              // Dispara o evento de 'change' para garantir que o valor foi capturado
              const changeEvent = new Event('change', { bubbles: true });
              authInput.dispatchEvent(changeEvent);

              authorizeButton.click(); // Clica no botão 'Authorize'
              authorizeButton2.click(); // Clica no botão 'Authorize'
            }
          }, 500); // Timeout para garantir que o modal foi carregado
        }
      }, 100);
  `);
});




app.use('/services', authRoutes);
app.use('/services', userRoutes);
app.use('/services', discountRoutes);

// Middleware de tratamento de erros deve ser o último middleware a ser usado
// app.use(errorHandler);
app.use(defaultErrorHandler);

const PORT = process.env.PORT || 3000;

sequelize.sync().then(() => {
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    console.log(process.env.TOKEN)
  });
}).catch(err => {
  console.error('Unable to connect to the database:', err);
});
