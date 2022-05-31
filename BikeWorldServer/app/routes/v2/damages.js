const express = require('express');
const router = express.Router();
const Bike = require('../../models/bike');
const Damage = require('../../models/damage');
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

    console.log(req.body)
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
    //console.log("gettato")
    // get the bikes
    let reports = await Damage.find({});
    console.log(reports)
    res.status(200).json(reports.map(reports => {
        return {
            _id: reports._id,
            id: reports.id,
            description: reports.description
            //self: "/api/v2/bikes/" + bike._id
        }
    }));
});

router.get('/id', verifyToken, async function (req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
    res.setHeader('Access-Control-Allow-Credentials', true);
    //console.log("gettato")
    // get the bikes
    if (!req.params.id) {
        res.status(400).json({ success: false, message: 'Bad Request. Check docs for required parameters. /api/v2/api-docs' });
        return;
    }

    // find the bike
    let report = await Damage.findById(req.params.id);
    if (report == null) {
        res.status(404).json({
            success: false,
            message: 'Report not found'
        });
        return;
    }

    res.status(200).json({
        _id: bike._id,
        code: bike.code,
        model: bike.model,
        type: bike.type,
        rentalPointName: bike.rentalPointName,
        state: bike.state,
        self: "/api/v2/bikes/" + bike._id
    });
});

module.exports = router;