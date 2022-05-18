const express = require('express');
const router = express.Router();
const Bike = require('../models/bike'); // get our mongoose model
const RentalPoint = require('../models/rentalPoint'); // get our mongoose model
const jwt = require('jsonwebtoken'); // used to create, sign, and verify tokens

// ---------------------------------------------------------
// route to add new bike
// ---------------------------------------------------------
router.post('', async function(req, res) {
	res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
    res.setHeader('Access-Control-Allow-Credentials', true);

    // find the rental Point
	let bikeAlreadyExists = await Bike.findOne({
		code: req.body.code
	}).exec();
	
	// bike already exists
	if (bikeAlreadyExists) {
		res.json({ success: false, message: 'Creation bike failed. Bike already exists.' });
		return;	//to stop the execution of the function	
	}

    //save user in the db
    const newBike = new Bike({code: req.body.code, model: req.body.model, type: req.body.type, rentalPointName: req.body.rentalPointName, state: true});
    await newBike.save();

	//find the rental Point
	let rentalPoint = await RentalPoint.findOne({
		name: req.body.rentalPointName
	}).exec();

	//add bike from rental Point
	await RentalPoint.updateOne({'name': rentalPoint.name}, {$set: {'bikeNumber': rentalPoint.bikeNumber + 1}});

	res.json({
		success: true,
		message: 'New Bike added!'
	});

});


// ---------------------------------------------------------
// route to get bikes
// ---------------------------------------------------------
router.get('', async function(req, res) {
	res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
    res.setHeader('Access-Control-Allow-Credentials', true);
	
	// get the bikes
	let bikes = await Bike.find( { }).exec();	
	res.json({bikes});
});


// ---------------------------------------------------------
// route to get bike searched by code
// ---------------------------------------------------------
router.get('/code', async function(req, res) {
	res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
    res.setHeader('Access-Control-Allow-Credentials', true);
	
	// find the bike
	let bike = await Bike.findOne( { 'code': req.query.code }).exec();
	res.json({bike});
});

// ---------------------------------------------------------
// route to delete bike
// ---------------------------------------------------------
router.delete('', async function(req, res) {
	res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
    res.setHeader('Access-Control-Allow-Credentials', true);
	console.log(req.query.code);
	// remove the bike
	await Bike.deleteOne( { code: req.query.code}).exec();

	//find the rental Point
	let rentalPoint = await RentalPoint.findOne({
		name: req.query.rentalPointName
	}).exec();

	//remove bike from rental Point
	await RentalPoint.updateOne({'name': rentalPoint.name}, {$set: {'bikeNumber': rentalPoint.bikeNumber - 1}});

	res.json({
		success: true,
		message: 'Bike deleted!'
	});
});

// ---------------------------------------------------------
// route to repare bike
// ---------------------------------------------------------
router.put('', async function(req, res) {
	res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type, Accept, Origin');
    res.setHeader('Access-Control-Allow-Credentials', true);
	
	// find the bike
	let bike = await Bike.findOne({
		name: req.body.code
	}).exec();

	//find the rental Point
	let rentalPoint = await RentalPoint.findOne({
		name: req.body.rentalPointName
	}).exec();

	if(bike.state == true){
		//put bike in reparation
		await Bike.updateOne({'code': req.body.code}, {$set: {'state': false}});

		//remove bike from rental Point
		await RentalPoint.updateOne({'name': rentalPoint.name}, {$set: {'bikeNumber': rentalPoint.bikeNumber - 1}});

		res.json({
			success: true,
			message: 'Bike put in reparation!'
		});
	} else {
		//repare bike
		await Bike.updateOne({'code': req.body.code}, {$set: {'state': true}});

		//add bike from rental Point
		await RentalPoint.updateOne({'name': rentalPoint.name}, {$set: {'bikeNumber': rentalPoint.bikeNumber + 1}});

		res.json({
			success: true,
			message: 'Bike repared!'
		});
	}

});

module.exports = router;