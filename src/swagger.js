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
    servers: [
      {
        url: `${process.env.API_BASE_URL}`
      }
    ],
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
            username: { type: 'string', example: '' },
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
        },
        Discounts: {
          type: 'object',
          properties: {
            title: { type: 'string', example: 'Desconto INSS' },
            description: { type: 'string', example: 'Desconto aplicado ao INSS' },
            discountType: { type: 'string', enum: ['percent', 'fixed'], example: 'percent' },
            value: { type: 'number', example: 10.5 },
            applicableTo: { type: 'string', example: 'faixa salarial' },
            startDate: { type: 'string', format: 'date', example: '2024-01-01' },
            endDate: { type: 'string', format: 'date', example: '2024-12-31' },
            progressive: { type: 'boolean', example: false },
            minValue: { type: 'number', example: 100.0 },
            maxValue: { type: 'number', example: 1000.0 },
            baseCalculation: { type: 'string', enum: ['bruto', 'liquido', 'outros'], example: 'bruto' },
            priority: { type: 'integer', example: 1 },
          },
        },
      }
    },
    security: [{ bearerAuth: [] }],
  },
  apis: ['./src/routes/*.js'],
  // apis: ['./src/authUserRoutes.js', './src/protectedRoutes.js'] // Certifique-se de incluir os caminhos corretos
};


const swaggerDocs = swaggerJsDoc(swaggerOptions);
module.exports = swaggerDocs;
