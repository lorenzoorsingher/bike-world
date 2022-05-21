const express = require('express');
const router = express.Router();
const Bike = require('../models/bike');
const RentalPoint = require('../models/rentalPoint');
const verifyToken = require('../middleware/auth');

// ---------------------------------------------------------
// route to add new bike
// ---------------------------------------------------------
router.post('', verifyToken, async function(req, res) {
	res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
    res.setHeader('Access-Control-Allow-Credentials', true);
	console.log("arrived");
    // find the rental Point
	let bikeAlreadyExists = await Bike.findOne({
		code: req.body.code
	});
	
	// bike already exists
	if (bikeAlreadyExists) {
		res.status(409).json({ success: false, message: 'Creation bike failed. Bike already exists.' });
		return;
	}

    //save user in the db
    const newBike = await Bike.create({
		code: req.body.code, 
		model: req.body.model, 
		type: req.body.type, 
		rentalPointName: req.body.rentalPointName, 
		state: true
	});

	//find the rental Point
	let rentalPoint = await RentalPoint.findOne({
		name: req.body.rentalPointName
	});

	// todo add check to rental point

	//add bike from rental Point
	await RentalPoint.updateOne({'name': rentalPoint.name}, {$set: {'bikeNumber': rentalPoint.bikeNumber + 1}});

	res.status(201).json({
		success: true,
		message: 'New Bike added!'
	});

});


// ---------------------------------------------------------
// route to get bikes
// ---------------------------------------------------------
router.get('', verifyToken, async function(req, res) {
	res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
    res.setHeader('Access-Control-Allow-Credentials', true);
	
	// get the bikes
	let bikes = await Bike.find({ });	
	res.status(200).json(bikes.map(bike => {
		return {
			_id: bike._id,
			code: bike.code,
			model: bike.model,
			type: bike.type,
			rentalPointName: bike.rentalPointName,
			state: bike.state
		}
	}));
});


// ---------------------------------------------------------
// route to get bike searched by code
// ---------------------------------------------------------
router.get('/code', verifyToken, async function(req, res) {
	res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
    res.setHeader('Access-Control-Allow-Credentials', true);
	
	// find the bike
	let bike = await Bike.findOne( { 'code': req.query.code });
	res.status(200).json({
		_id: bike._id,
		code: bike.code,
		model: bike.model,
		type: bike.type,
		rentalPointName: bike.rentalPointName,
		state: bike.state
	});
});

// ---------------------------------------------------------
// route to delete bike
// ---------------------------------------------------------
router.delete('', verifyToken, async function(req, res) {
	res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
    res.setHeader('Access-Control-Allow-Credentials', true);
	
	// remove the bike
	await Bike.deleteOne({ code: req.query.code});

	//find the rental Point
	let rentalPoint = await RentalPoint.findOne({
		name: req.query.rentalPointName
	});

	//remove bike from rental Point
	await RentalPoint.updateOne({'name': rentalPoint.name}, {$set: {'bikeNumber': rentalPoint.bikeNumber - 1}});

	res.status(200).json({
		success: true,
		message: 'Bike deleted!'
	});
});

// ---------------------------------------------------------
// route to repare bike
// ---------------------------------------------------------
router.patch('', verifyToken, async function(req, res) {
	res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type, Accept, Origin');
    res.setHeader('Access-Control-Allow-Credentials', true);
	
	// find the bike
	let bike = await Bike.findOne({
		code: req.body.code
	});

	//find the rental Point
	let rentalPoint = await RentalPoint.findOne({
		name: req.body.rentalPointName
	});
	
	if(bike.state){
		//put bike in reparation
		await Bike.updateOne({'code': req.body.code}, {$set: {'state': false}});
		
		//remove bike from rental Point
		await RentalPoint.updateOne({'name': rentalPoint.name}, {$set: {'bikeNumber': rentalPoint.bikeNumber - 1}});

		res.status(200).json({
			success: true,
			message: 'Bike put in reparation!'
		});
	} else {
		//repare bike
		await Bike.updateOne({'code': req.body.code}, {$set: {'state': true}});

		//add bike from rental Point
		await RentalPoint.updateOne({'name': rentalPoint.name}, {$set: {'bikeNumber': rentalPoint.bikeNumber + 1}});

		res.status(200).json({
			success: true,
			message: 'Bike repared!'
		});
	}
});

module.exports = router;