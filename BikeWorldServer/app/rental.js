const express = require('express');
const router = express.Router();
const RentalPoint = require('./models/rentalPoint'); // get our mongoose model
const jwt = require('jsonwebtoken'); // used to create, sign, and verify tokens

// ---------------------------------------------------------
// route to add new rental point
// ---------------------------------------------------------
router.post('', async function(req, res) {
	res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
    res.setHeader('Access-Control-Allow-Credentials', true);

    // find the rental Point
	let rentalPointAlreadyExists = await RentalPoint.findOne({
		name: req.body.name
	}).exec();
	
	// rental point already exists
	if (rentalPointAlreadyExists) {
		res.json({ success: false, message: 'Creation rental point failed. Rental point already exists.' });
		return;	//to stop the execution of the function	
	}

    //save user in the db
    const newRentalPoint = new RentalPoint({name: req.body.name, address: req.body.address, lat: parseFloat(req.body.lat), lng: parseFloat(req.body.lng), bikeNumber: parseInt(req.body.bikeNumber)});
    await newRentalPoint.save();

	res.json({
		success: true,
		message: 'New Rental Point added!'
	});

});


// ---------------------------------------------------------
// route to get rental point
// ---------------------------------------------------------
router.get('', async function(req, res) {
	res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
    res.setHeader('Access-Control-Allow-Credentials', true);
	
	// find the rental points
	let rentalPoints = await RentalPoint.find( { }).exec();	
	res.json({rentalPoints});
});

// ---------------------------------------------------------
// route to delete rental point
// ---------------------------------------------------------
router.delete('', async function(req, res) {
	res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
    res.setHeader('Access-Control-Allow-Credentials', true);
	
	// remove the rental points
	await RentalPoint.deleteOne( { name: req.query.name}).exec();
	res.json({
		success: true,
		message: 'Rental Point deleted!'
	});
});
// ---------------------------------------------------------
// route to update rental point info
// ---------------------------------------------------------
router.put('', async function(req, res) {
	res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type, Accept, Origin');
    res.setHeader('Access-Control-Allow-Credentials', true);
	
    //update rental point in the db
	await RentalPoint.updateOne({'name': req.body.name}, {$set: {'address': req.body.address,'lat': req.body.lat, 'lng': req.body.lng, 'bikeNumber': req.body.bikeNumber}});

	res.json({
		success: true,
		message: 'Rental point info updated!'
	});

});

module.exports = router;