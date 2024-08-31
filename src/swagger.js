// src/swagger.js

const swaggerJsDoc = require('swagger-jsdoc');

const swaggerOptions = {
  swaggerDefinition: {
    openapi: '3.0.0',
    info: {
      title: 'API',
      version: '1.0.0',
      description: 'Documentação da API'
    },
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        }
      },
      schemas: {
        User: {
          type: 'object',
          properties: {
            id: { type: 'integer' },
            username: { type: 'string' },
            email: { type: 'string' },
            firstName: { type: 'string' },
            lastName: { type: 'string' },
            document: { type: 'string' },
            mobile: { type: 'string' },
            phone: { type: 'string' },
            gender: { type: 'string', enum: ['M', 'F', 'U'] },
            active: { type: 'boolean' },
            roles: { type: 'array', items: { type: 'string' } },
            tags: { type: 'array', items: { type: 'string' } },
            birth: { type: 'string', format: 'date' },
            notes: { type: 'string' },
            affiliate: { type: 'string' },
            isStaff: { type: 'boolean' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          }
        },
        UserRegister: {
          type: 'object',
          properties: {
            username: { type: 'string', example: ''},
            email: { type: 'string', example: '' },
            password: { type: 'string', example: '' },
            firstName: { type: 'string', example: '' },
            lastName: { type: 'string', example: '' },
            document: { type: 'string', example: '' },
            mobile: { type: 'string', example: '' },
            phone: { type: 'string', example: '' },
            gender: { type: 'string', enum: ['M', 'F', 'U'], example: '' },
            roles: { type: 'array', items: { type: 'string' } },
            tags: { type: 'array', items: { type: 'string' } },
            birth: { type: 'string', format: 'date', example: '' },
            notes: { type: 'string', example: '' },
          }
        },
        UserUpdate: {
          type: 'object',
          properties: {
            firstName: { type: 'string', example: '' },
            lastName: { type: 'string', example: '' },
            document: { type: 'string', example: '' },
            mobile: { type: 'string', example: '' },
            phone: { type: 'string', example: '' },
            gender: { type: 'string', enum: ['M', 'F', 'U'], example: '' },
            roles: { type: 'array', items: { type: 'string' } },
            tags: { type: 'array', items: { type: 'string' } },
            birth: { type: 'string', format: 'date', example: '' },
            notes: { type: 'string', example: '' },
          }
        }
      }
    },
    security: [{ bearerAuth: [] }],
  },
  apis: ['./src/routes/*.js'],
  // apis: ['./src/authUserRoutes.js', './src/protectedRoutes.js'] // Certifique-se de incluir os caminhos corretos
};

const swaggerDocs = swaggerJsDoc(swaggerOptions);
module.exports = swaggerDocs;
