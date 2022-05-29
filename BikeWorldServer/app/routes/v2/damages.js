const express = require('express');
const router = express.Router();
const Bike = require('../../models/bike');
const Damage = require('../../models/damage');
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

    console.log(req.body.description)
    console.log(req.body.id)

    console.log("RICEVUTO")
    if (!req.body.id || !req.body.description) {
        res.status(400).json({ success: false, message: 'Bad Request. Check docs for required parameters. /api/v2/api-docs' });
        return;
    }


    //save user in the db
    const newDamage = await Damage.create({
        id: req.body.id,
        description: req.body.description,
        state: true
    });

    res.status(201).json({
        success: true,
        message: 'Form received!'
    });
});


module.exports = router;