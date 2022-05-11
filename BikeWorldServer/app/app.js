const express = require('express');
const app = express();
const tokenChecker = require('./tokenChecker.js');
const authentication = require('./authentication.js');
const account = require('./account.js');
const signup = require('./signup.js');

/**
 * Configure Express.js parsing middleware
 */
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


/**
 * Serve front-end static files
 */
app.use('/', express.static('static'));


/**
 * Authentication routing and middleware
 */
app.use('/api/v1/authentications', authentication);

/**
 * Signup routing and middleware
 */
app.use('/api/v1/signup', signup);

/**
 * Authentication routing and middleware
*/
app.use('/api/v1/account', account);

/* Default 404 handler */
app.use((req, res) => {
    res.status(404);
    res.json({ error: 'Not found' });
});


module.exports = app;






