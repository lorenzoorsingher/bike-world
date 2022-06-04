const express = require('express');
const router = express.Router();
const Bike = require('../../models/bike');
const RentalPoint = require('../../models/rentalPoint');
const Booking = require('../../models/booking.js');
const Damage = require('../../models/damage')
const verifyToken = require('../../middleware/auth');
const { findById } = require('../../models/bike');
const review = require('../../models/review');

// ---------------------------------------------------------
// route to add new bike
// ---------------------------------------------------------
router.post('', verifyToken, async function (req, res) {
	res.setHeader('Access-Control-Allow-Origin', '*');
	res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
	res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
	res.setHeader('Access-Control-Allow-Credentials', true);

	if (!req.body.code || !req.body.model || !req.body.type || !req.body.rentalPointName) {
		res.status(400).json({ success: false, message: 'Bad Request. Check docs for required parameters. /api/api-docs' });
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

	//find the rental Point
	let rentalPoint = await RentalPoint.findOne({
		name: req.body.rentalPointName
	});

	if (rentalPoint == null) {
		return res.status(404).json({ success: false, message: 'Creation bike failed. Rental Point not found' });
	}

	//save user in the db
	const newBike = await Bike.create({
		code: req.body.code,
		model: req.body.model,
		type: req.body.type,
		rentalPointName: req.body.rentalPointName,
		state: true
	});


	//add bike from rental Point
	await RentalPoint.updateOne({ 'name': rentalPoint.name }, { $set: { 'bikeNumber': rentalPoint.bikeNumber + 1 } });

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
			self: "/api/v2/bikes/" + newBike._id
		}
	});
});


// ---------------------------------------------------------
// route to get bikes
// ---------------------------------------------------------
router.get('', verifyToken, async function (req, res) {
	res.setHeader('Access-Control-Allow-Origin', '*');
	res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
	res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
	res.setHeader('Access-Control-Allow-Credentials', true);

	// get the bikes
	let bikes = await Bike.find({});
	res.status(200).json(bikes.map(bike => {
		return {
			_id: bike._id,
			code: bike.code,
			model: bike.model,
			type: bike.type,
			rentalPointName: bike.rentalPointName,
			state: bike.state,
			self: "/api/v2/bikes/" + bike._id
		}
	}));
});

// ---------------------------------------------------------
// route to get bike searched by code
// ---------------------------------------------------------
router.get('/code', verifyToken, async function (req, res) {
	res.setHeader('Access-Control-Allow-Origin', '*');
	res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
	res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
	res.setHeader('Access-Control-Allow-Credentials', true);

	if (!req.query.code) {
		res.status(400).json({ success: false, message: 'Bad Request. Check docs for required parameters. /api/api-docs' });
		return;
	}

	// find the bike
	let bike = await Bike.findOne({ 'code': req.query.code });
	if (bike == null) {
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
		self: "/api/v2/bikes/code/" + bike._id
	});
});

// ---------------------------------------------------------
// route to get bike
// ---------------------------------------------------------
router.get('/:id', verifyToken, async function (req, res) {
	res.setHeader('Access-Control-Allow-Origin', '*');
	res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
	res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
	res.setHeader('Access-Control-Allow-Credentials', true);

	if (!req.params.id) {
		res.status(400).json({ success: false, message: 'Bad Request. Check docs for required parameters. /api/api-docs' });
		return;
	}

	// find the bike
	let bike = await Bike.findById(req.params.id);
	if (bike == null) {
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
		self: "/api/v2/bikes/" + bike._id
	});
});


// ---------------------------------------------------------
// route to delete bike
// ---------------------------------------------------------
router.delete('/:id', verifyToken, async function (req, res) {
	res.setHeader('Access-Control-Allow-Origin', '*');
	res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
	res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
	res.setHeader('Access-Control-Allow-Credentials', true);

	if (!req.params.id) {
		res.status(400).json({ success: false, message: 'Bad Request. Check docs for required parameters. /api/api-docs' });
		return;
	}

	// remove the bike
	let bike = await Bike.findById(req.params.id);
	if (bike == null) {
		res.status(404).json({
			success: false,
			message: 'Bike not found'
		});
		return;
	}

	const rentalPointName = bike.rentalPointName;

	//find the rental Point
	let rentalPoint = await RentalPoint.findOne({
		name: rentalPointName
	});

	// remove all booking associated to this rental point
	await Booking.deleteMany({ bikeCode: bike.code });
	await Bike.deleteOne({ _id: req.params.id });
	await Damage.deleteMany({ bikeCode: bike.code})


	//remove bike from rental Point
	await RentalPoint.updateOne({ 'name': rentalPoint.name }, { $set: { 'bikeNumber': rentalPoint.bikeNumber - 1 } });

	res.status(200).json({
		success: true,
		message: 'Bike deleted!'
	});
});

// ---------------------------------------------------------
// route to repare bike
// ---------------------------------------------------------
router.patch('/:id', verifyToken, async function (req, res) {
	res.setHeader('Access-Control-Allow-Origin', '*');
	res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
	res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type, Accept, Origin');
	res.setHeader('Access-Control-Allow-Credentials', true);

	if (!req.params.id) {
		res.status(400).json({ success: false, message: 'Bad Request. Check docs for required parameters. /api/api-docs' });
		return;
	}

	// find the bike
	let bike = await Bike.findById(req.params.id);
	if (bike == null) {
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

	/* non serve poichè il rental point esiste necessariamente se riesco ad associarlo alla bicicletta
	if(rentalPoint == null){
		res.status(404).json({
			success: false,
			message: 'Rental point not found'
		});
		return;
	}
	*/

	if (bike.state) {

		//put bike in reparation
		await Bike.updateOne({ '_id': req.params.id }, { $set: { 'state': false } });

		//remove bike from rental Point
		await RentalPoint.updateOne({ 'name': rentalPoint.name }, { $set: { 'bikeNumber': rentalPoint.bikeNumber - 1 } });

		res.status(200).json({
			success: true,
			message: 'Bike put in reparation!'
		});
	} else {
		//repare bike
		await Bike.updateOne({ '_id': req.params.id }, { $set: { 'state': true } });

		//add bike from rental Point
		await RentalPoint.updateOne({ 'name': rentalPoint.name }, { $set: { 'bikeNumber': rentalPoint.bikeNumber + 1 } });

		res.status(200).json({
			success: true,
			message: 'Bike repared!'
		});
	}
});

module.exports = router;