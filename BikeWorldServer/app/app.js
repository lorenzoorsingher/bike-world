const express = require('express');
const app = express();
const cors = require('cors');
const path = require('path');

const tokenChecker = require('./utils/tokenGenerator.js');

const rental = require('./routes/rental.js');
const bike = require('./routes/bike.js');
const booking = require('./routes/booking.js');
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
 * Manage rental(add rental point, get rental point, modify, remove filter rental point) routing and middleware
*/
app.use('/api/v1/rental', rental);

/**
 * Manage booking routing and middleware
*/
app.use('/api/v1/booking', booking);

/**
 * Manage bike(add rental bike, get rental point, remove) routing and middleware
*/
app.use('/api/v1/bike', bike);

/**
 * Manage user
 */
app.use('/api/v1/users', user);

/**
 * Serve front-end static files
 */
app.use('/', express.static(path.join(__dirname + '../../../BikeWorldFrontEnd/dist/bike-world-front-end')));

/* Default 404 handler */
app.use((req, res) => {
  res.status(404);
  res.json({ error: 'Not found' });
});


module.exports = app;