const express = require('express');
const router = express.Router();
const Bike = require('../../models/bike');
const RentalPoint = require('../../models/rentalPoint');
const verifyToken = require('../../middleware/auth');
const { findById } = require('../../models/bike');

// ---------------------------------------------------------
// route to add new bike
// ---------------------------------------------------------
router.post('', verifyToken, async function (req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
    res.setHeader('Access-Control-Allow-Credentials', true);

    console.log("RICEVUTO")

    res.status(201).json({
        success: true,
        message: 'Form received!'
    });
});

module.exports = router;