const express = require('express');
const app = express();
var cors = require('cors');

const verifyToken = require('./middleware/auth.js');

const user = require('./routes/user.js');

const swaggerJsdoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");

/**
 * Configure Express.js parsing middleware
 */
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

const swaggerOptions = {
    definition: {
      openapi: '3.0.0',
      info: {
        title: 'Bike World',
        version: '1',
      },
    },
    baseDir: __dirname,
    apis: ['./app/routes/*.js']
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);
app.use(
    "/api/v1/api-docs",
    swaggerUi.serve,
    swaggerUi.setup(swaggerSpec)
);

/**
 * Serve front-end static files
 */
app.use('/', express.static('static'));

/**
 * Routes
 */
app.use('/api/v1/users', user);

/* Default 404 handler */
app.use((req, res) => {
    res.status(404);
    res.json({ error: 'Not found' });
});


module.exports = app;