const express = require('express');
const router = express.Router();
const Bike = require('../models/bike');
const RentalPoint = require('../models/rentalPoint');
const verifyToken = require('../middleware/auth');
const { findById } = require('../models/bike');

// ---------------------------------------------------------
// route to add new bike
// ---------------------------------------------------------
router.post('', verifyToken, async function(req, res) {
	res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
    res.setHeader('Access-Control-Allow-Credentials', true);

	if(!req.body.code || !req.body.model || !body.type || !req.body.rentalPointName){
		res.status(400).json({ success: false, message: 'Bad Request. Check docs for required parameters. /api/v1/api-docs' });	
		return;
	}

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
		message: 'New Bike added!',
		bike: {
			_id: newBike._id,
			code: newBike.code,
			model: newBike.model,
			type: newBike.type,
			rentalPointName: newBike.rentalPointName,
			state: newBike.state,
			self: "/api/v1/bikes/" + newBike._id
		}
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
			state: bike.state,
			self: "/api/v1/bikes/" + bike._id
		}
	}));
});


// ---------------------------------------------------------
// route to get bike
// ---------------------------------------------------------
router.get('/:id', verifyToken, async function(req, res) {
	res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
    res.setHeader('Access-Control-Allow-Credentials', true);
	
	if(!req.params.id){
		res.status(400).json({ success: false, message: 'Bad Request. Check docs for required parameters. /api/v1/api-docs' });	
		return;
	}

	// find the bike
	let bike = await Bike.findById(req.params.id);
	if(bike == null){
		res.status(404).json({
			success: false,
			message: 'Bike not found'
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
		self: "/api/v1/bikes/" + bike._id
	});
});

// ---------------------------------------------------------
// route to delete bike
// ---------------------------------------------------------
router.delete('/:id', verifyToken, async function(req, res) {
	res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
    res.setHeader('Access-Control-Allow-Credentials', true);
	
	if(!req.params.id){
		res.status(400).json({ success: false, message: 'Bad Request. Check docs for required parameters. /api/v1/api-docs' });	
		return;
	}

	// remove the bike
	let bike = await Bike.findById(req.params.id);
	if(bike == null){
		res.status(404).json({
			success: false,
			message: 'Bike not found'
		});
		return;
	}

	const rentalPointName = bike.rentalPointName;

	await Bike.deleteOne({ _id: req.params.id });

	//find the rental Point
	let rentalPoint = await RentalPoint.findOne({
		name: rentalPointName
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
router.patch('/:id', verifyToken, async function(req, res) {
	res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type, Accept, Origin');
    res.setHeader('Access-Control-Allow-Credentials', true);
	
	if(!req.params.id){
		res.status(400).json({ success: false, message: 'Bad Request. Check docs for required parameters. /api/v1/api-docs' });	
		return;
	}
	
	// find the bike
	let bike = await Bike.findById(req.params.id);
	if(bike == null){
		res.status(404).json({
			success: false,
			message: 'Bike not found'
		});
		return;
	}

	//find the rental Point
	let rentalPoint = await RentalPoint.findOne({
		name: bike.rentalPointName
	});
	
	if(bike.state){
		//put bike in reparation
		await Bike.updateOne({'_id': req.params.id}, {$set: {'state': false}});
		
		//remove bike from rental Point
		await RentalPoint.updateOne({'name': rentalPoint.name}, {$set: {'bikeNumber': rentalPoint.bikeNumber - 1}});

		res.status(200).json({
			success: true,
			message: 'Bike put in reparation!'
		});
	} else {
		//repare bike
		await Bike.updateOne({'_id': req.params.id}, {$set: {'state': true}});

		//add bike from rental Point
		await RentalPoint.updateOne({'name': rentalPoint.name}, {$set: {'bikeNumber': rentalPoint.bikeNumber + 1}});

		res.status(200).json({
			success: true,
			message: 'Bike repared!'
		});
	}
});

module.exports = router;