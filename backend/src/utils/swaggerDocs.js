const swaggerJsDoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

// Swagger definition
const swaggerOptions = {
    swaggerDefinition: {
        openapi: '3.0.0',
        info: {
            title: 'Task Management System API',
            version: '1.0.0',
            description: 'API for Collaborative Task Management System',
            license: {
                name: 'MIT',
                url: 'https://choosealicense.com/licenses/mit/'
            },
            contact: {
                name: 'API Support',
                url: 'https://www.example.com/support',
                email: 'support@example.com'
            }
        },
        servers: [
            {
                url: 'http://localhost:5000/api',
                description: 'Development server'
            },
            {
                url: 'https://task-management-production.com/api',
                description: 'Production server'
            }
        ],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT'
                }
            }
        },
        security: [
            {
                bearerAuth: []
            }
        ]
    },
    apis: ['./src/routes/*.js', './src/models/*.js']
};

const swaggerDocs = swaggerJsDoc(swaggerOptions);

module.exports = {
    swaggerUi,
    swaggerDocs
}; 