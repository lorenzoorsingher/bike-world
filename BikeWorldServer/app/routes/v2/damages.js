const express = require('express');
const router = express.Router();
const Bike = require('../../models/bike');
const Damage = require('../../models/damage');
const verifyToken = require('../../middleware/auth');
const { findById } = require('../../models/bike');

// ---------------------------------------------------------
// route to add new report
// ---------------------------------------------------------
router.post('', verifyToken, async function (req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
    res.setHeader('Access-Control-Allow-Credentials', true);

    if (!req.body.code || !req.body.description) {
        res.status(400).json({ success: false, message: 'Bad Request. Check docs for required parameters. /api/v2/api-docs' });
        return;
    }

    //Check if bike exists
    let bike = await Bike.findOne({ code: req.body.code });
    if(bike == null){
        res.status(404).json({
            success: false,
            message: `Bike with code: ${req.body.code} not found.`
        });
        return;
    }

    //save damage in the db
    const newDamage = await Damage.create({
        bikeCode: req.body.code,
        description: req.body.description,
        state: true
    });

    res.status(201).json({
        success: true,
        message: 'Report ricevuto correttamente!'
    });
});

// ---------------------------------------------------------
// route to get reports
// ---------------------------------------------------------
router.get('', verifyToken, async function (req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
    res.setHeader('Access-Control-Allow-Credentials', true);
    
    // get the bikes
    let reports = await Damage.find({});
    res.status(200).json(reports.map(reports => {
        return {
            _id: reports._id,
            bikeCode: reports.bikeCode,
            description: reports.description
        }
    }));
});

module.exports = router;