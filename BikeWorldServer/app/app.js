const express = require('express');
const app = express();
const tokenChecker = require('./tokenChecker.js');
const account = require('./account.js');
const rental = require('./rental.js');
var cors = require('cors');

/**
 * Configure Express.js parsing middleware
 */
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());


/**
 * Serve front-end static files
 */
app.use('/', express.static('static'));

/**
 * Manage account(authentications, signUp, modify) routing and middleware
*/
app.use('/api/v1/account', account);

/**
 * Manage rental(add rental point, get rental point, modify) routing and middleware
*/
app.use('/api/v1/rental', rental);

/* Default 404 handler */
app.use((req, res) => {
    res.status(404);
    res.json({ error: 'Not found' });
});


module.exports = app;






