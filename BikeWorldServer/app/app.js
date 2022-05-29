const express = require('express');
const app = express();
const cors = require('cors');
const path = require('path');

const tokenChecker = require('./utils/tokenGenerator.js');

const rental = require('./routes/v1/rentals.js');
const bike = require('./routes/v1/bikes.js');
const booking = require('./routes/v1/bookings.js');
const user = require('./routes/v1/users.js');
const rentalV2 = require('./routes/v2/rentals.js');
const bikeV2 = require('./routes/v2/bikes.js');
const bookingV2 = require('./routes/v2/bookings.js');
const userV2 = require('./routes/v2/users.js');
const damage = require('./routes/v2/damages.js');

const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');
const YAML = require('yamljs');
const swaggerDocument = YAML.load(path.join(__dirname, '../api-docs.yaml'));

/**
 * Configure Express.js parsing middleware
 */
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

const swaggerOptions = {
  swaggerOptions: {
    url: "/api/v1/api-docs/swagger.json",
  }
};

app.get("/api/v1/api-docs/swagger.json", (req, res) => res.json(swaggerDocument));
app.use(
  "/api/v1/api-docs",
  swaggerUi.serveFiles(null, swaggerOptions),
  swaggerUi.setup(null, swaggerOptions)
);

/**
 * Manage rental(add rental point, get rental point, modify, remove filter rental point) routing and middleware
*/
app.use('/api/v1/rentals', rental);
app.use('/api/v2/rentals', rentalV2);

/**
 * Manage booking routing and middleware
*/
app.use('/api/v1/bookings', booking);
app.use('/api/v2/bookings', bookingV2);

/**
 * Manage bike(add rental bike, get rental point, remove) routing and middleware
*/
app.use('/api/v1/bikes', bike);
app.use('/api/v2/bikes', bikeV2);

/**
 * Manage user
 */
app.use('/api/v1/users', user);
app.use('/api/v2/users', userV2);

/**
 * Manage damage reports
*/
app.use('/api/v2/damage', damage);

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