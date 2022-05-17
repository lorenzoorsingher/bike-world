const express = require('express');
const app = express();
const tokenChecker = require('./tokenChecker.js');
//const account = require('./user.js');
const rental = require('./rental.js');
const bike = require('./bike.js');

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
 * Manage account(authentications, signUp, modify) routing and middleware
*/
//app.use('/api/v1/account', account);

/**
 * Manage rental(add rental point, get rental point, modify, remove filter rental point) routing and middleware
*/
app.use('/api/v1/rental', rental);

/**
 * Manage bike(add rental bike, get rental point, remove) routing and middleware
*/
app.use('/api/v1/bike', bike);

/* Routes
 */
app.use('/api/v1/users', user);

/* Default 404 handler */
app.use((req, res) => {
  res.status(404);
  res.json({ error: 'Not found' });
});


module.exports = app;