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
   
    if (!req.body.id || !req.body.description) {
        res.status(400).json({ success: false, message: 'Bad Request. Check docs for required parameters. /api/v2/api-docs' });
        return;
    }

    //Check if bike exists
    let bike = await Bike.findById(req.body.id);
    if(bike == null){
        res.status(404).json({
            success: false,
            message: `Bike with id: ${req.body.id} not found.`
        });
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


module.exports = router;