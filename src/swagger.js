// src/swagger.js

const swaggerJsDoc = require('swagger-jsdoc');

const swaggerOptions = {
  swaggerDefinition: {
    openapi: '3.0.0',
    info: {
      title: 'API Documentação',
      description: 'Documentação da API',
      version: '1.0.0',
      contact: {
        name: 'Desenvolvedor'
      },
      servers: ['http://localhost:3000']
    },
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        }
      }
    },
    security: [{
      bearerAuth: []
    }]
  },
  apis: ['./src/authUserRoutes.js', './src/protectedRoutes.js'] // Certifique-se de incluir os caminhos corretos
};

const swaggerDocs = swaggerJsDoc(swaggerOptions);
module.exports = swaggerDocs;
